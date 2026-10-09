<script setup>
import { inject } from 'vue'
import { awards } from '../data/awards.js'
import AwardItem from '../components/AwardItem.vue'

const { t } = inject('i18n')
</script>

<template>
  <main>
    <section class="page-header container">
      <div class="section-label"><span>05</span>{{ t.awards }}</div>
      <h1>{{ t.awards }}</h1>
      <p class="page-desc">{{ t.awardsIntro }}</p>
    </section>

    <section class="awards-section container">
      <div class="awards-timeline">
        <AwardItem v-for="(award, index) in awards" :key="award.id" :award="award" :is-last="index === awards.length - 1" />
      </div>
    </section>
  </main>
</template>