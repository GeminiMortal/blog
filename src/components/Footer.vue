<script setup>
import { inject } from 'vue'

const { t } = inject('i18n')

// hash 路由下 href="#top" 会触发一次无效路由跳转，这里改为 JS 平滑滚动
function backToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <footer class="footer container">
    <router-link class="brand" to="/">/GeminiMortal<span>_</span></router-link>
    <p>{{ t.footer }}</p>
    <p>{{ t.location }}</p>
    <a href="#" @click.prevent="backToTop">BACK TO TOP ↑</a>
  </footer>
</template>
