<script setup>
// 通用 Markdown 编辑器：工具栏插入（保留撤销栈）+ 编辑/分栏/预览视图 + 滚动同步 + 字数
// compact 模式用于字段列（窄栏，编辑/预览两态）；完整模式用于正文（三态视图，模式记忆）
import { ref, computed, nextTick } from 'vue'
import MarkdownIt from 'markdown-it'

const props = defineProps({
  modelValue: { type: String, default: '' },
  compact: { type: Boolean, default: false },
  placeholder: { type: String, default: '支持标题 / 列表 / 表格 / 代码块 / 引用…（⌘B 加粗 · ⌘K 链接）' },
  minH: { type: Number, default: 0 }
})
const emit = defineEmits(['update:modelValue'])

const md = new MarkdownIt({ html: false, linkify: true, breaks: false })

const ta = ref(null)
const pv = ref(null)

const mode = ref(props.compact ? 'edit' : (localStorage.getItem('admin.md-view') || 'split'))
function setMode(m) {
  mode.value = m
  if (!props.compact) localStorage.setItem('admin.md-view', m)
  if (m === 'split') nextTick(syncScroll)
}

const html = computed(() => md.render(props.modelValue || ''))

function syncScroll() {
  const t = ta.value, p = pv.value
  if (!t || !p) return
  const r = t.scrollTop / Math.max(1, t.scrollHeight - t.clientHeight)
  p.scrollTop = r * (p.scrollHeight - p.clientHeight)
}

function insertText(text) {
  const t = ta.value
  if (!t) return
  t.focus()
  if (!document.execCommand('insertText', false, text)) {
    const s = t.selectionStart, e = t.selectionEnd
    const v = t.value.slice(0, s) + text + t.value.slice(e)
    emit('update:modelValue', v)
    nextTick(() => t.setSelectionRange(s + text.length, s + text.length))
  }
}

function selection() {
  const t = ta.value
  return t ? t.value.slice(t.selectionStart, t.selectionEnd) : ''
}

function linePrefix(prefix) {
  const t = ta.value
  if (!t) return
  const s = t.selectionStart
  const lineStart = t.value.lastIndexOf('\n', s - 1) + 1
  t.focus()
  t.setSelectionRange(lineStart, lineStart)
  if (!document.execCommand('insertText', false, prefix)) {
    emit('update:modelValue', t.value.slice(0, lineStart) + prefix + t.value.slice(lineStart))
  }
}

const TOOLS = [
  { label: 'H2', title: '二级标题', run: () => linePrefix('## ') },
  { label: 'H3', title: '三级标题', run: () => linePrefix('### ') },
  { label: 'B', title: '加粗 (⌘B)', run: () => insertText(`**${selection() || '加粗文本'}**`) },
  { label: 'I', title: '斜体', run: () => insertText(`*${selection() || '斜体文本'}*`) },
  { label: '•', title: '无序列表', run: () => linePrefix('- ') },
  { label: '1.', title: '有序列表', run: () => linePrefix('1. ') },
  { label: '❝', title: '引用', run: () => linePrefix('> ') },
  { label: '`', title: '行内代码', run: () => insertText(`\`${selection() || 'code'}\``) },
  { label: '```', title: '代码块', run: () => insertText(`\n\`\`\`\n${selection()}\n\`\`\`\n`) },
  { label: '🔗', title: '链接 (⌘K)', run: () => insertText(`[${selection() || '链接文字'}](https://)`) },
  { label: '⊞', title: '表格', run: () => insertText('\n| 列一 | 列二 |\n| --- | --- |\n| 内容 | 内容 |\n') },
  { label: '―', title: '分隔线', run: () => insertText('\n---\n') }
]

const TOOLS_MINI = TOOLS.filter(t => ['B', 'I', '•', '1.', '❝', '`', '🔗'].includes(t.label))

function onKeydown(e) {
  if (!(e.metaKey || e.ctrlKey)) return
  if (e.key === 'b') { e.preventDefault(); insertText(`**${selection() || '加粗文本'}**`) }
  if (e.key === 'k') { e.preventDefault(); insertText(`[${selection() || '链接文字'}](https://)`) }
}
</script>

<template>
  <div class="mde" :class="{ compact }" :style="minH ? { '--mde-h': minH + 'px' } : {}">
    <div class="mde-head">
      <div class="view-switch">
        <button :class="{ on: mode === 'edit' }" @click="setMode('edit')">编辑</button>
        <button v-if="!compact" :class="{ on: mode === 'split' }" @click="setMode('split')">分栏</button>
        <button :class="{ on: mode === 'preview' }" @click="setMode('preview')">预览</button>
      </div>
      <span class="wc">{{ (modelValue || '').length }} 字</span>
    </div>

    <div v-if="mode !== 'preview'" class="toolbar">
      <button v-for="t in (compact ? TOOLS_MINI : TOOLS)" :key="t.title" type="button" class="tool" :title="t.title" @mousedown.prevent @click="t.run()">{{ t.label }}</button>
    </div>

    <div class="mde-wrap" :class="'mode-' + mode">
      <textarea
        v-if="mode !== 'preview'"
        ref="ta"
        class="mde-ta"
        :value="modelValue"
        :placeholder="placeholder"
        @input="emit('update:modelValue', $event.target.value)"
        @scroll="syncScroll"
        @keydown="onKeydown"
      ></textarea>
      <div v-if="mode !== 'edit'" ref="pv" class="mde-pv prose-admin" v-html="html"></div>
    </div>
  </div>
