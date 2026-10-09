<script setup>
import { inject } from 'vue'
import { projects } from '../data/projects.js'
import ProjectCard from '../components/ProjectCard.vue'

const { t } = inject('i18n')
</script>

<template>
  <main>
    <section class="page-header container">
      <div class="section-label"><span>02</span>{{ t.projects }}</div>
      <h1>{{ t.allProjects }}</h1>
      <p class="page-desc">{{ t.intro }}</p>
    </section>

    <section class="projects container">
      <div class="project-grid project-grid-full">
        <ProjectCard v-for="(project, index) in projects" :key="project.id" :project="project" :index="index" />
      </div>
    </section>
  </main>
</template>