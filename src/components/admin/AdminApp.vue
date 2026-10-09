<script setup>
// 自研后台：/#/admin。集合导航 + 条目列表（双语配对/缺译标记）+ 编辑器 + 存储设置
import { ref, computed, onMounted, onErrorCaptured } from 'vue'
import { collections, getCollection, entryIdFromFile } from '../../admin/schema.js'
import { listDir, readFile, parseFrontmatter, isLocal, getAiConfig, saveAiConfig } from '../../admin/api.js'
import EntryEditor from './EntryEditor.vue'

const view = ref('list') // list | edit | settings
const colName = ref('logs')
const col = computed(() => getCollection(colName.value))
const entries = ref([])
const listLoading = ref(false)
const editId = ref('')
const isNew = ref(false)
const listError = ref('')
const editorError = ref('')
const editorKey = ref(0)

// 编辑器内部渲染异常兜底：显示可重试的错误面板而非白屏
onErrorCaptured((err) => {
  if (view.value === 'edit') {
    editorError.value = err.message || String(err)
    return false
  }
  return true
})

function retryEditor() {
  editorError.value = ''
  editorKey.value++
}

async function selectCollection(name) {
  colName.value = name
  view.value = 'list'
  editorError.value = ''
  await loadEntries()
}

function titleOf(data) {
  const t = data && data.title
  if (t && typeof t === 'object') return t.zh || t.en || ''
  return (t || data.tagline || data.email || '').toString()
}

async function loadEntries() {
  const c = col.value
  listLoading.value = true
  listError.value = ''
  entries.value = []
  try {
    if (c.fixedId) {
      const paths = c.localized
        ? [{ id: c.fixedId, zh: `${c.folder}/${c.fixedId}.zh.md`, en: `${c.folder}/${c.fixedId}.en.md` }]
        : [{ id: c.fixedId, zh: `${c.folder}/${c.fixedId}.md`, en: null }]
      entries.value = await decorate(paths, c)
    } else {
      const files = (await listDir(c.folder)).filter(f => f.endsWith('.md'))
      const ids = [...new Set(files.map(f => entryIdFromFile(c.folder, f)))]
      const paths = ids.map(id => ({ id, zh: `${c.folder}/${id}.zh.md`, en: c.localized ? `${c.folder}/${id}.en.md` : null }))
      entries.value = await decorate(paths, c)
    }
  } catch (err) {
    listError.value = isLocal()
      ? err.message + '（需 npm run dev 启动，本地接口仅 dev 可用）'
      : err.message + '（GitHub 模式请在设置里配置 token）'
  } finally {
    listLoading.value = false
  }
}

async function decorate(paths, c) {
  const out = []
  for (const p of paths) {
    const zhRaw = await readFile(p.zh)
    const { data } = parseFrontmatter(zhRaw || '')
    let enMissing = false
    if (c.localized && p.en) {
      const enRaw = await readFile(p.en)
      enMissing = !enRaw || !enRaw.trim()
    }
    const sortKey = c.fixedId ? 0 : (data.date || data.year || '')
    const meta = data.date || (data.year ? `${data.year}${data.month ? '.' + String(data.month).padStart(2, '0') : ''}` : '')
    out.push({ id: p.id, title: titleOf(data), meta, sortKey, enMissing })
  }
  if (!c.fixedId) out.sort((a, b) => String(b.sortKey).localeCompare(String(a.sortKey)))
  return out
}

function openEntry(id) {
  editId.value = id
  isNew.value = false
  editorError.value = ''
  view.value = 'edit'
}

// 新建：先要 id
function createEntry() {
  const id = prompt(`新条目标识（将创建 ${col.value.folder}/<标识>.zh.md + .en.md）：`, col.value.name === 'logs' ? `${new Date().toISOString().slice(0, 10)}-` : '')
  if (!id) return
  if (!/^[\w.\u4e00-\u9fff-]+$/.test(id)) { alert('标识只能包含字母/数字/短横线/点/中文'); return }
  editId.value = id
  isNew.value = true
  editorError.value = ''
  view.value = 'edit'
}

// ── 存储设置 ──
const form = ref(JSON.parse(localStorage.getItem('admin.config') || '{"mode":"local","repo":"GeminiMortal/blog","branch":"main","token":""}'))
const aiConfig = ref(getAiConfig())

