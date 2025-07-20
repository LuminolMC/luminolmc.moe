import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import { createPinia } from 'pinia'
import persistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(persistedstate)

const vueApp = createApp(App)
vueApp.use(router)
vueApp.use(pinia)
vueApp.use(i18n)
vueApp.mount('#app')
