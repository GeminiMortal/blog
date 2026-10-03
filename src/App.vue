<script setup>
const articles = [
  {
    tag: 'Design',
    date: 'May 14, 2026',
    title: 'The quiet confidence of a well-made interface',
    excerpt: 'The best digital products make room for people to think. A few notes on rhythm, restraint, and the details that invite us in.',
    read: '6 min read',
    tone: 'coral',
  },
  {
    tag: 'Culture',
    date: 'May 09, 2026',
    title: 'A small ritual for more thoughtful work',
    excerpt: 'Before the notifications and the open tabs, there is a slower way to begin the day.',
    read: '4 min read',
    tone: 'blue',
  },
  {
    tag: 'Notes',
    date: 'May 02, 2026',
    title: 'Things I want to remember this spring',
    excerpt: 'Good coffee, long walks, borrowed books, and other little things worth keeping close.',
    read: '3 min read',
    tone: 'gold',
  },
]
</script>

<template>
  <main>
    <nav class="nav container">
      <a class="brand" href="#top">Commonplace<span>.</span></a>
      <div class="nav-links">
        <a href="#essays">Essays</a>
        <a href="#notes">Notes</a>
        <a href="#about">About</a>
      </div>
      <a class="subscribe-link" href="#subscribe">Subscribe <span>↗</span></a>
    </nav>

    <section id="top" class="hero container">
      <p class="eyebrow">A weekly journal</p>
      <h1>Notes on living<br />with <em>intention.</em></h1>
      <p class="intro">Observations on design, culture, and the small details that make an ordinary day feel meaningful.</p>
      <a class="round-link" href="#essays">Explore the journal <span>↓</span></a>
    </section>

    <section id="essays" class="featured container">
      <div class="section-heading">
        <p class="eyebrow">Featured essay</p>
        <a href="#notes">View all essays <span>→</span></a>
      </div>
      <article class="feature-card">
        <div class="feature-art"><span>01</span><i></i><b></b></div>
        <div class="feature-copy">
          <p class="meta">Design · May 18, 2026</p>
          <h2>On making space for the things that matter</h2>
          <p>What happens when we stop treating attention as an infinite resource, and begin protecting it like the precious thing it is?</p>
          <a class="text-link" href="#notes">Read the essay <span>→</span></a>
        </div>
      </article>
    </section>

    <section id="notes" class="latest container">
      <div class="section-heading">
        <p class="eyebrow">Latest writing</p>
        <p class="issue">Issue No. 24</p>
      </div>
      <div class="article-grid">
        <article v-for="article in articles" :key="article.title" class="article-card">
          <div class="card-art" :class="article.tone"><span>{{ article.tag }}</span></div>
          <p class="meta">{{ article.tag }} · {{ article.date }}</p>
          <h3>{{ article.title }}</h3>
          <p class="excerpt">{{ article.excerpt }}</p>
          <p class="read-time">{{ article.read }} <span>→</span></p>
        </article>
      </div>
    </section>

    <section id="subscribe" class="newsletter">
      <div class="container newsletter-inner">
        <div>
          <p class="eyebrow">In your inbox, slowly</p>
          <h2>One thoughtful note<br />each Sunday.</h2>
        </div>
        <form @submit.prevent>
          <label for="email">Email address</label>
          <div class="email-row">
            <input id="email" type="email" placeholder="you@example.com" aria-label="Email address" />
            <button type="submit">Subscribe <span>→</span></button>
          </div>
          <p>No noise. Unsubscribe whenever you wish.</p>
        </form>
      </div>
    </section>

    <footer id="about" class="footer container">
      <p>© 2026 Commonplace</p>
      <p>Written with care, somewhere quiet.</p>
      <div><a href="#top">Instagram</a><a href="#top">Are.na</a><a href="#top">Email</a></div>
    </footer>
  </main>
</template>
