<script setup>
import { inject } from 'vue'

const { language } = inject('i18n')

defineProps({
  log: { type: Object, required: true }
})
</script>

<template>
  <router-link class="log-row" :to="`/logs/${log.id}`">
    <span>{{ log.date }}</span>
    <b>{{ log.tag }}</b>
    <h3>{{ log.title[language] || log.title.zh }}</h3>
    <i>↗</i>
  </router-link>
</template>