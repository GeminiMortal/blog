<script setup>
import { computed, ref } from 'vue'

const language = ref('zh')
const playlistId = ''

const copy = {
  zh: {
    nav: { home: '首页', projects: '项目', logs: '日志', contact: '联系' },
    availability: '开放合作 / 2026',
    role: '独立开发者 · 数字产品构建者',
    hero: ['让想法在', '数字世界', '持续发光。'],
    intro: '我专注于用代码、设计与好奇心构建有温度的数字体验。这里记录正在发生的项目、灵感与技术实验。',
    explore: '查看项目', contact: '建立连接',
    status: '系统状态：在线',
    stack: '技术栈',
    now: '正在构建', nowTitle: '让复杂体验保持清晰', nowText: '从产品策略到前端实现，探索人工智能时代更自然、更有表达力的交互方式。', nowItems: ['Vue / Nuxt 生态', '生成式交互实验', '独立产品打磨'],
    projects: '精选项目', allProjects: '全部项目',
    projectList: [
      { no: '01', type: 'WEB EXPERIENCE', title: 'Neon Archive', text: '为数字创作者打造的灵感归档与叙事空间。', tags: ['Vue', 'Motion'] },
      { no: '02', type: 'PRODUCT DESIGN', title: 'Signal Garden', text: '将日常数据转化为可感知的生活节律。', tags: ['Data', 'UI/UX'] },
      { no: '03', type: 'OPEN SOURCE', title: 'Orbit Kit', text: '一套轻量、克制的界面构建工具集。', tags: ['TypeScript', 'Open'] },
    ],
    logs: '开发日志', logsMore: '查看全部日志',
    logList: [
      { date: '06.18.2026', tag: 'THOUGHTS', title: '在速度与留白之间，寻找产品的呼吸感' },
      { date: '06.02.2026', tag: 'BUILD LOG', title: '一次从模糊需求到可用原型的七日实验' },
      { date: '05.22.2026', tag: 'NOTES', title: '我如何整理持续涌现的灵感碎片' },
    ],
    music: '音乐终端', musicTitle: '工作时正在播放的声场', musicText: '由网易云音乐插件承载的个人歌单。播放需要由访客主动开启。', configure: '等待歌单配置', configureText: '将你的网易云音乐歌单 ID 填入页面配置后，官方播放器会显示在这里。', musicLink: '前往网易云音乐',
    contact: '建立连接', contactTitle: ['下一个有趣的', '信号，从一封邮件开始。'], contactText: '欢迎聊聊产品、创意编码、独立开发，或任何值得一起完成的想法。', email: '发送邮件',
    footer: '由好奇心与代码驱动', location: '中国 · 在线',
  },
  en: {
    nav: { home: 'Home', projects: 'Projects', logs: 'Logs', contact: 'Contact' },
    availability: 'OPEN TO COLLABORATE / 2026',
    role: 'Independent developer · Digital product maker',
    hero: ['Making ideas', 'glow in the', 'digital world.'],
    intro: 'I build thoughtful digital experiences with code, design, and curiosity. This is a home for works in progress, sparks, and technical experiments.',
    explore: 'View projects', contact: 'Get in touch',
    status: 'SYSTEM STATUS: ONLINE',
    stack: 'Tech stack',
    now: 'Now building', nowTitle: 'Keeping complex experiences clear', nowText: 'From product strategy to frontend craft, I explore more natural and expressive interactions for the AI era.', nowItems: ['Vue / Nuxt ecosystem', 'Generative interaction studies', 'Independent product craft'],
    projects: 'Selected projects', allProjects: 'All projects',
    projectList: [
      { no: '01', type: 'WEB EXPERIENCE', title: 'Neon Archive', text: 'An archival and storytelling space for digital creators.', tags: ['Vue', 'Motion'] },
      { no: '02', type: 'PRODUCT DESIGN', title: 'Signal Garden', text: 'Turning everyday data into a felt rhythm of life.', tags: ['Data', 'UI/UX'] },
      { no: '03', type: 'OPEN SOURCE', title: 'Orbit Kit', text: 'A light, focused toolkit for building interfaces.', tags: ['TypeScript', 'Open'] },
    ],
    logs: 'Build log', logsMore: 'All logs',
    logList: [
      { date: '06.18.2026', tag: 'THOUGHTS', title: 'Finding a product’s breath between speed and space' },
      { date: '06.02.2026', tag: 'BUILD LOG', title: 'A seven-day experiment from fuzzy brief to useful prototype' },
      { date: '05.22.2026', tag: 'NOTES', title: 'How I collect the steady stream of tiny ideas' },
    ],
    music: 'Music terminal', musicTitle: 'A sound field for focused work', musicText: 'A personal playlist powered by the NetEase Cloud Music plugin. Playback begins only when you choose it.', configure: 'Playlist awaiting setup', configureText: 'Add your NetEase Cloud Music playlist ID to the page configuration to reveal the official player here.', musicLink: 'Open NetEase Cloud Music',
    contact: 'Make contact', contactTitle: ['Let the next interesting', 'signal begin with an email.'], contactText: 'I am always glad to discuss products, creative coding, independent work, or an idea worth making together.', email: 'Send an email',
    footer: 'Powered by curiosity and code', location: 'China · Online',
  },
}

