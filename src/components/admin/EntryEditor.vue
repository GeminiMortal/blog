<script setup>
// 后台条目编辑器：语言 Tab + 结构化字段 + MarkdownEditor 组件（正文/详细描述）+ 保存 + AI 填充英文
import { reactive, ref, computed, watch, onMounted } from 'vue'
import { filePathsFor } from '../../admin/schema.js'
import { parseFrontmatter, serializeDoc, readFileWithSha, writeFile, deleteFile, isLocal, getAiConfig, tencentTranslate, translateMarkdown } from '../../admin/api.js'
import MarkdownEditor from './MarkdownEditor.vue'

const props = defineProps({ col: { type: Object, required: true }, id: { type: String, default: '' } })
const emit = defineEmits(['back', 'saved'])

const locale = ref('zh')
const loading = ref(false)
const saving = ref(false)
const notice = ref('')

// 每语言一份 values；body 单独存
const doc = reactive({
  zh: { values: {}, body: '' },
  en: { values: {}, body: '' }
})

// 挂载瞬间模板就会渲染字段（load 是异步的），必须先同步塑形，
// 否则 object 字段 v-model 读取 undefined[k] 会抛错 → 组件渲染崩溃（部分条目打不开的根因）
ensureShape(doc.zh.values, props.col.fields)
ensureShape(doc.en.values, props.col.fields)

const fixed = computed(() => !!props.col.fixedId) // about/copy/settings：单语单文件（无共享拆分）
const localized = computed(() => props.col.localized)

// 当前语言文件里应出现的字段（字段列）：
// - 非 folder（about/copy/settings）：全部字段
// - folder zh：全部；folder en：仅 mark 字段
// - markdown 类字段（含 body）不在字段列渲染，统一到底部单个 MarkdownEditor，通过选择切换
const visibleFields = computed(() => {
  const base = !localized.value || fixed.value || locale.value === 'zh'
    ? props.col.fields
    : props.col.fields.filter(f => f.mark)
  return base.filter(f => f.type !== 'markdown')
})

// ── 单一 md 编辑器：可选择编辑对象（正文 / 详细描述…） ──
const mdTargets = computed(() => {
  const out = []
  if (props.col.fields.some(f => f.key === 'body')) out.push({ key: 'body', label: '正文' })
  for (const f of props.col.fields) {
    if (f.type === 'markdown' && f.key !== 'body') out.push({ key: f.key, label: f.label })
  }
  return out
})

const mdTarget = ref('body')
watch(mdTargets, ts => {
  if (!ts.some(t => t.key === mdTarget.value)) mdTarget.value = ts[0]?.key || ''
}, { immediate: true })

const mdValue = computed({
  get: () => mdTarget.value === 'body' ? doc[locale.value].body : doc[locale.value].values[mdTarget.value] || '',
  set: v => {
    if (mdTarget.value === 'body') doc[locale.value].body = v
    else doc[locale.value].values[mdTarget.value] = v
  }
})

function fieldDefault(f) {
  if (f.default !== undefined) return f.default
  if (f.type === 'list' || f.type === 'skills' || f.type === 'timeline' || f.type === 'facts') return []
  if (f.type === 'object') return Object.fromEntries((f.sub || []).map(k => [k, '']))
  if (f.type === 'number') return ''
  return ''
}

function ensureShape(values, fields) {
  for (const f of fields) {
    const v = values[f.key]
    if (v === undefined || v === null) { values[f.key] = fieldDefault(f); continue }
    if (f.type === 'object' && !Array.isArray(v)) {
      for (const k of f.sub || []) if (v[k] === undefined) v[k] = ''
    }
    if (f.type === 'skills') values[f.key] = (v || []).map(i => ({ name: i.name || '', items: (i.items || []).join('\n') }))
    if (f.type === 'timeline') values[f.key] = (v || []).map(i => ({ year: i.year || '', title: i.title || '', text: i.text || '' }))
    if (f.type === 'facts') values[f.key] = (v || []).map(i => ({ label: i.label || '', value: i.value || '', url: i.url || '' }))
  }
}

