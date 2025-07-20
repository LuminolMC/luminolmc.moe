import { createRouter, createWebHistory } from 'vue-router'
import MainPage from './components/MainPage.vue'
import DownloadPage from './components/DownloadPage.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: MainPage
  },
  {
    path: '/download',
    name: 'download',
    component: DownloadPage
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, _, savedPosition) {
    // 如果路由meta中指定了不滚动到顶部，则使用保存的位置或默认位置
    if (to.meta.scrollToTop === false) {
      return savedPosition || { top: 0 }
    }
    // 默认为滚动到顶部
    return { top: 0 }
  }
})

export default router