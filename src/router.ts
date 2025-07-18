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
  routes
})

export default router