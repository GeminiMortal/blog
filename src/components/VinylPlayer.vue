<script setup>
// 唱片式播放器：旋转唱片 + 同步歌词 + 上下曲 + 自动连播
// 音频源：网易云外链 https://music.163.com/song/media/outer/url?id={id}.mp3（仅免费曲目可播）
// playlist 由 plugins/netease-playlist.js 构建期生成，VIP 歌曲已在构建期过滤
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'

const props = defineProps({
  playlist: { type: Object, required: true }
})

const audioEl = ref(null)
const lyricBox = ref(null)
const index = ref(0)
const playing = ref(false)
const current = ref(0)
const duration = ref(0)
const errorStreak = ref(0)

const track = computed(() => props.playlist.tracks[index.value] || props.playlist.tracks[0])
const lines = computed(() => parseLrc(track.value?.lyric || ''))
const activeLine = computed(() => {
  let idx = -1
  for (let i = 0; i < lines.value.length; i++) {
    if (lines.value[i].t <= current.value) idx = i
    else break
  }
  return idx
})

// LRC 歌词解析：一行可能带多个 [mm:ss.xx] 时间戳
function parseLrc(text) {
  const out = []
  for (const line of text.split(/\r?\n/)) {
    const stamps = [...line.matchAll(/\[(\d+):(\d+(?:\.\d+)?)\]/g)]
    if (!stamps.length) continue
    const content = line.replace(/\[[^\]]*\]/g, '').trim()
    for (const s of stamps) {
      out.push({ t: Number(s[1]) * 60 + Number(s[2]), text: content })
    }
  }
  return out.sort((a, b) => a.t - b.t)
}

function fmt(sec) {
  const s = Math.max(0, Math.floor(sec || 0))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

function play() {
  audioEl.value?.play()?.catch(() => {})
}

function toggle() {
  if (playing.value) audioEl.value?.pause()
  else play()
}

// 切歌只改索引，播放统一交给下方 watcher（避免 play() 作用于未更新的旧 src）
function prev() {
  index.value = (index.value - 1 + props.playlist.tracks.length) % props.playlist.tracks.length
}

function next() {
  index.value = (index.value + 1) % props.playlist.tracks.length
}

function seek(e) {
  if (audioEl.value) audioEl.value.currentTime = Number(e.target.value)
}

// 歌词高亮行变化时，滚动到面板中间
watch(activeLine, async i => {
  if (i < 0 || !lyricBox.value) return
  await nextTick()
  const el = lyricBox.value.querySelector(`[data-i="${i}"]`)
  if (el) {
    lyricBox.value.scrollTo({ top: el.offsetTop - lyricBox.value.clientHeight / 2 + el.clientHeight / 2, behavior: 'smooth' })
  }
})

// 切歌：等 DOM 的 src 换成新曲目后（flush: 'post'）再播放，否则 play() 作用于旧曲目导致切换后不播
// errorStreak 不在这里清零：只在真正播放成功时（@play 事件）重置，连续失败达到歌单长度才停止
watch(index, () => {
  current.value = 0
  duration.value = 0
  play()
}, { flush: 'post' })

onMounted(() => {
  // 自动播放：被浏览器策略拦截时，等待首次交互（点击/滚动）后自动开始
  const tryPlay = () => {
    audioEl.value?.play()?.then(() => {
      document.removeEventListener('pointerdown', tryPlay)
    }).catch(() => {})
  }
  tryPlay()
  document.addEventListener('pointerdown', tryPlay, { once: true })
  cleanupGesture = () => document.removeEventListener('pointerdown', tryPlay)
})

let cleanupGesture = () => {}

onBeforeUnmount(() => {
  cleanupGesture()
  audioEl.value?.pause()
})
</script>

<template>
  <div class="vinyl-player" :class="{ 'is-playing': playing }">
    <audio
      ref="audioEl"
      :src="`https://music.163.com/song/media/outer/url?id=${track.id}.mp3`"
      preload="auto"
      @timeupdate="current = audioEl.currentTime"
      @loadedmetadata="duration = audioEl.duration"
      @play="playing = true; errorStreak = 0"
      @pause="playing = false"
      @ended="next"
      @error="errorStreak++; errorStreak < playlist.tracks.length ? next() : (playing = false)"
    ></audio>

    <div class="vinyl-main">
      <div class="vinyl-stage">
        <div class="vinyl-disc">
          <img class="vinyl-cover" :src="track.pic || playlist.cover" :alt="track.name" />
          <span class="vinyl-hole"></span>
        </div>
        <div class="vinyl-arm"></div>
      </div>

      <div class="vinyl-side">
        <div class="vinyl-meta">
          <h3 class="vinyl-song">{{ track.name }}</h3>
          <p class="vinyl-artist">{{ track.artist }}<template v-if="track.album"> · {{ track.album }}</template></p>
          <p class="vinyl-listname">{{ playlist.name }} · {{ index + 1 }}/{{ playlist.tracks.length }} 首</p>
        </div>

        <div ref="lyricBox" class="vinyl-lyrics">
          <p v-if="!lines.length" class="lyric-empty">纯音乐 · 请欣赏</p>
          <template v-else>
            <p v-for="(line, i) in lines" :key="i" :data-i="i" :class="{ active: i === activeLine }">{{ line.text || '·' }}</p>
          </template>
        </div>
      </div>
    </div>

    <div class="vinyl-bottom">
      <div class="vinyl-controls">
        <button class="v-btn" type="button" aria-label="上一首" @click="prev">⏮</button>
        <button class="v-btn main" type="button" :aria-label="playing ? '暂停' : '播放'" @click="toggle">{{ playing ? '❚❚' : '▶' }}</button>
        <button class="v-btn" type="button" aria-label="下一首" @click="next">⏭</button>
      </div>

      <div class="vinyl-progress">
        <span>{{ fmt(current) }}</span>
        <input type="range" min="0" :max="duration || 0" step="0.1" :value="current" @input="seek" />
        <span>{{ fmt(duration) }}</span>
      </div>
    </div>
  </div>
</template>
