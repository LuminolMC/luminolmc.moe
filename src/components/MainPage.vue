<script setup lang="ts">
import {
  NLayout,
  NLayoutContent,
  NLayoutFooter,
  NButton,
  NCard,
} from 'naive-ui'

defineProps<{ msg: string }>()
</script>

<template>
  <NLayout class="layout">
    <NLayoutContent style="padding: 0; margin: 0; width: 100%; box-sizing: border-box;">
      <!-- 英雄区域 -->
      <div style="text-align: center; padding: 200px 24px; background: linear-gradient(135deg, #646cff 0%, #535bf2 100%); color: white; margin-bottom: 40px; width: 100%; box-sizing: border-box;">
        <h1 style="font-size: 3rem; margin-bottom: 20px;">Luminol</h1>
        <p style="font-size: 1.2rem; max-width: 800px; margin: 0 auto 30px;">Luminol 是一个基于Folia的分支，具有许多有用的优化、可配置的原版特性和更多的API支持，它专为生存和无政府服务器设计</p>
        <!-- <div style="margin-bottom: 20px;">
          <a href="#" style="color: white; margin: 0 10px;">English</a> | <a href="#" style="color: white; margin: 0 10px;">中文</a>
        </div> -->
        <NButton type="primary" size="large" style="margin-right: 12px;">开始使用</NButton>
        <NButton size="large">了解更多</NButton>
      </div>

      <!-- 特性区域 -->
      <h2 style="text-align: center; font-size: 2rem; margin: 60px 0 40px;">核心特性</h2>
      <div style="max-width: 1200px; margin: 0 auto; padding: 0 24px;">
        <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 24px;">
          <NCard title="可配置原版特性" bordered class="feature-card" hover>
            <p>灵活调整游戏机制，满足服务器独特需求</p>
          </NCard>
          <NCard title="TPS监控支持" bordered class="feature-card" hover>
            <p>实时显示服务器性能，优化运营体验</p>
          </NCard>
          <NCard title="Folia Bug修复" bordered class="feature-card" hover>
            <p>解决核心问题，提升服务器稳定性</p>
          </NCard>
          <NCard title="多种存档格式" bordered class="feature-card" hover>
            <p>支持linear和b_linear格式，兼容更多场景</p>
          </NCard>
          <NCard title="扩展API支持" bordered class="feature-card" hover>
            <p>丰富插件开发能力，持续更新中</p>
          </NCard>
        </div>
      </div>
    </NLayoutContent>

    <div style="padding-top: 20px;">
      <NLayoutFooter style="text-align: center; padding: 24px; background: #f5f5f5; padding: 20px 24px; text-align: center;">
        <p>© 2025 Luminol Team. 保留所有权利。</p>
      </NLayoutFooter>
    </div>

  </NLayout>
</template>

<style scoped>
.layout {
  min-height: 100vh;
}

.feature-card {
  flex: 1 1 280px;
  max-width: 350px;
  transition: transform 0.3s;
}

.read-the-docs {
  color: #888;
}
</style>
