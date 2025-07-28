import { createI18n } from 'vue-i18n'
import en from './en'
import zh from './zh'

export default createI18n({
  legacy: false,
  locale: 'zg',
  fallbackLocale: 'en',
  messages: {
    en,
    zh
  }
})