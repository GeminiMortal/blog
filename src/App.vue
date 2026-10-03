<script setup>
import { computed, ref } from 'vue'

const language = ref('zh')

const copy = {
  zh: {
    nav: ['文章', '随笔', '关于'], subscribe: '订阅',
    journal: '每周手记', headline: ['关于', '有意识地', '生活。'],
    intro: '记录设计、文化，以及那些让寻常日子变得格外有意义的细小瞬间。', explore: '浏览手记',
    featured: '精选文章', allEssays: '查看全部文章', featureMeta: '设计 · 2026年5月18日',
    featureTitle: '为真正重要的事留出空间', featureText: '当我们不再把注意力视为取之不尽的资源，而开始像守护珍贵之物那样保护它，会发生什么？', readEssay: '阅读文章',
    latest: '最新文字', issue: '第 24 期',
    inbox: '慢慢抵达你的收件箱', newsletter: ['每个周日，', '一封认真写下的信。'], email: '电子邮箱', placeholder: '你的邮箱地址', submit: '订阅', privacy: '没有噪音，随时可以取消订阅。',
    copyright: '© 2026 Commonplace', footerText: '在某个安静的地方，用心写下。', social: ['小红书', '即刻', '邮箱'],
    articles: [
      { tag: '设计', date: '2026年5月14日', title: '好界面里藏着的安静笃定', excerpt: '最好的数字产品会为思考留出余地。聊聊节奏、克制，以及那些让人愿意停留的细节。', read: '6 分钟阅读' },
      { tag: '生活', date: '2026年5月9日', title: '让工作更有思考感的小仪式', excerpt: '在通知、消息和打开的标签页之前，还有一种更从容的方式开启一天。', read: '4 分钟阅读' },
      { tag: '随笔', date: '2026年5月2日', title: '这个春天想记住的事', excerpt: '好咖啡、长散步、借来的书，以及其他值得珍藏在身边的小事。', read: '3 分钟阅读' },
    ],
  },
  en: {
    nav: ['Essays', 'Notes', 'About'], subscribe: 'Subscribe',
    journal: 'A weekly journal', headline: ['Notes on living', 'with', 'intention.'],
    intro: 'Observations on design, culture, and the small details that make an ordinary day feel meaningful.', explore: 'Explore the journal',
    featured: 'Featured essay', allEssays: 'View all essays', featureMeta: 'Design · May 18, 2026',
    featureTitle: 'On making space for the things that matter', featureText: 'What happens when we stop treating attention as an infinite resource, and begin protecting it like the precious thing it is?', readEssay: 'Read the essay',
    latest: 'Latest writing', issue: 'Issue No. 24',
    inbox: 'In your inbox, slowly', newsletter: ['One thoughtful note', 'each Sunday.'], email: 'Email address', placeholder: 'you@example.com', submit: 'Subscribe', privacy: 'No noise. Unsubscribe whenever you wish.',
    copyright: '© 2026 Commonplace', footerText: 'Written with care, somewhere quiet.', social: ['Instagram', 'Are.na', 'Email'],
    articles: [
      { tag: 'Design', date: 'May 14, 2026', title: 'The quiet confidence of a well-made interface', excerpt: 'The best digital products make room for people to think. A few notes on rhythm, restraint, and the details that invite us in.', read: '6 min read' },
      { tag: 'Culture', date: 'May 09, 2026', title: 'A small ritual for more thoughtful work', excerpt: 'Before the notifications and the open tabs, there is a slower way to begin the day.', read: '4 min read' },
      { tag: 'Notes', date: 'May 02, 2026', title: 'Things I want to remember this spring', excerpt: 'Good coffee, long walks, borrowed books, and other little things worth keeping close.', read: '3 min read' },
    ],
  },
}

const t = computed(() => copy[language.value])
const tones = ['coral', 'blue', 'gold']
</script>

<template>
  <main :lang="language">
    <nav class="nav container">
      <a class="brand" href="#top">Commonplace<span>.</span></a>
      <div class="nav-links">
        <a href="#essays">{{ t.nav[0] }}</a>
        <a href="#notes">{{ t.nav[1] }}</a>
        <a href="#about">{{ t.nav[2] }}</a>
      </div>
      <div class="nav-actions">
        <div class="language-switch" aria-label="Language selector">
          <button :class="{ active: language === 'zh' }" type="button" @click="language = 'zh'">中</button>
          <span>/</span>
          <button :class="{ active: language === 'en' }" type="button" @click="language = 'en'">EN</button>
        </div>
        <a class="subscribe-link" href="#subscribe">{{ t.subscribe }} <span>↗</span></a>
      </div>
    </nav>

    <section id="top" class="hero container">
      <p class="eyebrow">{{ t.journal }}</p>
      <h1>{{ t.headline[0] }}<br />{{ t.headline[1] }} <em>{{ t.headline[2] }}</em></h1>
      <p class="intro">{{ t.intro }}</p>
      <a class="round-link" href="#essays">{{ t.explore }} <span>↓</span></a>
    </section>

    <section id="essays" class="featured container">
      <div class="section-heading"><p class="eyebrow">{{ t.featured }}</p><a href="#notes">{{ t.allEssays }} <span>→</span></a></div>
      <article class="feature-card">
        <div class="feature-art"><span>01</span><i></i><b></b></div>
        <div class="feature-copy">
          <p class="meta">{{ t.featureMeta }}</p>
          <h2>{{ t.featureTitle }}</h2>
          <p>{{ t.featureText }}</p>
          <a class="text-link" href="#notes">{{ t.readEssay }} <span>→</span></a>
        </div>
      </article>
    </section>

    <section id="notes" class="latest container">
      <div class="section-heading"><p class="eyebrow">{{ t.latest }}</p><p class="issue">{{ t.issue }}</p></div>
      <div class="article-grid">
        <article v-for="(article, index) in t.articles" :key="article.title" class="article-card">
          <div class="card-art" :class="tones[index]"><span>{{ article.tag }}</span></div>
          <p class="meta">{{ article.tag }} · {{ article.date }}</p>
          <h3>{{ article.title }}</h3>
          <p class="excerpt">{{ article.excerpt }}</p>
          <p class="read-time">{{ article.read }} <span>→</span></p>
        </article>
      </div>
    </section>

    <section id="subscribe" class="newsletter">
      <div class="container newsletter-inner">
        <div><p class="eyebrow">{{ t.inbox }}</p><h2>{{ t.newsletter[0] }}<br />{{ t.newsletter[1] }}</h2></div>
        <form @submit.prevent>
          <label for="email">{{ t.email }}</label>
          <div class="email-row"><input id="email" type="email" :placeholder="t.placeholder" :aria-label="t.email" /><button type="submit">{{ t.submit }} <span>→</span></button></div>
          <p>{{ t.privacy }}</p>
        </form>
      </div>
    </section>

    <footer id="about" class="footer container">
      <p>{{ t.copyright }}</p><p>{{ t.footerText }}</p>
      <div><a v-for="name in t.social" :key="name" href="#top">{{ name }}</a></div>
    </footer>
  </main>
</template>
