// 后台存储后端：本地（dev，走 vite /__local 中间件）与 GitHub（线上，Contents API）
// localStorage 里的 admin.config：{ mode: 'local' | 'github', repo, branch, token }
import { dump, load } from 'js-yaml'

function cfg() {
  const raw = localStorage.getItem('admin.config')
  return raw ? JSON.parse(raw) : { mode: 'local' }
}

export function isLocal() {
  return cfg().mode !== 'github'
}

function gh() {
  const c = cfg()
  return { repo: c.repo, branch: c.branch || 'main', token: c.token, api: 'https://api.github.com' }
}

async function ghReq(path, options = {}) {
  const { repo, branch, token, api } = gh()
  const res = await fetch(`${api}/repos/${repo}/contents/${encodePath(path)}?ref=${branch}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  })
  return res
}

function encodePath(p) {
  return p.split('/').map(encodeURIComponent).join('/')
}

async function ghGet(path) {
  const res = await ghReq(path)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${await res.text()}`)
  const data = await res.json()
  const content = data.content ? decodeURIComponent(escape(atob(data.content.replace(/\n/g, '')))) : ''
  return { content, sha: data.sha }
}

async function ghPut(path, content, sha) {
  const body = {
    message: `admin: update ${path}`,
    content: btoa(unescape(encodeURIComponent(content))),
    branch: gh().branch
  }
  if (sha) body.sha = sha
  const res = await ghReq(path, { method: 'PUT', body: JSON.stringify(body) })
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${await res.text()}`)
}

async function ghDelete(path, sha) {
  const res = await ghReq(path, {
    method: 'DELETE',
    body: JSON.stringify({ message: `admin: delete ${path}`, sha, branch: gh().branch })
  })
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${await res.text()}`)
}

// ── 统一 API ───────────────────────────────────────────────
export async function listDir(dir) {
  if (isLocal()) {
    const res = await fetch(`/__local/__index?dir=${encodeURIComponent(dir)}`)
    if (!res.ok) throw new Error('list failed')
    return res.json()
  }
  const res = await ghReq(dir)
  if (res.status === 404) return []
  if (!res.ok) throw new Error(`GitHub ${res.status}`)
  const items = await res.json()
  return items.filter(i => i.type === 'file' && /\.(md|json)$/.test(i.name)).map(i => `${dir}/${i.name}`)
}

export async function readFile(path) {
  if (isLocal()) {
    const res = await fetch(`/__local/${path}`)
    if (res.status === 404) return null
    if (!res.ok) throw new Error('read failed')
    return res.text()
  }
  const data = await ghGet(path)
  return data ? data.content : null
}

export async function readFileWithSha(path) {
  if (isLocal()) return { content: await readFile(path), sha: null }
  const data = await ghGet(path)
  return data ? { content: data.content, sha: data.sha } : { content: null, sha: null }
}

export async function writeFile(path, content, sha) {
  if (isLocal()) {
    const res = await fetch(`/__local/${path}`, { method: 'PUT', headers: { 'Content-Type': 'text/markdown' }, body: content })
    if (!res.ok) throw new Error('write failed')
    return
  }
  await ghPut(path, content, sha)
}