const shaMap = reactive({ zh: null, en: null })

async function load() {
  if (!props.id) {
    for (const l of ['zh', 'en']) { ensureShape(doc[l].values, props.col.fields); doc[l].body = '' }
    if (props.col.name === 'projects' || props.col.name === 'awards') doc.zh.values.name = props.id
    shaMap.zh = null
    shaMap.en = null
    return
  }
  loading.value = true
  try {
    const paths = filePathsFor(props.col, props.col.fixedId || props.id)
    const zhRes = await readFileWithSha(paths.zh)
    const enRes = paths.en ? await readFileWithSha(paths.en) : { content: null, sha: null }
    const zh = parseFrontmatter(zhRes.content || '')
    const en = parseFrontmatter(enRes.content || '')
    shaMap.zh = zhRes.sha
    shaMap.en = enRes.sha
    doc.zh.values = zh.data || {}
    doc.zh.body = zh.body || ''
    doc.en.values = en.data || {}
    doc.en.body = en.body || ''
    ensureShape(doc.zh.values, props.col.fields)
    ensureShape(doc.en.values, props.col.fields)
    if (!zhRes.content) {
      if ('name' in doc.zh.values && !doc.zh.values.name) doc.zh.values.name = props.col.fixedId || props.id
      if ('date' in doc.zh.values && !doc.zh.values.date) {
        const d = new Date()
        doc.zh.values.date = `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}.${d.getFullYear()}`
      }
    }
  } catch (err) {
    notice.value = '加载失败：' + err.message
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(() => props.id, load)

// ── list widget：行 ↔ 数组 ──
function listText(f) {
  return (doc[locale.value].values[f.key] || []).join('\n')
}
function setList(f, text) {
  doc[locale.value].values[f.key] = text.split('\n').map(s => s.trim()).filter(Boolean)
}

// ── 保存 ──
function currentFileFor(l) {
  return filePathsFor(props.col, props.col.fixedId || props.id)[l]
}

async function saveLocale(l) {
  const fields = !localized.value || fixed.value || l === 'zh' ? props.col.fields : props.col.fields.filter(f => f.mark)
  const raw = doc[l].values
  const values = {}
  for (const f of fields) {
    let v = raw[f.key]
    if (v === '' || v === undefined || v === null) {
      if (f.default !== undefined && l === 'zh') v = f.default
      else if (f.default !== undefined && !f.shared) continue
      else continue
    }
    if (f.type === 'number') v = v === '' ? undefined : Number(v)
    if (f.type === 'skills') v = (v || []).map(i => ({ name: i.name, items: String(i.items).split('\n').map(s => s.trim()).filter(Boolean) }))
    if (f.type === 'timeline' || f.type === 'facts') v = (v || []).map(i => Object.fromEntries(Object.entries(i).filter(([, x]) => x !== '')))
    if (f.type === 'object') v = Object.fromEntries(Object.entries(v).filter(([, x]) => x !== ''))
    if (v === undefined) continue
    values[f.key] = v
  }
  const path = currentFileFor(l)
  let sha = shaMap[l]
  // 兜底：sha 为空时先读一次拿 sha（文件已存在时 GitHub 必须带 sha）
  if (!sha && isLocal() === false) {
    try {
      const { readFileWithSha } = await import('../../admin/api.js')
      const res = await readFileWithSha(path)
      sha = res.sha
      if (sha) shaMap[l] = sha
    } catch {}
  }
  const newSha = await writeFile(path, serializeDoc(values, doc[l].body), sha)
  if (newSha) shaMap[l] = newSha
}

const noticeTimer = ref(null)
function flash(msg) {
  notice.value = msg
  clearTimeout(noticeTimer.value)
  noticeTimer.value = setTimeout(() => { notice.value = '' }, 3000)
}

async function save() {
  if (!props.id && !props.col.fixedId) { flash('缺少标识，无法保存'); return }
  saving.value = true
  notice.value = ''
  try {
    await saveLocale(locale.value)
    flash(`已保存 ${locale.value === 'zh' ? '中文' : '英文'} 文件`)
    emit('saved')
  } catch (err) {
    flash('保存失败：' + err.message)
  } finally {
    saving.value = false
  }
}

async function saveAll() {
  saving.value = true
  notice.value = ''
  try {
    await saveLocale('zh')
    if (localized.value) await saveLocale('en')
    flash('两个语言文件已保存')
    emit('saved')
  } catch (err) {
    flash('保存失败：' + err.message)
  } finally {
    saving.value = false
  }
}

// ── AI 译英文：把中文可译字段 + 正文发给翻译接口，结果填入英文表单（不落盘，等确认保存） ──
async function translate(text) {
  const conf = getAiConfig()
  try {
    if (conf.api === 'tencent') return await tencentTranslate(text, 'zh', 'en', conf)
    // 自定义网关
    const gw = conf.ai.gateway
    if (!gw) return '[AI] ' + text
    let headers = {}
    try { headers = JSON.parse(conf.ai.headersJson || '{}') } catch {}
    const res = await fetch(gw, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({ text, source: 'zh', target: 'en' })
    })
    if (!res.ok) throw new Error('网关 ' + res.status)
    return (await res.json()).text || text
  } catch (err) {
    throw new Error('翻译失败：' + err.message)
  }
}

async function aiFillEn() {
  notice.value = ''
  const from = doc.zh
  const target = doc.en
  try {
    const out = {}
    for (const f of props.col.fields.filter(x => x.mark)) {
      const v = from.values[f.key]
      if (v === '' || v === undefined || v === null) continue
      const t = f.type === 'markdown'
        ? (txt) => translateMarkdown(txt, translate)
        : f.type === 'list'
          ? null // 列表逐项翻译，走下面分支
          : translate
      if (f.type === 'list') {
        const items = []
        for (const item of v) items.push(await translate(item))
        out[f.key] = items.filter(Boolean)
      }
      else out[f.key] = await t(String(v))
    }
    if (f_hasBody.value) target.body = from.body ? await translateMarkdown(from.body, translate) : ''
    Object.assign(target.values, out)
    notice.value = '英文内容已填充，请校对后保存'
    locale.value = 'en'
  } catch (err) {
    notice.value = 'AI 失败：' + err.message
  }
}

const f_hasBody = computed(() => props.col.fields.some(f => f.key === 'body'))

// 复杂 widget 的行操作
function addItem(type) {
  const v = doc[locale.value].values[type === 'skills' ? 'skills' : type === 'timeline' ? 'timeline' : 'facts'] || []
  if (type === 'skills') v.push({ name: '', items: '' })
  if (type === 'timeline') v.push({ year: '', title: '', text: '' })
  if (type === 'facts') v.push({ label: '', value: '', url: '' })
  doc[locale.value].values[type] = v
}
function removeItem(key, idx) {
  doc[locale.value].values[key].splice(idx, 1)
}

const canDelete = computed(() => props.id && !fixed.value)
async function remove() {
  if (!confirm(`删除 ${props.id} 的 zh+en 文件？`)) return
  const paths = filePathsFor(props.col, props.col.fixedId || props.id)
  await deleteFile(paths.zh, shaMap.zh)
  if (paths.en) await deleteFile(paths.en, shaMap.en)
  emit('saved')
  emit('back')
}
</script>

<template>
  <div class="ed">
    <div class="ed-top">
      <button class="btn ghost" @click="emit('back')">← 返回列表</button>
      <div class="ed-tabs" v-if="localized">
        <button :class="{ on: locale === 'zh' }" @click="locale = 'zh'">中文</button>
        <button :class="{ on: locale === 'en' }" @click="locale = 'en'">English</button>
      </div>
      <div class="ed-actions">
        <button v-if="locale === 'zh' && localized" class="btn ai" :disabled="saving" @click="aiFillEn">✨ AI 译英文</button>
        <button class="btn ghost" :disabled="saving || !localized" @click="saveAll">双语全存</button>
        <button class="btn primary" :disabled="saving || loading" @click="save">{{ saving ? '保存中…' : '保存当前语言' }}</button>
        <button v-if="canDelete" class="btn danger" @click="remove">删除</button>
      </div>
    </div>

    <p v-if="notice" class="ed-notice">{{ notice }}</p>
    <p v-if="loading" class="ed-notice">加载中…</p>
    <p class="ed-file">{{ currentFileFor(locale) }}</p>

    <div class="ed-body" :class="{ single: !mdTargets.length }">
      <div class="ed-fields">
        <div v-for="f in visibleFields" :key="f.key" class="field">
          <template v-if="f.type === 'skills' || f.type === 'timeline' || f.type === 'facts'">
            <label>{{ f.label }} <button class="mini" @click="addItem(f.type)">+ 项</button></label>
            <div v-for="(item, idx) in doc[locale].values[f.key] || []" :key="idx" class="item-card">
              <div class="item-head">
                <span>#{{ idx + 1 }}</span>
                <button class="mini danger" @click="removeItem(f.key, idx)">删</button>
              </div>
              <template v-if="f.type === 'skills'">
                <input v-model="item.name" placeholder="分组名" />
                <textarea v-model="item.items" placeholder="技能项，一行一个" rows="3"></textarea>
              </template>
              <template v-else-if="f.type === 'timeline'">
                <div class="row">
                  <input v-model="item.year" placeholder="年份" class="w90" />
                  <input v-model="item.title" placeholder="标题" />
                </div>
                <textarea v-model="item.text" placeholder="描述" rows="2"></textarea>
              </template>
              <template v-else>
                <div class="row">
                  <input v-model="item.label" placeholder="标签" class="w140" />
                  <input v-model="item.value" placeholder="内容" />
                </div>
                <input v-model="item.url" placeholder="链接（可空，渲染为外链）" />
              </template>
            </div>
          </template>

          <template v-else-if="f.type === 'object'">
            <label>{{ f.label }}</label>
            <div class="row">
              <input v-for="k in (f.sub || [])" :key="k" v-model="doc[locale].values[f.key][k]" :placeholder="k" />
            </div>
          </template>

          <template v-else-if="f.type === 'list'">
            <label>{{ f.label }}（一行一项）</label>
            <textarea rows="5" :value="listText(f)" @input="setList(f, $event.target.value)"></textarea>
          </template>

          <template v-else-if="f.type === 'select'">
            <label>{{ f.label }}</label>
            <select v-model="doc[locale].values[f.key]">
              <option v-for="o in f.options" :key="o" :value="o">{{ o }}</option>
            </select>
          </template>

          <template v-else-if="f.type === 'text'">
            <label>{{ f.label }}</label>
            <textarea rows="3" v-model="doc[locale].values[f.key]"></textarea>
          </template>

          <template v-else>
            <label>{{ f.label }}</label>
            <input :type="f.type === 'number' ? 'number' : 'text'" v-model="doc[locale].values[f.key]" />
          </template>
        </div>
      </div>

      <div class="ed-md-col" v-if="mdTargets.length">
        <div class="md-switch">
          <button v-for="t in mdTargets" :key="t.key" :class="{ on: mdTarget === t.key }" @click="mdTarget = t.key">{{ t.label }}</button>
        </div>
        <MarkdownEditor :key="locale + mdTarget" v-model="mdValue" :min-h="520" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.ed { display: flex; flex-direction: column; gap: 14px; }
.ed-top { position: sticky; top: 0; z-index: 5; display: flex; align-items: center; gap: 14px; flex-wrap: wrap; padding: 12px 14px; margin: -12px -14px 0; border-bottom: 1px solid #1c2440; background: rgba(6, 8, 18, .88); backdrop-filter: blur(10px); }
.ed-tabs { display: inline-flex; border: 1px solid #26304f; border-radius: 9px; overflow: hidden; }
.ed-tabs button { padding: 8px 22px; background: transparent; border: 0; color: #8b97b8; cursor: pointer; font: 600 13px inherit; transition: background .18s, color .18s; }
.ed-tabs button.on { background: #0aa393; color: #fff; box-shadow: inset 0 0 14px rgba(46, 230, 200, .25); }
.ed-tabs button:not(.on):hover { color: #e2f6f2; background: rgba(10, 163, 147, .1); }
.ed-actions { margin-left: auto; display: flex; gap: 8px; flex-wrap: wrap; }
.btn { padding: 8px 15px; border-radius: 9px; border: 1px solid #2a3554; background: transparent; color: #c3cde6; cursor: pointer; font: 600 12px 'DM Mono', monospace; transition: border-color .18s, color .18s, background .18s, box-shadow .18s; }
.btn.primary { background: #0aa393; border-color: #0aa393; color: #fff; }
.btn.primary:hover { background: #067d70; box-shadow: 0 0 18px rgba(10, 163, 147, .35); }
.btn.ai { border-color: rgba(122, 90, 248, .6); color: #b9a6ff; }
.btn.ai:hover { background: rgba(122, 90, 248, .12); box-shadow: 0 0 18px rgba(122, 90, 248, .2); }
.btn.danger { border-color: rgba(216, 74, 96, .5); color: #e08896; }
.btn.danger:hover { background: rgba(216, 74, 96, .1); }
.btn.ghost:hover { border-color: #0aa393; color: #e2f6f2; }
.btn:disabled { opacity: .45; cursor: default; }
.ed-notice { margin: 0; padding: 9px 13px; border: 1px solid rgba(10, 163, 147, .4); border-radius: 9px; background: rgba(10, 163, 147, .08); color: #7ee8dc; font-size: 13px; }
.ed-file { margin: 0; color: #44506e; font: 10px 'DM Mono', monospace; }
.ed-body { display: grid; grid-template-columns: minmax(340px, 1fr) minmax(340px, 1.1fr); gap: 22px; align-items: start; }
@media (max-width: 1000px) { .ed-body { grid-template-columns: 1fr; } }
.ed-fields { display: flex; flex-direction: column; gap: 16px; }
.field label { display: flex; justify-content: space-between; align-items: center; color: #7e8baa; font: 11px 'DM Mono', monospace; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 7px; }
.field input, .field textarea, .field select { width: 100%; box-sizing: border-box; padding: 10px 12px; border: 1px solid #2a3554; border-radius: 9px; background: #0b101f; color: #dbe4f7; font-size: 13px; font-family: inherit; transition: border-color .18s, box-shadow .18s; }
.field input:focus, .field textarea:focus, .field select:focus { outline: none; border-color: #0aa393; box-shadow: 0 0 0 3px rgba(10, 163, 147, .15); }
.field input::placeholder, .field textarea::placeholder { color: #44506e; }
.field textarea { resize: vertical; line-height: 1.7; }
.row { display: flex; gap: 8px; }
.w90 { width: 90px; flex: none; }
.w140 { width: 140px; flex: none; }
.item-card { border: 1px solid #26304f; border-radius: 11px; padding: 12px; margin-bottom: 9px; display: flex; flex-direction: column; gap: 7px; background: rgba(13, 18, 38, .6); }
.item-head { display: flex; justify-content: space-between; color: #44506e; font: 10px 'DM Mono', monospace; }
.mini { padding: 3px 10px; border: 1px solid #2a3554; border-radius: 7px; background: transparent; color: #8b97b8; font: 11px 'DM Mono', monospace; cursor: pointer; transition: border-color .18s, color .18s; }
.mini:hover { border-color: #0aa393; color: #2ee6c8; }
.mini.danger:hover { border-color: #d84a60; color: #e08896; }
.ed-md-col { display: flex; flex-direction: column; gap: 10px; }
.md-switch { display: inline-flex; border: 1px solid #26304f; border-radius: 9px; overflow: hidden; align-self: flex-start; }
.md-switch button { padding: 7px 18px; background: transparent; border: 0; color: #8b97b8; font: 600 12px inherit; cursor: pointer; transition: background .15s, color .15s; }
.md-switch button.on { background: rgba(10, 163, 147, .18); color: #2ee6c8; }
.md-switch button:not(.on):hover { color: #e2f6f2; background: rgba(10, 163, 147, .06); }
.ed-body.single { grid-template-columns: 1fr; }
</style>
