<script setup>
import { inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const { t, language } = inject('i18n')
const router = useRouter()
const route = useRoute()

const scrollToContact = () => {
  if (route.path !== '/') {
    router.push('/').then(() => {
      setTimeout(() => {
        const el = document.getElementById('contact')
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    })
  } else {
    const el = document.getElementById('contact')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<template>
  <nav class="nav container">
    <router-link class="brand" to="/" aria-label="Home">/GeminiMortal<span>_</span></router-link>
    <div class="nav-links">
      <router-link to="/">{{ t.nav.home }}</router-link>
      <router-link to="/projects">{{ t.nav.projects }}</router-link>
      <router-link to="/awards">{{ t.nav.awards }}</router-link>
      <router-link to="/logs">{{ t.nav.logs }}</router-link>
      <router-link to="/about">{{ t.nav.about }}</router-link>
      <a href="#" @click.prevent="scrollToContact">{{ t.nav.contact }}</a>
    </div>
    <button class="mobile-menu-btn" type="button" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>
    <div class="nav-right">
      <div class="language-switch" aria-label="Language selector">
        <button :class="{ active: language === 'zh' }" type="button" @click="language = 'zh'">中</button>
        <span>/</span>
        <button :class="{ active: language === 'en' }" type="button" @click="language = 'en'">EN</button>
      </div>
      <span class="pulse"></span>
      <span class="online">{{ t.status }}</span>
    </div>
  </nav>
</template>