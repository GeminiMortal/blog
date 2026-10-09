<script setup>
import { inject } from 'vue'
import { logs } from '../data/logs.js'
import LogRow from '../components/LogRow.vue'

const { t } = inject('i18n')
</script>

<template>
  <main>
    <section class="page-header container">
      <div class="section-label"><span>03</span>{{ t.logs }}</div>
      <h1>{{ t.logs }}</h1>
    </section>

    <section class="logs logs-full container">
      <LogRow v-for="log in logs" :key="log.id" :log="log" />
    </section>
  </main>
</template>