function saveForm() {
  localStorage.setItem('admin.config', JSON.stringify(form.value))
  saveAiConfig(aiConfig.value)
  alert('已保存')
  loadEntries()
}

const storageMode = computed(() => (isLocal() ? '本地 (dev)' : 'GitHub'))
const aiStatus = computed(() => aiConfig.value.api === 'tencent'
  ? (aiConfig.value.ai.secretId ? '腾讯 TMT ✓' : '腾讯 TMT 未配置')
  : (aiConfig.value.ai.gateway ? '网关 ✓' : '占位翻译'))
onMounted(loadEntries)
</script>

<template>
  <div class="admin-app">
    <aside class="side">
      <div class="side-brand">/GeminiMortal<span>Admin</span></div>
      <nav>
        <button v-for="c in collections" :key="c.name" :class="{ on: colName === c.name && view !== 'settings' }" @click="selectCollection(c.name)">
          {{ c.label }}
        </button>
      </nav>
      <div class="side-foot">
        <button :class="{ on: view === 'settings' }" @click="view = 'settings'">设置 · {{ storageMode }}</button>
        <a href="#/">↗ 查看站点</a>
      </div>
    </aside>

    <main class="main">
      <template v-if="view === 'settings'">
        <h2>设置</h2>

        <div class="settings-section">
          <h3>内容存储</h3>
          <div class="settings">
            <label>模式</label>
            <div class="radio-row">
              <label><input v-model="form.mode" type="radio" value="local" /> 本地接口（需 npm run dev）</label>
              <label><input v-model="form.mode" type="radio" value="github" /> GitHub Contents API（线上）</label>
            </div>
            <label>仓库 repo</label>
            <input v-model="form.repo" placeholder="GeminiMortal/blog" />
            <label>分支 branch</label>
            <input v-model="form.branch" placeholder="main" />
            <label>Token（GitHub 模式必填，classic token 需 contents:write；仅存浏览器 localStorage）</label>
            <input v-model="form.token" type="password" placeholder="ghp_…" />
          </div>
        </div>

        <div class="settings-section">
          <h3>AI 译英文 <span class="ai-badge">{{ aiStatus }}</span></h3>
          <div class="settings">
            <label>翻译接口</label>
            <div class="radio-row">
              <label><input v-model="aiConfig.api" type="radio" value="tencent" /> 腾讯云机器翻译 TMT（推荐，直连 TextTranslate API）</label>
              <label><input v-model="aiConfig.api" type="radio" value="gateway" /> 自定义网关（OpenAI 兼容，POST {text, source, target} → {text}）</label>
            </div>

            <template v-if="aiConfig.api === 'tencent'">
              <label>SecretId</label>
              <input v-model="aiConfig.ai.secretId" placeholder="AKID..." />
              <label>SecretKey</label>
              <input v-model="aiConfig.ai.secretKey" type="password" placeholder="密钥" />
              <label>代理地址（可选，留空则 dev 自动走本地代理，生产直连腾讯 API）</label>
              <input v-model="aiConfig.ai.proxy" placeholder="https://your-cors-proxy.workers.dev" />
              <div class="hint">腾讯云「机器翻译」控制台开通服务后，在「访问管理 → API 密钥」获取 SecretId/SecretKey。TextTranslate 接口有免费额度，调用量小无需付费。<br>本地开发（localhost）自动走 Vite 代理无需配置；生产环境需填写 CORS 代理地址（如 Cloudflare Worker），否则浏览器会因跨域被拦截。</div>
            </template>

            <template v-else>
              <label>网关 URL</label>
              <input v-model="aiConfig.ai.gateway" placeholder="https://your-worker.workers.dev/translate" />
              <label>请求头 headers（JSON，可空）</label>
              <textarea rows="2" v-model="aiConfig.ai.headersJson" placeholder='{"Authorization": "Bearer sk-..."}'></textarea>
              <div class="hint">自定义网关需实现：POST body {text, source, target} → 返回 {text}。</div>
            </template>
          </div>
        </div>

        <button class="save" @click="saveForm">保存所有设置</button>
      </template>

      <template v-else-if="view === 'edit'">
        <div v-if="editorError" class="crash">
          <h2>编辑器加载失败</h2>
          <p class="tip err">{{ editorError }}</p>
          <div class="crash-actions">
            <button class="new" @click="retryEditor">重试</button>
            <button class="ghost-btn" @click="editorError = ''; view = 'list'">返回列表</button>
          </div>
        </div>
        <EntryEditor v-else :key="`${colName}-${editId}-${editorKey}`" :col="col" :id="editId" @back="loadEntries(); view = 'list'" @saved="loadEntries" />
      </template>

      <template v-else>
        <div class="list-head">
          <h2>{{ col.label }}</h2>
          <button v-if="!col.fixedId" class="new" @click="createEntry">+ 新条目</button>
        </div>
        <p v-if="listLoading" class="tip">加载中…</p>
        <p v-else-if="listError" class="tip err">{{ listError }}</p>
        <ul v-else class="list">
          <li v-for="e in entries" :key="e.id">
            <button class="row-btn" @click="openEntry(e.id)">
              <span class="row-main">
                <span class="title">{{ e.title || e.id }}</span>
                <span class="sub">{{ e.id }}</span>
              </span>
              <span class="row-side">
                <span v-if="e.meta" class="meta">{{ e.meta }}</span>
                <span v-if="e.enMissing" class="miss">缺英文</span>
                <span v-else class="ok">双语</span>
                <i class="arrow">↗</i>
              </span>
            </button>
          </li>
        </ul>
      </template>
    </main>
  </div>
