<script setup>
import { ref, computed, provide } from 'vue'
import { useRoute } from 'vue-router'
import Nav from './components/Nav.vue'
import Footer from './components/Footer.vue'
import { copy } from './data/copy.js'

const language = ref('zh')
const t = computed(() => copy[language.value])

provide('i18n', { t, language, copy })

const route = useRoute()
const isAdmin = computed(() => route.path.startsWith('/admin'))
</script>

<template>
  <template v-if="isAdmin">
    <router-view />
  </template>
  <template v-else>
    <Nav />
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <Footer />
  </template>
</template>