const t = computed(() => copy[language.value])
const playerUrl = computed(() => playlistId ? `https://music.163.com/outchain/player?type=0&id=${playlistId}&auto=0&height=430` : '')
</script>

<template>
  <main :lang="language">
    <nav class="nav container">
      <a class="brand" href="#top" aria-label="Home">/NOVA<span>_</span></a>
      <div class="nav-links">
        <a href="#top">{{ t.nav.home }}</a><a href="#projects">{{ t.nav.projects }}</a><a href="#logs">{{ t.nav.logs }}</a><a href="#contact">{{ t.nav.contact }}</a>
      </div>
      <div class="nav-right">
        <div class="language-switch" aria-label="Language selector"><button :class="{ active: language === 'zh' }" type="button" @click="language = 'zh'">中</button><span>/</span><button :class="{ active: language === 'en' }" type="button" @click="language = 'en'">EN</button></div>
        <span class="pulse"></span><span class="online">{{ t.status }}</span>
      </div>
    </nav>

    <section id="top" class="hero container">
      <div class="hero-copy">
        <p class="eyebrow"><span class="live-dot"></span>{{ t.availability }}</p>
        <p class="role">{{ t.role }}</p>
        <h1>{{ t.hero[0] }} <span>{{ t.hero[1] }}</span><br />{{ t.hero[2] }}</h1>
        <p class="intro">{{ t.intro }}</p>
        <div class="hero-actions"><a class="button primary" href="#projects">{{ t.explore }} <span>↘</span></a><a class="button quiet" href="#contact">{{ t.contact }} <span>→</span></a></div>
      </div>
      <div class="identity-panel" aria-label="Developer profile">
        <div class="panel-top"><span>PROFILE.DAT</span><span>01 / 01</span></div>
        <div class="orb"><div class="orb-core">&lt;/&gt;</div></div>
        <div class="panel-bottom"><span>CREATIVE<br />ENGINEER</span><span class="coordinates">23.12°N<br />113.26°E</span></div>
      </div>
      <div class="stack-strip"><span>{{ t.stack }}</span><i></i><b>VUE</b><b>NUXT</b><b>TYPESCRIPT</b><b>UI / UX</b><b>CREATIVE CODE</b></div>
    </section>

    <section class="now-section container">
      <div class="section-label"><span>01</span>{{ t.now }}</div>
      <article class="now-card"><div class="now-glow"></div><div><p class="card-kicker">CURRENT_SIGNAL</p><h2>{{ t.nowTitle }}</h2></div><p>{{ t.nowText }}</p><ul><li v-for="item in t.nowItems" :key="item">{{ item }}</li></ul></article>
    </section>

    <section id="projects" class="projects container">
      <div class="section-heading"><div class="section-label"><span>02</span>{{ t.projects }}</div><a href="#projects">{{ t.allProjects }} <span>→</span></a></div>
      <div class="project-grid"><article v-for="(project, index) in t.projectList" :key="project.title" class="project-card" :class="`project-${index + 1}`"><div class="project-visual"><span>{{ project.no }}</span><div class="visual-mark">{{ index === 0 ? '◌' : index === 1 ? '✦' : '△' }}</div></div><div class="project-meta"><span>{{ project.type }}</span><span>↗</span></div><h3>{{ project.title }}</h3><p>{{ project.text }}</p><div class="tags"><b v-for="tag in project.tags" :key="tag">{{ tag }}</b></div></article></div>
    </section>

    <section id="logs" class="logs container">
      <div class="section-heading"><div class="section-label"><span>03</span>{{ t.logs }}</div><a href="#logs">{{ t.logsMore }} <span>→</span></a></div>
      <a v-for="log in t.logList" :key="log.title" class="log-row" href="#logs"><span>{{ log.date }}</span><b>{{ log.tag }}</b><h3>{{ log.title }}</h3><i>↗</i></a>
    </section>

    <section class="music container">
      <div class="music-copy"><div class="section-label"><span>04</span>{{ t.music }}</div><h2>{{ t.musicTitle }}</h2><p>{{ t.musicText }}</p><a class="text-link" href="https://music.163.com/" target="_blank" rel="noreferrer">{{ t.musicLink }} <span>↗</span></a></div>
      <div class="music-player">
        <iframe v-if="playerUrl" :src="playerUrl" title="NetEase Cloud Music playlist" frameborder="0" loading="lazy"></iframe>
        <div v-else class="player-placeholder"><div class="equalizer"><i></i><i></i><i></i><i></i><i></i></div><p class="card-kicker">{{ t.configure }}</p><p>{{ t.configureText }}</p></div>
      </div>
    </section>

    <section id="contact" class="contact"><div class="container contact-inner"><p class="eyebrow">{{ t.contact }}</p><h2>{{ t.contactTitle[0] }}<br /><span>{{ t.contactTitle[1] }}</span></h2><p>{{ t.contactText }}</p><a class="button primary" href="mailto:hello@example.com">{{ t.email }} <span>↗</span></a></div></section>

    <footer class="footer container"><a class="brand" href="#top">/NOVA<span>_</span></a><p>{{ t.footer }}</p><p>{{ t.location }}</p><a href="#top">BACK TO TOP ↑</a></footer>
  </main>
</template>
