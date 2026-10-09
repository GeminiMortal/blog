<script setup>
import { computed, inject } from 'vue'
import { useRoute } from 'vue-router'
import MarkdownIt from 'markdown-it'
import { projects } from '../data/projects.js'

const { t, language } = inject('i18n')
const route = useRoute()

const md = new MarkdownIt({ html: false, linkify: true, breaks: false })

const project = computed(() => projects.find(p => p.id === route.params.id))
const projectIndex = computed(() => projects.findIndex(p => p.id === route.params.id))
const prevProject = computed(() => projectIndex.value > 0 ? projects[projectIndex.value - 1] : null)
const nextProject = computed(() => projectIndex.value < projects.length - 1 ? projects[projectIndex.value + 1] : null)
const descriptionHtml = computed(() => project.value ? md.render(project.value.description[language.value]) : '')
const rendered = computed(() => project.value ? md.render(project.value.content[language.value]) : '')
</script>

<template>
  <main v-if="project" class="detail-page">
    <section class="detail-header container">
      <router-link class="back-link" to="/projects">← {{ t.projectDetail.back }}</router-link>
      <div class="detail-title-row">
        <div>
          <span class="detail-type">{{ project.type }}</span>
          <h1>{{ project.title[language] }}</h1>
        </div>
        <span class="detail-no">{{ project.no }}</span>
      </div>
    </section>

    <section class="detail-cover container" :style="{ background: project.coverColor }">
      <div class="visual-mark-large">{{ project.visualMark }}</div>
    </section>

    <section class="detail-body container">
      <div class="detail-info">
        <div class="detail-desc" v-html="descriptionHtml" />
        <div class="detail-sidebar">
          <div class="detail-section">
            <h3>{{ t.projectDetail.techStack }}</h3>
            <div class="tags">
              <b v-for="tag in project.tags" :key="tag">{{ tag }}</b>
            </div>
          </div>
          <div class="detail-section">
            <h3>{{ t.projectDetail.features }}</h3>
            <ul class="feature-list">
              <li v-for="feature in project.features[language]" :key="feature">{{ feature }}</li>
            </ul>
          </div>
          <div v-if="project.links.github || project.links.live" class="detail-section">
            <h3>{{ t.projectDetail.links }}</h3>
            <div class="detail-links">
              <a v-if="project.links.github" :href="project.links.github" target="_blank" rel="noreferrer">GitHub ↗</a>
              <a v-if="project.links.live" :href="project.links.live" target="_blank" rel="noreferrer">Live ↗</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="container">
      <article v-if="rendered" class="post-body prose" v-html="rendered" />
    </div>

    <section class="detail-nav container">
      <router-link v-if="prevProject" :to="`/projects/${prevProject.id}`" class="detail-nav-item prev">
        <span>{{ t.projectDetail.prevProject }}</span>
        <h3>{{ prevProject.title[language] }}</h3>
      </router-link>
      <div v-else></div>
      <router-link v-if="nextProject" :to="`/projects/${nextProject.id}`" class="detail-nav-item next">
        <span>{{ t.projectDetail.nextProject }}</span>
        <h3>{{ nextProject.title[language] }}</h3>
      </router-link>
    </section>
  </main>
</template>