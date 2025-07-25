// src/components.d.ts
declare module '*.vue' {
    import { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}

// 如果想让特定组件有类型提示，可以这样声明
declare module '@/components/ProfileCard.vue' {
    import { DefineComponent } from 'vue'
    const component: DefineComponent<{
        name: string
        description?: string
        avatar?: string
        fallbackAvatar?: string
    }>
    export default component
}
