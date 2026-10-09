<script setup>
import { inject } from 'vue'

const { language } = inject('i18n')

defineProps({
  project: { type: Object, required: true },
  index: { type: Number, required: true }
})
</script>

<template>
  <router-link :to="`/projects/${project.id}`" class="project-card" :class="`project-${index + 1}`">
    <div class="project-visual" :style="{ background: project.coverColor }">
      <span>{{ project.no }}</span>
      <div class="visual-mark">{{ project.visualMark }}</div>
    </div>
    <div class="project-meta">
      <span>{{ project.type }}</span>
      <span>↗</span>
    </div>
    <h3>{{ project.title[language] }}</h3>
    <p>{{ project.summary[language] }}</p>
    <div class="tags">
      <b v-for="tag in project.tags" :key="tag">{{ tag }}</b>
    </div>
  </router-link>
</template>