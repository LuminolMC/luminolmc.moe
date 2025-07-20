import { defineStore } from 'pinia'

export const useLanguageStore = defineStore('language', {
    state: () => ({
        language: 'zh',
    }),
    persist: true
})
