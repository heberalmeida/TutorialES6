import { createI18n } from 'vue-i18n'
import en from './en.js'
import ptBR from './pt-BR.js'

const browserLocale = navigator.language.startsWith('pt') ? 'pt-BR' : 'en'
const savedLocale = localStorage.getItem('locale') || browserLocale

export const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'en',
  messages: {
    en,
    'pt-BR': ptBR,
  },
})