</template>

<style scoped>
.mde { border: 1px solid #26304f; border-radius: 12px; overflow: hidden; background: rgba(13, 18, 38, .6); display: flex; flex-direction: column; }
.mde.compact { border-radius: 10px; }
.mde-head { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #0b101f; border-bottom: 1px solid #1c2440; }
.compact .mde-head { padding: 6px 10px; }
.view-switch { display: inline-flex; border: 1px solid #26304f; border-radius: 8px; overflow: hidden; }
.view-switch button { padding: 4px 12px; background: transparent; border: 0; color: #8b97b8; font: 11px 'DM Mono', monospace; cursor: pointer; transition: background .15s, color .15s; }
.view-switch button.on { background: rgba(10, 163, 147, .18); color: #2ee6c8; }
.view-switch button:not(.on):hover { color: #e2f6f2; }
.wc { color: #44506e; font: 11px 'DM Mono', monospace; }
.toolbar { display: flex; flex-wrap: wrap; gap: 4px; padding: 7px 10px; background: #0b101f; border-bottom: 1px solid #1c2440; }
.tool { padding: 3px 9px; border: 1px solid #26304f; border-radius: 7px; background: transparent; color: #a5b1cb; font: 11px 'DM Mono', monospace; cursor: pointer; transition: border-color .15s, color .15s, background .15s; }
.tool:hover { border-color: #0aa393; color: #2ee6c8; background: rgba(10, 163, 147, .08); }
.tool:active { background: rgba(10, 163, 147, .18); }
.mde-wrap { display: grid; min-height: var(--mde-h, 520px); }
.compact .mde-wrap { min-height: var(--mde-h, 200px); }
.mde-wrap.mode-split { grid-template-columns: 1fr 1fr; }
.mde-wrap.mode-edit, .mde-wrap.mode-preview { grid-template-columns: 1fr; }
.mde-ta { width: 100%; height: 100%; min-height: inherit; border: 0; border-radius: 0; padding: 12px 14px; background: transparent; color: #dbe4f7; font: 13px/1.75 'DM Mono', monospace; resize: vertical; box-sizing: border-box; }
.mde-ta:focus { outline: none; }
.mde-wrap.mode-split .mde-ta { border-right: 1px solid #1c2440; }
.mde-pv { padding: 14px 18px; background: #080c1a; max-height: 720px; overflow-y: auto; }
.compact .mde-pv { max-height: 420px; }
.prose-admin :deep(h1), .prose-admin :deep(h2), .prose-admin :deep(h3), .prose-admin :deep(h4) { color: #e8efff; margin: 22px 0 10px; letter-spacing: -.02em; line-height: 1.4; }
.prose-admin :deep(h1):first-child, .prose-admin :deep(h2):first-child { margin-top: 0; }
.prose-admin :deep(h1) { font-size: 21px; padding-bottom: 8px; border-bottom: 1px solid #1c2440; }
.prose-admin :deep(h2) { font-size: 18px; padding-bottom: 7px; border-bottom: 1px solid rgba(10, 163, 147, .3); }
.prose-admin :deep(h3) { font-size: 16px; }
.prose-admin :deep(h4) { font-size: 14px; color: #b9c4e0; }
.prose-admin :deep(p), .prose-admin :deep(li) { color: #b0bbd4; line-height: 1.85; font-size: 14px; }
.prose-admin :deep(li::marker) { color: #0aa393; }
.prose-admin :deep(strong) { color: #e8efff; font-weight: 600; }
.prose-admin :deep(em) { color: #c9d4ec; }
.prose-admin :deep(del) { color: #66739a; }
.prose-admin :deep(code) { color: #b8e8ff; background: #0d1226; padding: 2px 6px; border-radius: 5px; font: 12px 'DM Mono', monospace; }
.prose-admin :deep(pre) { background: #0d1226; padding: 13px 15px; border-radius: 9px; overflow-x: auto; border: 1px solid #1c2440; }
.prose-admin :deep(pre code) { padding: 0; background: none; }
.prose-admin :deep(blockquote) { margin: 0 0 15px; border-left: 2px solid #0aa393; padding: 2px 0 2px 13px; color: #8b97b8; }
.prose-admin :deep(blockquote p) { color: #8b97b8; }
.prose-admin :deep(a) { color: #77faea; border-bottom: 1px solid rgba(119, 250, 234, .4); }
.prose-admin :deep(img) { max-width: 100%; border-radius: 9px; border: 1px solid #1c2440; }
.prose-admin :deep(hr) { border: 0; border-top: 1px solid #1c2440; margin: 22px 0; }
.prose-admin :deep(table) { border-collapse: collapse; margin-bottom: 15px; }
.prose-admin :deep(th), .prose-admin :deep(td) { border: 1px solid #2a3554; padding: 7px 11px; color: #b0bbd4; font-size: 13px; }
.prose-admin :deep(th) { background: #0d1226; color: #c9d4ec; font-weight: 600; }
</style>
