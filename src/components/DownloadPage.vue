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
      <!-- 下载区域 -->
      <div style="text-align: center; padding: 150px 24px; background: linear-gradient(135deg, #646cff 0%, #535bf2 100%); color: white; margin-bottom: 40px; width: 100%; box-sizing: border-box;">
        <h1 style="font-size: 3rem; margin-bottom: 20px;">下载 Luminol</h1>
        <p style="font-size: 1.2rem; max-width: 800px; margin: 0 auto 30px;">选择适合您服务器的版本进行下载，开始使用 Luminol 的强大功能</p>
      </div>

      <!-- 下载选项 -->
      <div style="max-width: 900px; margin: 0 auto; padding: 0 24px;">
        <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 30px;">
          <NCard title="最新稳定版" bordered style="flex: 1 1 350px; max-width: 400px; padding: 30px;">
            <p style="margin-bottom: 20px;">版本: v1.0.0</p>
            <p style="margin-bottom: 30px;">发布日期: 2025-01-15</p>
            <NButton type="primary" size="large" style="width: 100%;">下载稳定版</NButton>
          </NCard>
          
          <NCard title="开发预览版" bordered style="flex: 1 1 350px; max-width: 400px; padding: 30px;">
            <p style="margin-bottom: 20px;">版本: v1.1.0-dev</p>
            <p style="margin-bottom: 30px;">发布日期: 2025-02-20</p>
            <NButton type="warning" size="large" style="width: 100%;">下载开发版</NButton>
          </NCard>
        </div>
      </div>

      <!-- 安装指南 -->
      <div style="max-width: 900px; margin: 80px auto 60px; padding: 0 24px;">
        <h2 style="text-align: center; font-size: 2rem; margin-bottom: 40px;">安装指南</h2>
        <NCard bordered>
          <div style="padding: 20px;">
            <ol style="text-align: left; line-height: 1.8;">
              <li style="margin-bottom: 15px;">下载适合您的 Luminol 版本</li>
              <li style="margin-bottom: 15px;">运行启动脚本开始服务器</li>
              <li>享受 Luminol 带来的优化体验！</li>
            </ol>
          </div>
        </NCard>
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

.read-the-docs {
  color: #888;
}
</style>