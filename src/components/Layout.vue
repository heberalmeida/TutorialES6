<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './Sidebar.vue'
import LanguageSwitcher from './LanguageSwitcher.vue'

const route = useRoute()
const isHome = computed(() => route.name === 'home')
</script>

<template>
  <div class="layout">
    <header class="header">
      <div class="header-inner">
        <router-link to="/" class="logo">
          {{ $t('sidebar.title') }}
        </router-link>
        <LanguageSwitcher />
      </div>
    </header>
    <div class="main">
      <aside class="sidebar">
        <Sidebar />
      </aside>
      <main class="content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
    <footer class="footer">
      <p>{{ $t('sidebar.author') }}: <a href="https://github.com/heberalmeida/TutorialES6" target="_blank" rel="noopener">{{ $t('sidebar.authorName') }}</a></p>
      <p>{{ $t('sidebar.license') }}: <a href="https://creativecommons.org/licenses/by-nc/4.0/" target="_blank" rel="noopener">CC BY-NC 4.0</a></p>
    </footer>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg-header);
  border-bottom: 1px solid var(--border-color);
  padding: 0.75rem 1.5rem;
}

.header-inner {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  text-decoration: none;
}

.logo:hover {
  color: var(--accent);
}

.main {
  flex: 1;
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.sidebar {
  width: 280px;
  flex-shrink: 0;
  border-right: 1px solid var(--border-color);
  background: var(--bg-sidebar);
}

.content {
  flex: 1;
  min-width: 0;
  padding: 2rem 3rem 4rem;
}

.footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid var(--border-color);
  background: var(--bg-footer);
  font-size: 0.875rem;
  color: var(--text-muted);
  text-align: center;
}

.footer a {
  color: var(--accent);
  text-decoration: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 900px) {
  .sidebar {
    display: none;
  }

  .content {
    padding: 1.5rem;
  }
}
</style>
