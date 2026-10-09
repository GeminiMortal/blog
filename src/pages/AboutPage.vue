<script setup>
// 个人介绍页：内容来自 content/about.md（后台 About 集合维护），中英文跟随站点语言切换
import { inject, computed } from 'vue'
import { about } from '../data/about.js'

const { t, language } = inject('i18n')
const a = computed(() => about[language.value])
</script>

<template>
  <main>
    <section class="page-header container">
      <div class="section-label"><span>06</span>{{ t.nav.about }}</div>
      <h1>{{ t.nav.about }}</h1>
      <p class="about-tagline">{{ a.tagline }}</p>
    </section>

    <section class="container about-bio">
      <p v-for="(para, i) in a.bio" :key="i">{{ para }}</p>
      <div class="about-facts">
        <div v-for="fact in a.facts" :key="fact.label">
          <span>{{ fact.label }}</span>
          <b v-if="fact.url"><a :href="fact.url" target="_blank" rel="noopener noreferrer">{{ fact.value }}</a></b>
          <b v-else>{{ fact.value }}</b>
        </div>
      </div>
    </section>

    <section class="container about-section">
      <div class="section-heading">
        <div class="section-label"><span>A</span>{{ language === 'zh' ? '技能' : 'Skills' }}</div>
      </div>
      <div class="skill-grid">
        <article v-for="group in a.skills" :key="group.name" class="skill-card">
          <h3>{{ group.name }}</h3>
          <ul>
            <li v-for="item in group.items" :key="item">{{ item }}</li>
          </ul>
        </article>
      </div>
    </section>

    <section class="container about-section">
      <div class="section-heading">
        <div class="section-label"><span>B</span>{{ language === 'zh' ? '经历' : 'Journey' }}</div>
      </div>
      <div class="about-timeline">
        <div v-for="item in a.timeline" :key="item.year + item.title" class="tl-item">
          <span class="tl-year">{{ item.year }}</span>
          <div class="tl-body">
            <h3>{{ item.title }}</h3>
            <p>{{ item.text }}</p>
          </div>
          <i class="tl-line"></i>
        </div>
      </div>
    </section>

    <section class="container about-section about-cta">
      <router-link class="button primary" to="/">{{ language === 'zh' ? '回到首页' : 'Back home' }} <span>↗</span></router-link>
    </section>
  </main>
</template>
