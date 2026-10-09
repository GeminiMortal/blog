<script setup>
// 文章详情页：content/logs/*.md 前言 + markdown 正文渲染
import { computed, inject } from 'vue'
import { useRoute } from 'vue-router'
import MarkdownIt from 'markdown-it'
import { logs } from '../data/logs.js'

const { language } = inject('i18n')
const route = useRoute()

const md = new MarkdownIt({ html: false, linkify: true, breaks: false })

const log = computed(() => logs.find(l => l.id === route.params.id))
const logIndex = computed(() => logs.findIndex(l => l.id === route.params.id))
const prevLog = computed(() => logIndex.value > 0 ? logs[logIndex.value - 1] : null)
const nextLog = computed(() => logIndex.value < logs.length - 1 ? logs[logIndex.value + 1] : null)
const rendered = computed(() => log.value ? md.render(log.value.content[language.value]) : '')
</script>

<template>
  <main v-if="log" class="detail-page">
    <section class="detail-header container">
      <router-link class="back-link" to="/logs">← {{ language === 'zh' ? '返回日志' : 'Back to logs' }}</router-link>
      <div class="detail-title-row">
        <div>
          <span class="detail-type">{{ log.tag }}</span>
          <h1>{{ log.title[language] || log.title.zh }}</h1>
        </div>
        <span class="detail-no">{{ log.date }}</span>
      </div>
    </section>

    <div class="container">
      <article class="post-body prose" v-html="rendered" />
    </div>

    <section class="detail-nav container">
      <router-link v-if="prevLog" :to="`/logs/${prevLog.id}`" class="detail-nav-item prev">
        <span>{{ language === 'zh' ? '上一篇' : 'Previous' }}</span>
        <h3>{{ prevLog.title[language] || prevLog.title.zh }}</h3>
      </router-link>
      <div v-else></div>
      <router-link v-if="nextLog" :to="`/logs/${nextLog.id}`" class="detail-nav-item next">
        <span>{{ language === 'zh' ? '下一篇' : 'Next' }}</span>
        <h3>{{ nextLog.title[language] || nextLog.title.zh }}</h3>
      </router-link>
    </section>
  </main>
</template>
