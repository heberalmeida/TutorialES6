<script setup>
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

function setLocale(newLocale) {
  locale.value = newLocale
  localStorage.setItem('locale', newLocale)
}
</script>

<template>
  <div class="language-switcher">
    <span class="label">{{ $t('common.language') }}:</span>
    <button
      :class="['btn', { active: locale === 'en' }]"
      @click="setLocale('en')"
    >
      English
    </button>
    <button
      :class="['btn', { active: locale === 'pt-BR' }]"
      @click="setLocale('pt-BR')"
    >
      Português
    </button>
  </div>
</template>

<style scoped>
.language-switcher {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.label {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.btn {
  padding: 0.35rem 0.75rem;
  font-size: 0.875rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
}
</style>
