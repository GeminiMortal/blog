<script setup>
// 获奖详情页：content/awards/*.md 前言字段 + 证书图片 + markdown 正文渲染
import { computed, inject } from 'vue'
import { useRoute } from 'vue-router'
import MarkdownIt from 'markdown-it'
import { awards } from '../data/awards.js'

const { language } = inject('i18n')
const route = useRoute()

const md = new MarkdownIt({ html: false, linkify: true, breaks: false })

const award = computed(() => awards.find(a => a.id === route.params.id))
const awardIndex = computed(() => awards.findIndex(a => a.id === route.params.id))
const prevAward = computed(() => awardIndex.value > 0 ? awards[awardIndex.value - 1] : null)
const nextAward = computed(() => awardIndex.value < awards.length - 1 ? awards[awardIndex.value + 1] : null)
const rendered = computed(() => award.value ? md.render(award.value.content[language.value]) : '')
</script>

<template>
  <main v-if="award" class="detail-page">
    <section class="detail-header container">
      <router-link class="back-link" to="/awards">← {{ language === 'zh' ? '返回获奖列表' : 'Back to awards' }}</router-link>
      <div class="detail-title-row">
        <div>
          <span class="detail-type">{{ award.issuer[language] }}</span>
          <h1>{{ award.title[language] }}</h1>
        </div>
        <span class="detail-no">{{ award.year }}.{{ String(award.month).padStart(2, '0') }}</span>
      </div>
    </section>

    <section v-if="award.image" class="detail-cover container">
      <img :src="award.image" :alt="award.title[language]" class="award-image" />
    </section>

    <section class="detail-body container award-detail-body">
      <div class="detail-desc">
        <p v-if="award.project" class="award-project">{{ award.project }}</p>
        <p>{{ award.description[language] }}</p>
      </div>
    </section>

    <div class="container">
      <article v-if="rendered" class="post-body prose" v-html="rendered" />
    </div>

    <section class="detail-nav container">
      <router-link v-if="prevAward" :to="`/awards/${prevAward.id}`" class="detail-nav-item prev">
        <span>{{ language === 'zh' ? '上一项' : 'Previous' }}</span>
        <h3>{{ prevAward.title[language] }}</h3>
      </router-link>
      <div v-else></div>
      <router-link v-if="nextAward" :to="`/awards/${nextAward.id}`" class="detail-nav-item next">
        <span>{{ language === 'zh' ? '下一项' : 'Next' }}</span>
        <h3>{{ nextAward.title[language] }}</h3>
      </router-link>
    </section>
  </main>
</template>
