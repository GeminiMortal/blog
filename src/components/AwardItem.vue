<script setup>
import { inject } from 'vue'

const { language } = inject('i18n')

defineProps({
  award: { type: Object, required: true },
  isLast: { type: Boolean, default: false }
})
</script>

<template>
  <div class="award-item" :class="{ 'award-last': isLast }">
    <div class="award-timeline">
      <div class="award-dot"></div>
      <div v-if="!isLast" class="award-line"></div>
    </div>
    <div class="award-content">
      <div class="award-header">
        <span class="award-date">{{ award.year }}.{{ String(award.month).padStart(2, '0') }}</span>
        <span class="award-issuer">{{ award.issuer[language] }}</span>
      </div>
      <router-link :to="`/awards/${award.id}`" class="award-card">
        <h3>{{ award.title[language] }} <i class="award-arrow">↗</i></h3>
        <p v-if="award.project" class="award-project">{{ award.project }}</p>
        <p class="award-desc">{{ award.description[language] }}</p>
      </router-link>
    </div>
  </div>
</template>