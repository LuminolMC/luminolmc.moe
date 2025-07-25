<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import {
  NLayout,
  NLayoutContent,
  NButton,
  NCard,
} from 'naive-ui'

const openGithub = () => {
  window.open("https://github.com/LuminolMC/Luminol")
}
</script>

<template>
  <NLayout class="layout">
    <NLayoutContent style="padding: 0; margin: 0; width: 100%; box-sizing: border-box;">
      <!-- 下载区域 -->
      <div style="text-align: center; padding: 150px 24px; background: #b6ade6; color: white; margin-bottom: 40px; width: 100%; box-sizing: border-box; position: relative;">
        <h1 style="font-size: 3rem; margin-bottom: 20px;">{{ t('message.downloadTitle') }}</h1>
        <p style="font-size: 1.2rem; max-width: 800px; margin: 0 auto 30px;">{{ t('message.downloadDesc') }}</p>
        <NButton type="primary" size="large" style="margin-right: 12px;" @click="openGithub">{{ t('message.github_upper_case') }}</NButton>
        <p style="font-size: 1rem;">{{ t('message.downloadNotice') }}</p>
      </div>

      <!-- 下载选项 -->
      <div style="max-width: 900px; margin: 0 auto; padding: 0 24px;">
        <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 30px;">
          <NCard :title="t('message.stableVersion')" bordered style="flex: 1 1 350px; max-width: 400px; padding: 30px;">
            <p style="margin-bottom: 20px;">{{ t('message.version') }}: v1.0.0</p>
            <p style="margin-bottom: 30px;">{{ t('message.releaseDate') }}: 2025-01-15</p>
            <NButton type="primary" size="large" style="width: 100%;">{{ t('message.downloadStable') }}</NButton>
          </NCard>
          
          <NCard :title="t('message.devVersion')" bordered style="flex: 1 1 350px; max-width: 400px; padding: 30px;">
            <p style="margin-bottom: 20px;">{{ t('message.version') }}: v1.1.0-dev</p>
            <p style="margin-bottom: 30px;">{{ t('message.releaseDate') }}: 2025-02-20</p>
            <NButton type="warning" size="large" style="width: 100%;">{{ t('message.downloadDev') }}</NButton>
          </NCard>
        </div>
      </div>

      <!-- 安装指南 -->
      <div style="max-width: 900px; margin: 80px auto 60px; padding: 0 24px;">
        <h2 style="text-align: center; font-size: 2rem; margin-bottom: 40px;">{{ t('message.installGuide') }}</h2>
        <NCard bordered>
          <div style="padding: 20px;">
            <ol style="text-align: left; line-height: 1.8;">
              <li style="margin-bottom: 15px;">{{ t('message.installStep1') }}</li>
              <li style="margin-bottom: 15px;">{{ t('message.installStep2') }}</li>
              <li>{{ t('message.installStep3') }}</li>
            </ol>
          </div>
        </NCard>
      </div>
    </NLayoutContent>


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