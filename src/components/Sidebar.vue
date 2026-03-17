<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { chapters } from '../data/chapters'

const route = useRoute()
const { t } = useI18n()

const navItems = computed(() => [
  { path: '/', key: 'intro', labelKey: 'sidebar.intro' },
  ...chapters.map((ch) => ({
    path: `/chapter/${ch.id}`,
    key: ch.id,
    labelKey: `sidebar.${ch.key}`,
  })),
])

function isActive(path) {
  if (path === '/') return route.path === '/'
  return route.params.id === path.replace('/chapter/', '')
}
</script>

<template>
  <nav class="sidebar-nav">
    <h2 class="sidebar-title">{{ $t('common.tableOfContents') }}</h2>
    <ul class="nav-list">
      <li v-for="item in navItems" :key="item.key" class="nav-item">
        <router-link
          :to="item.path"
          :class="['nav-link', { active: isActive(item.path) }]"
        >
          {{ $t(item.labelKey) }}
        </router-link>
      </li>
    </ul>
    <div class="sidebar-other">
      <h3>{{ $t('common.other') }}</h3>
      <ul>
        <li><a href="https://github.com/heberalmeida/TutorialES6" target="_blank" rel="noopener">{{ $t('common.sourceCode') }}</a></li>
        <li><a href="https://github.com/heberalmeida/TutorialES6/commits/main" target="_blank" rel="noopener">{{ $t('common.revisionHistory') }}</a></li>
        <li><a href="https://github.com/heberalmeida/TutorialES6/issues" target="_blank" rel="noopener">{{ $t('common.feedback') }}</a></li>
      </ul>
    </div>
  </nav>
</template>

<style scoped>
.sidebar-nav {
  padding: 1.5rem 0;
  height: 100%;
  overflow-y: auto;
}

.sidebar-title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  padding: 0 1.25rem;
  margin-bottom: 1rem;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  border-bottom: 1px solid transparent;
}

.nav-link {
  display: block;
  padding: 0.5rem 1.25rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.15s, background 0.15s;
  border-left: 3px solid transparent;
}

.nav-link:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}

.nav-link.active {
  color: var(--accent);
  font-weight: 500;
  border-left-color: var(--accent);
  background: var(--bg-active);
}

.sidebar-other {
  margin-top: 2rem;
  padding: 0 1.25rem;
  border-top: 1px solid var(--border-color);
  padding-top: 1rem;
}

.sidebar-other h3 {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
}

.sidebar-other ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-other li {
  margin-bottom: 0.5rem;
}

.sidebar-other a {
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-decoration: none;
}

.sidebar-other a:hover {
  color: var(--accent);
}
</style>
