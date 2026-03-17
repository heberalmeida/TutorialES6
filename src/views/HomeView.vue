<script setup>
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { chapters } from '../data/chapters'
import coverImage from '../assets/es6.jpg'

const { t } = useI18n()
const router = useRouter()

function goToChapter(id) {
  router.push(`/chapter/${id}`)
}
</script>

<template>
  <article class="home-view">
    <h1>{{ t('home.title') }}</h1>
    <p class="lead">{{ t('home.subtitle') }}</p>

    <img :src="coverImage" alt="ES6 Tutorial" class="cover" />

    <div class="links">
      <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank" rel="noopener">MDN JavaScript</a>
      <span class="sep">·</span>
      <a href="https://tc39.es/ecma262/" target="_blank" rel="noopener">ECMAScript Spec</a>
      <span class="sep">·</span>
      <a href="https://github.com/heberalmeida/TutorialES6" target="_blank" rel="noopener">GitHub</a>
    </div>

    <p>{{ t('home.description') }}</p>
    <p>{{ t('home.audience') }}</p>

    <section class="license-section">
      <h2>{{ t('home.licenseTitle') }}</h2>
      <p>{{ t('home.licenseText') }}</p>
    </section>

    <section class="start-reading">
      <h2>{{ t('common.tableOfContents') }}</h2>
      <div class="chapter-grid">
        <button
          v-for="ch in chapters.slice(0, 8)"
          :key="ch.id"
          class="chapter-card"
          @click="goToChapter(ch.id)"
        >
          {{ t(`sidebar.${ch.key}`) }}
        </button>
      </div>
      <router-link to="/chapter/intro" class="cta-link">
        {{ t('common.nextChapter') }} →
      </router-link>
    </section>
  </article>
</template>

<style scoped>
.home-view {
  max-width: 720px;
}

.home-view h1 {
  font-size: 2.25rem;
  margin-bottom: 0.5rem;
}

.lead {
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.cover {
  width: 100%;
  max-width: 320px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  margin-bottom: 1.5rem;
  display: block;
}

.links {
  margin-bottom: 1.5rem;
}

.links a {
  color: var(--accent);
  text-decoration: none;
}

.links a:hover {
  text-decoration: underline;
}

.sep {
  margin: 0 0.5rem;
  color: var(--text-muted);
}

.license-section {
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.license-section h2 {
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
}

.start-reading {
  margin-top: 2.5rem;
}

.start-reading h2 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.chapter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.chapter-card {
  padding: 1rem;
  text-align: left;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.chapter-card:hover {
  background: var(--bg-hover);
  border-color: var(--accent);
}

.cta-link {
  display: inline-block;
  color: var(--accent);
  text-decoration: none;
  font-weight: 500;
}

.cta-link:hover {
  text-decoration: underline;
}
</style>