</template>

<style scoped>
.admin-app { display: grid; grid-template-columns: 230px 1fr; min-height: 100vh; background: #060812; color: #dbe4f7; }
.admin-app::before { content: ''; position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: .16; background-image: linear-gradient(rgba(97, 238, 255, .07) 1px, transparent 1px), linear-gradient(90deg, rgba(97, 238, 255, .07) 1px, transparent 1px); background-size: 42px 42px; mask-image: linear-gradient(to bottom, black, transparent 70%); }
.side, .main { position: relative; z-index: 1; }

.side { display: flex; flex-direction: column; border-right: 1px solid #1c2440; padding: 20px 14px; position: sticky; top: 0; height: 100vh; box-sizing: border-box; background: rgba(8, 11, 24, .6); }
.side-brand { font: 700 15px 'DM Mono', monospace; color: #eaf6ff; padding: 6px 10px 20px; letter-spacing: -1px; }
.side-brand span { color: #0aa393; }
.side nav { display: flex; flex-direction: column; gap: 4px; flex: 1; }
.side nav button, .side-foot button { display: flex; align-items: center; gap: 8px; text-align: left; padding: 10px 13px; border: 0; border-radius: 9px; background: transparent; color: #8b97b8; font-size: 13px; cursor: pointer; transition: background .18s, color .18s; }
.side nav button:hover, .side-foot button:hover { background: rgba(10, 163, 147, .1); color: #e2f6f2; }
.side nav button.on { background: linear-gradient(100deg, rgba(10, 163, 147, .22), rgba(10, 163, 147, .06)); color: #2ee6c8; box-shadow: inset 2px 0 0 #0aa393; }
.side-foot { display: flex; flex-direction: column; gap: 6px; border-top: 1px solid #1c2440; padding-top: 14px; }
.side-foot a { color: #55618a; font: 11px 'DM Mono', monospace; padding: 4px 13px; text-decoration: none; transition: color .18s; }
.side-foot a:hover { color: #2ee6c8; }

.main { padding: 30px 36px 70px; min-width: 0; }
.main h2 { margin: 0 0 20px; font-size: 24px; letter-spacing: -.03em; color: #eaf6ff; }
.list-head { display: flex; align-items: center; justify-content: space-between; }
.new { padding: 9px 16px; border: 1px solid #0aa393; border-radius: 9px; background: transparent; color: #2ee6c8; cursor: pointer; font: 600 12px 'DM Mono', monospace; transition: background .18s, color .18s, box-shadow .18s; }
.new:hover { background: #0aa393; color: #06111b; box-shadow: 0 0 20px rgba(10, 163, 147, .35); }

.list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.list li { border: 1px solid #1c2440; border-radius: 12px; background: rgba(13, 18, 38, .72); transition: border-color .2s, transform .2s, box-shadow .2s; }
.list li:hover { border-color: #0aa393; transform: translateY(-2px); box-shadow: 0 8px 28px rgba(6, 133, 112, .12); }
.row-btn { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 16px 18px; border: 0; background: transparent; color: inherit; cursor: pointer; text-align: left; }
.row-main { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.row-main .title { font-size: 15px; color: #e8efff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.row-main .sub { font: 10px 'DM Mono', monospace; color: #55618a; }
.row-side { display: flex; align-items: center; gap: 10px; flex: none; }
.meta { font: 11px 'DM Mono', monospace; color: #7e8baa; }
.ok { font-size: 11px; color: #2ee6c8; border: 1px solid rgba(10, 163, 147, .45); border-radius: 999px; padding: 3px 10px; background: rgba(10, 163, 147, .08); }
.miss { font-size: 11px; color: #d98e3f; border: 1px solid rgba(217, 142, 63, .5); border-radius: 999px; padding: 3px 10px; background: rgba(217, 142, 63, .08); }
.arrow { font-style: normal; color: #55618a; transition: color .2s, transform .2s; }
.list li:hover .arrow { color: #2ee6c8; transform: translate(2px, -2px); }

.tip { color: #55618a; font-size: 13px; }
.tip.err { color: #e08896; }
.crash { max-width: 560px; padding: 24px; border: 1px solid rgba(216, 74, 96, .4); border-radius: 14px; background: rgba(216, 74, 96, .06); }
.crash h2 { color: #e08896; font-size: 18px; margin-bottom: 10px; }
.crash .tip { margin: 0 0 16px; font: 12px 'DM Mono', monospace; word-break: break-all; }
.crash div { display: flex; gap: 10px; }
.crash button { padding: 8px 16px; border-radius: 9px; cursor: pointer; font: 600 12px 'DM Mono', monospace; }
.crash button:first-child { border: 1px solid #0aa393; background: #0aa393; color: #fff; }
.crash button:last-child { border: 1px solid #2a3554; background: transparent; color: #8b97b8; }

.settings-section { display: flex; flex-direction: column; gap: 10px; }
.settings-section h3 { color: #eaf6ff; font-size: 15px; margin: 0; display: flex; align-items: center; gap: 10px; }
.ai-badge { font: 11px 'DM Mono', monospace; padding: 3px 10px; border-radius: 999px; border: 1px solid rgba(10, 163, 147, .45); color: #2ee6c8; background: rgba(10, 163, 147, .08); }
.settings { display: flex; flex-direction: column; gap: 8px; max-width: 580px; padding: 22px; border: 1px solid #1c2440; border-radius: 14px; background: rgba(13, 18, 38, .72); }
.settings label { color: #8b97b8; font: 11px 'DM Mono', monospace; text-transform: uppercase; letter-spacing: .08em; margin-top: 10px; }
.settings input[type='text'], .settings input:not([type]), .settings input[type='password'] { padding: 10px 12px; border: 1px solid #2a3554; border-radius: 9px; background: #0b101f; color: #dbe4f7; font-size: 13px; transition: border-color .18s, box-shadow .18s; }
.settings input:focus { outline: none; border-color: #0aa393; box-shadow: 0 0 0 3px rgba(10, 163, 147, .15); }
.radio-row { display: flex; gap: 18px; }
.radio-row label { margin: 0; display: flex; align-items: center; gap: 6px; color: #c3cde6; font-size: 13px; text-transform: none; letter-spacing: 0; }
.hint { color: #55618a; font-size: 12px; line-height: 1.7; }
.hint code { color: #b8e8ff; background: #0b101f; padding: 2px 7px; border-radius: 5px; font-size: 11px; }
.save { margin-top: 16px; align-self: flex-start; padding: 9px 20px; border: 0; border-radius: 9px; background: #0aa393; color: #fff; cursor: pointer; font: 600 13px inherit; transition: background .18s, box-shadow .18s; }
.save:hover { background: #067d70; box-shadow: 0 0 20px rgba(10, 163, 147, .35); }

@media (max-width: 760px) { .admin-app { grid-template-columns: 1fr; } .side { position: static; height: auto; flex-direction: row; align-items: center; overflow-x: auto; gap: 10px; } .side nav { flex-direction: row; } .main { padding: 20px 18px 50px; } }
</style>
