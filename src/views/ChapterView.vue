<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { marked } from 'marked'
import { chapters } from '../data/chapters'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const route = useRoute()
const { locale } = useI18n()
const content = ref('')
const loading = ref(true)
const error = ref(false)

const currentIndex = computed(() => {
  const i = chapters.findIndex((ch) => ch.id === props.id)
  return i >= 0 ? i : 0
})

const prevChapter = computed(() => {
  if (currentIndex.value <= 0) return null
  return chapters[currentIndex.value - 1]
})

const nextChapter = computed(() => {
  if (currentIndex.value >= chapters.length - 1) return null
  return chapters[currentIndex.value + 1]
})

async function loadContent() {
  loading.value = true
  error.value = false
  window.scrollTo(0, 0)
  const loc = locale.value === 'pt-BR' ? 'pt-BR' : 'en'
  try {
    const base = import.meta.env.BASE_URL
    const res = await fetch(`${base}content/${loc}/${props.id}.md`)
    if (!res.ok) throw new Error('Not found')
    const text = await res.text()
    content.value = marked.parse(text)
  } catch {
    error.value = true
    content.value = ''
  } finally {
    loading.value = false
    window.scrollTo(0, 0)
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  document.documentElement.scrollTo?.({ top: 0, behavior: 'smooth' })
}

watch(
  () => [props.id, locale.value],
  () => loadContent(),
  { immediate: true }
)
</script>

<template>
  <article class="chapter-view">
    <div v-if="loading" class="loading">{{ $t('common.loading') }}</div>
    <div v-else-if="error" class="error">{{ $t('common.error') }}</div>
    <div
      v-else
      class="markdown-body"
      v-html="content"
    />

    <nav class="chapter-nav">
      <router-link
        v-if="prevChapter"
        :to="`/chapter/${prevChapter.id}`"
        class="nav-btn prev"
      >
        ← {{ $t('common.prevChapter') }}
      </router-link>
      <span v-else class="nav-btn prev disabled"></span>
      <router-link
        v-if="nextChapter"
        :to="`/chapter/${nextChapter.id}`"
        class="nav-btn next"
      >
        {{ $t('common.nextChapter') }} →
      </router-link>
      <span v-else class="nav-btn next disabled"></span>
    </nav>

    <button class="back-top" @click="scrollToTop">
      {{ $t('common.backToTop') }}
    </button>
  </article>
</template>

<style scoped>
.chapter-view {
  position: relative;
}

.loading,
.error {
  padding: 3rem;
  text-align: center;
  color: var(--text-muted);
}

.error {
  color: var(--error, #c0392b);
}

.chapter-nav {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}

.nav-btn {
  padding: 0.75rem 1rem;
  color: var(--accent);
  text-decoration: none;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.nav-btn:hover:not(.disabled) {
  background: var(--bg-hover);
}

.nav-btn.disabled {
  visibility: hidden;
}

.back-top {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-card);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.back-top:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}
</style>