export async function deleteFile(path) {
  if (isLocal()) {
    const res = await fetch(`/__local/${path}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('delete failed')
    return
  }
  const data = await ghGet(path)
  if (!data) return
  await ghDelete(path, data.sha)
}

// ── frontmatter 解析 / 序列化 ──
export function parseFrontmatter(raw) {
  const m = (raw || '').match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!m) return { data: {}, body: (raw || '').trim() }
  return { data: load(m[1]) || {}, body: m[2].trim() }
}

export function serializeDoc(values, body = '') {
  const lines = []
  for (const [key, v] of Object.entries(values)) {
    if (v === undefined || v === null || v === '') continue
    if (Array.isArray(v) && !v.length) { lines.push(`${key}: []`); continue }
    if (typeof v === 'string' && v.includes('\n')) {
      const first = v.split('\n')[0]
      lines.push(first.startsWith(' ') ? `${key}: |-2` : `${key}: |-`)
      for (const line of v.split('\n')) lines.push(line ? `  ${line}` : '')
      continue
    }
    lines.push(dump({ [key]: v }, { lineWidth: -1, noRefs: true, quotingType: '"' }).trimEnd())
  }
  return `---\n${lines.join('\n')}\n---\n${body ? body + '\n' : ''}`
}

// ── 腾讯云机器翻译 TMT：TextTranslate API ──
// TC3-HMAC-SHA256 签名由浏览器原生 Web Crypto 计算，无需额外依赖
// localStorage 'admin.ai'：{ tencentSecretId, tencentSecretKey }

// TMT 限频 5 次/秒，节流保证 ≤4 次/秒
let _lastTmtCall = 0
const TMT_MIN_INTERVAL = 260
async function tmtThrottle() {
  const now = Date.now()
  const wait = _lastTmtCall + TMT_MIN_INTERVAL - now
  _lastTmtCall = now + Math.max(wait, 0) // 先占槽位再等待，避免并发同时放行
  if (wait > 0) await new Promise(r => setTimeout(r, wait))
}

const TENCENT_TMT = { host: 'tmt.tencentcloudapi.com', proxyPath: '/__tencent', service: 'tmt', version: '2018-03-21', action: 'TextTranslate' }
const EMPTY_CONFIG = { api: 'tencent', ai: { secretId: '', secretKey: '' } }

export function getAiConfig() {
  const raw = localStorage.getItem('admin.ai')
  const conf = { ...EMPTY_CONFIG, ai: { ...EMPTY_CONFIG.ai }, ...(raw ? JSON.parse(raw) : {}) }
  conf.ai = { ...EMPTY_CONFIG.ai, ...(conf.ai || {}) }
  return conf
}

export function saveAiConfig(config) {
  localStorage.setItem('admin.ai', JSON.stringify(config))
}

async function hmac(key, msg) {
  const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return new Uint8Array(await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(msg)))
}

async function sha256(data) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data))
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('')
}

function hexEncode(buf) {
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('')
}

async function tc3Sign({ secretId, secretKey }, timestamp, payload) {
  const date = new Date(timestamp * 1000).toISOString().slice(0, 10)
  const canonical = ['POST', '/', '', `content-type:application/json\nhost:${TENCENT_TMT.host}\n`, 'content-type;host', await sha256(payload)].join('\n')
  const credentialScope = `${date}/${TENCENT_TMT.service}/tc3_request`
  const stringToSign = ['TC3-HMAC-SHA256', timestamp, credentialScope, await sha256(canonical)].join('\n')
  const kDate = await hmac(new TextEncoder().encode(`TC3${secretKey}`), date)
  const kService = await hmac(kDate, TENCENT_TMT.service)
  const kSigning = await hmac(kService, 'tc3_request')
  const signature = hexEncode(await hmac(kSigning, stringToSign))
  return `TC3-HMAC-SHA256 Credential=${secretId}/${credentialScope}, SignedHeaders=content-type;host, Signature=${signature}`
}

export async function tencentTranslate(text, source, target, config) {
  const { secretId, secretKey } = config.ai
  if (!secretId || !secretKey) throw new Error('腾讯云凭据未配置（后台设置里填写 SecretId/SecretKey）')
  const payload = JSON.stringify({ SourceText: text, Source: source, Target: target, ProjectId: 0 })
  const ts = Math.floor(Date.now() / 1000)
  await tmtThrottle() // 节流：确保 ≤4 次/秒，避开 TMT 限频 5 次/秒
  const res = await fetch(TENCENT_TMT.proxyPath, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-TC-Action': TENCENT_TMT.action,
      'X-TC-Version': TENCENT_TMT.version,
      'X-TC-Timestamp': String(ts),
      'X-TC-Region': 'ap-guangzhou',
      Authorization: await tc3Sign(config.ai, ts, payload)
    },
    body: payload
  })
  if (!res.ok) {
    const err = await res.text().catch(() => '')
    throw new Error(`腾讯翻译 ${res.status}: ${err}`)
  }
  const json = await res.json()
  if (json.Response?.Error) throw new Error(`腾讯翻译: ${json.Response.Error.Code} — ${json.Response.Error.Message}`)
  return json.Response?.TargetText || ''
}

// ── Markdown 翻译：逐行解析结构，只翻译文字，保留全部语法 ──
// 内联保护：代码块/内联码/链接URL 用 ⟦N⟧ 占位符包裹，翻译后还原
function protectInline(text, stash) {
  const save = m => { stash.push(m); return `⟦${stash.length - 1}⟧` }
  let s = text
  s = s.replace(/`[^`\n]+`/g, save)                          // 内联代码
  s = s.replace(/(\]\()([^)]+)(\))/g, (_, a, url, b) =>      // 链接/图片 URL
    `${a}${save(url)}${b}`)
  return s
}

function restoreInline(text, stash) {
  return text.replace(/⟦(\d+)⟧/g, (_, i) => stash[Number(i)] || '')
}

export async function translateMarkdown(text, translateFn) {
  if (!text) return ''
  const lines = text.split('\n')
  const out = []
  let inCode = false

  for (const line of lines) {
    const trimmed = line.trimStart()

    // ── 代码块：进入/退出/内容全部保留 ──
    if (trimmed.startsWith('```')) { inCode = !inCode; out.push(line); continue }
    if (inCode) { out.push(line); continue }

    // ── 空行 / 水平线 / 表格对齐行：原样 ──
    if (!trimmed || /^---+$/.test(trimmed) || /^\|[\s:|-]+\|$/.test(trimmed))
      { out.push(line); continue }

    // ── 带前缀的结构性行：提取前缀 + 内容，只翻译内容 ──
    // 标题：## / ### / ...
    const h = line.match(/^(\s*#{1,6}\s+)(.*)$/)
    if (h) { const stash = []; out.push(h[1] + restoreInline(await translateFn(protectInline(h[2], stash)), stash)); continue }

    // 无序列表：- / * / +
    const ul = line.match(/^(\s*[-*+]\s+)(.*)$/)
    if (ul) { const stash = []; out.push(ul[1] + restoreInline(await translateFn(protectInline(ul[2], stash)), stash)); continue }

    // 有序列表：1. / 2. / ...
    const ol = line.match(/^(\s*\d+\.\s+)(.*)$/)
    if (ol) { const stash = []; out.push(ol[1] + restoreInline(await translateFn(protectInline(ol[2], stash)), stash)); continue }

    // 引用：>
    const bq = line.match(/^(\s*>\s*)(.*)$/)
    if (bq) { const stash = []; out.push(bq[1] + restoreInline(await translateFn(protectInline(bq[2], stash)), stash)); continue }

    // 表格行：逐格翻译
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const cells = line.split('|')
      const result = []
      for (let i = 0; i < cells.length; i++) {
        if (i === 0 || i === cells.length - 1 || !cells[i].trim()) { result.push(cells[i]); continue }
        const stash = []
        result.push(' ' + restoreInline(await translateFn(protectInline(cells[i].trim(), stash)), stash) + ' ')
      }
      out.push(result.join('|'))
      continue
    }

    // ── 普通段落行：整行翻译（带内联保护） ──
    const stash = []
    out.push(restoreInline(await translateFn(protectInline(line, stash)), stash))
  }

  return out.join('\n')
}
