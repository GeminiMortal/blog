// 构建期/开发期数据插件：根据 content/settings.md 里的网易云歌单 ID，
// 拉取曲目元数据、播放权限检查、歌词，生成 src/data/playlist.json
// - VIP/受限歌曲（拿不到音频 URL 或只能试听）在构建期直接过滤
// - 歌词缓存在 node_modules/.cache/netease-lyrics/，只有首次构建会逐首请求
// - 网络失败时沿用旧的生成文件，保证构建不中断
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { load } from 'js-yaml'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT = path.join(ROOT, 'src/data/playlist.json')
const LYRIC_CACHE = path.join(ROOT, 'node_modules/.cache/netease-lyrics')
const API = 'https://music.163.com'
const HEADERS = { 'User-Agent': 'Mozilla/5.0', Referer: 'https://music.163.com/' }
const EMPTY = { id: '', name: '', cover: '', count: 0, tracks: [] }

async function api(pathname, params) {
  const res = await fetch(`${API}${pathname}?${new URLSearchParams(params)}`, { headers: HEADERS })
  if (!res.ok) throw new Error(`netease api ${pathname} -> ${res.status}`)
  return res.json()
}

// 分批请求，每批 size 个
async function chunked(ids, size, fn) {
  const out = []
  for (let i = 0; i < ids.length; i += size) {
    out.push(...(await fn(ids.slice(i, i + size))))
  }
  return out
}

function readSettings() {
  const raw = fs.readFileSync(path.join(ROOT, 'content/settings.md'), 'utf8')
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  return match ? (load(match[1]) || {}) : {}
}

// 与 HomePage 同规则：支持纯数字 ID 或粘贴完整歌单链接
function extractPlaylistId(raw) {
  const value = String(raw || '').trim()
  if (/^\d+$/.test(value)) return value
  const match = value.match(/[?&]id=(\d+)/)
  return match ? match[1] : ''
}

async function fetchLyric(id) {
  const cacheFile = path.join(LYRIC_CACHE, `${id}.lrc`)
  if (fs.existsSync(cacheFile)) return fs.readFileSync(cacheFile, 'utf8')
  const data = await api('/api/song/lyric', { id, lv: 1, kv: 1, tv: -1 })
  const lyric = data?.lrc?.lyric || ''
  fs.mkdirSync(LYRIC_CACHE, { recursive: true })
  fs.writeFileSync(cacheFile, lyric)
  return lyric
}

async function buildPlaylist() {
  const playlistId = extractPlaylistId(readSettings().playlistId)
  if (!playlistId) return
  const detail = await api('/api/v6/playlist/detail', { id: playlistId, n: 0 })
  const p = detail.playlist
  const trackIds = p.trackIds.map(t => t.id)

  // 元数据：v3 批量详情（字段为 ar 艺术家 / al 专辑 / dt 时长毫秒）
  const songs = await chunked(trackIds, 100, chunk =>
    api('/api/v3/song/detail', { c: JSON.stringify(chunk.map(id => ({ id }))) }).then(d => d.songs || [])
  )
  // 播放权限：url 为空 = VIP/版权受限；freeTrialInfo 存在 = 仅试听片段，一律过滤
  const urls = await chunked(trackIds, 100, chunk =>
    api('/api/song/enhance/player/url', { ids: JSON.stringify(chunk), br: 128000 }).then(d => d.data || [])
  )
  const playable = new Map(urls.filter(x => x.url && !x.freeTrialInfo).map(x => [x.id, x]))
  const kept = songs.filter(s => playable.has(s.id))

  // 歌词：8 首并发，走磁盘缓存
  const tracks = []
  for (let i = 0; i < kept.length; i += 8) {
    const part = kept.slice(i, i + 8)
    const lyrics = await Promise.all(part.map(s => fetchLyric(s.id)))
    part.forEach((s, j) => {
      tracks.push({
        id: s.id,
        name: s.name,
        artist: (s.ar || []).map(a => a.name).join(' / '),
        album: (s.al || {}).name || '',
        pic: (s.al || {}).picUrl ? `${s.al.picUrl}?param=300y300` : '',
        duration: s.dt || 0,
        lyric: lyrics[j]
      })
    })
  }

  fs.writeFileSync(OUT, JSON.stringify({ id: playlistId, name: p.name, cover: `${p.coverImgUrl}?param=300y300`, count: tracks.length, tracks }, null, 2))
  console.log(`[netease] 「${p.name}」 ${tracks.length}/${trackIds.length} 首可外链播放，已生成 playlist.json`)
}

async function sync() {
  try {
    await buildPlaylist()
  } catch (err) {
    console.warn('[netease] 拉取失败，沿用旧数据：', err.message)
    if (!fs.existsSync(OUT)) {
      fs.mkdirSync(path.dirname(OUT), { recursive: true })
      fs.writeFileSync(OUT, JSON.stringify(EMPTY))
    }
  }
}

export default function neteasePlaylist() {
  return {
    name: 'netease-playlist',
    async buildStart() {
      await sync()
    },
    // dev 下后台改了歌单 ID 时自动重新生成
    configureServer(server) {
      server.watcher.on('change', p => {
        if (p.endsWith('settings.md')) sync()
      })
    }
  }
}
