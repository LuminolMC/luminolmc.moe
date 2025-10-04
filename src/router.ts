import {createRouter, createWebHistory} from 'vue-router'
import MainPage from './pages/MainPage.vue'
import DownloadPage from './pages/DownloadPage.vue'
import TeamPage from './pages/TeamPage.vue'
import DownloadManagerPage from './pages/DownloadManagerPage.vue'

const routes = [
    {
        path: '/',
        name: 'home',
        component: MainPage,
        meta: {
            title: 'LuminolMC | 高性能Minecraft服务端解决方案',
            description: 'LuminolMC - 致力于推动Folia生态的创新，为现代Minecraft服务端生态提供高性能解决方案'
        }
    },
    {
        path: '/download',
        name: 'download',
        component: DownloadPage,
        meta: {
            title: '下载 | LuminolMC',
            description: '下载LuminolMC，体验高性能Minecraft服务端解决方案'
        }
    },
    {
        path: '/team',
        name: 'team',
        component: TeamPage,
        meta: {
            title: '团队 | LuminolMC',
            description: '认识LuminolMC团队，了解我们如何通过更快、更安全的软件改善Minecraft游戏生态系统'
        }
    },
    {
        path: '/build-viewer',
        name: 'BuildViewer',
        component: DownloadManagerPage,
        meta: {
            title: '构建查看器 | LuminolMC',
            description: '查看LuminolMC项目的构建历史记录'
        }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, _, savedPosition) {
        // 如果路由meta中指定了不滚动到顶部，则使用保存的位置或默认位置
        if (to.meta.scrollToTop === false) {
            return savedPosition || {top: 0}
        }
        // 默认为滚动到顶部
        return {top: 0}
    }
})

export default router
