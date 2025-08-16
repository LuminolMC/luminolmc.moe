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

// 添加导航守卫以更新页面标题和meta标签
router.beforeEach((to, from, next) => {
  // 更新页面标题
  if (to.meta.title) {
    document.title = to.meta.title as string;
  }

  // 更新meta描述
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription && to.meta.description) {
    metaDescription.setAttribute('content', to.meta.description as string);
  }

  next();
})

vueApp.mount('#app')
