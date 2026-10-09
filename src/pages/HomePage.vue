<script setup>
import { inject } from 'vue'
import { projects } from '../data/projects.js'
import { logs } from '../data/logs.js'
import { settings } from '../data/settings.js'
import { playlist } from '../data/playlist.js'
import ProjectCard from '../components/ProjectCard.vue'
import LogRow from '../components/LogRow.vue'
import VinylPlayer from '../components/VinylPlayer.vue'

const { t, language } = inject('i18n')
</script>

<template>
  <main>
    <section id="top" class="hero container">
      <div class="hero-copy">
        <p class="eyebrow"><span class="live-dot"></span>{{ t.availability }}</p>
        <p class="role">{{ t.role }}</p>
        <h1>{{ t.hero[0] }} <span>{{ t.hero[1] }}</span><br />{{ t.hero[2] }}</h1>
        <p class="intro">{{ t.intro }}</p>
        <div class="hero-actions">
          <router-link class="button primary" to="/projects">{{ t.explore }} <span>↘</span></router-link>
          <a class="button quiet" href="#contact">{{ t.contactBtn }} <span>→</span></a>
        </div>
      </div>
      <div class="identity-panel" aria-label="Developer profile">
        <div class="panel-top"><span>PROFILE.DAT</span><span>01 / 01</span></div>
        <div class="orb"><div class="orb-core">&lt;/&gt;</div></div>
        <div class="panel-bottom"><span>CREATIVE<br />ENGINEER</span><span class="coordinates">41.80°N<br />123.43°E</span></div>
      </div>
      <div class="stack-strip"><span>{{ t.stack }}</span><i></i><b>VUE</b><b>NUXT</b><b>TYPESCRIPT</b><b>UI / UX</b><b>CREATIVE CODE</b></div>
    </section>

    <section class="now-section container">
      <div class="section-label"><span>01</span>{{ t.now }}</div>
      <article class="now-card">
        <div class="now-glow"></div>
        <div><p class="card-kicker">CURRENT_SIGNAL</p><h2>{{ t.nowTitle }}</h2></div>
        <p>{{ t.nowText }}</p>
        <ul><li v-for="item in t.nowItems" :key="item">{{ item }}</li></ul>
      </article>
    </section>

    <section id="projects" class="projects container">
      <div class="section-heading">
        <div class="section-label"><span>02</span>{{ t.projects }}</div>
        <router-link to="/projects">{{ t.allProjects }} <span>→</span></router-link>
      </div>
      <div class="project-grid">
        <ProjectCard v-for="(project, index) in projects" :key="project.id" :project="project" :index="index" />
      </div>
    </section>

    <section id="logs" class="logs container">
      <div class="section-heading">
        <div class="section-label"><span>03</span>{{ t.logs }}</div>
        <router-link to="/logs">{{ t.logsMore }} <span>→</span></router-link>
      </div>
      <LogRow v-for="log in logs.slice(0, 3)" :key="log.id" :log="log" />
    </section>

    <section class="music container">
      <div class="music-copy">
        <div class="section-label"><span>04</span>{{ t.music }}</div>
        <h2>{{ t.musicTitle }}</h2>
        <p>{{ t.musicText }}</p>
        <a class="text-link" :href="settings.musicUrl" target="_blank" rel="noreferrer">{{ t.musicLink }} <span>↗</span></a>
      </div>
      <div class="music-player">
        <VinylPlayer v-if="playlist.tracks.length" :playlist="playlist" />
        <div v-else class="player-placeholder">
          <div class="equalizer"><i></i><i></i><i></i><i></i><i></i></div>
          <p class="card-kicker">{{ t.configure }}</p>
          <p>{{ t.configureText }}</p>
        </div>
      </div>
    </section>

    <section id="contact" class="contact">
      <div class="container contact-inner">
        <p class="eyebrow">{{ t.contact }}</p>
        <h2>{{ t.contactTitle[0] }}<br /><span>{{ t.contactTitle[1] }}</span></h2>
        <p>{{ t.contactText }}</p>
        <a class="button primary" :href="`mailto:${settings.email}`">{{ t.email }} <span>↗</span></a>
      </div>
    </section>
  </main>
</template>