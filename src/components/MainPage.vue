<script setup lang="ts">
import { callApi } from "@zayne-labs/callapi";
import { computed, ref, onMounted } from "vue"
import { useI18n } from 'vue-i18n'
import {
  NLayout,
  NLayoutContent,
  NButton,
  NCard,
} from 'naive-ui'

const { t, locale } = useI18n()
const currentLocale = locale

function changeLanguage(lang: string) {
  locale.value = lang
}


type TimeValuePair = [number, number]
type TimeSeriesData = TimeValuePair[];
const data = ref<TimeSeriesData | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    // 设置5秒超时
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const playerDataRes = await callApi<TimeSeriesData>(
      "https://bstats.org/api/v1/plugins/20909/charts/players/data",
      { signal: controller.signal }
    );
    
    clearTimeout(timeoutId);
    data.value = playerDataRes.data;
  } catch (err) {
    error.value = "无法加载玩家数据: " + (err instanceof Error ? err.message : String(err));
    console.error("API调用错误:", err);
  } finally {
    isLoading.value = false;
  }
});
const playerCount = computed(() => {
  if (!data.value || data.value.length === 0) return -1;
  return data.value[data.value.length - 1][1] || -1;
});

</script>

<template>
  <NLayout class="layout">
    <NLayoutContent style="padding: 0; margin: 0; width: 100%; box-sizing: border-box;">
      <!-- Hero -->
      <div style="text-align: center; padding: 200px 24px; background: linear-gradient(135deg, #646cff 0%, #535bf2 100%); color: white; margin-bottom: 40px; width: 100%; box-sizing: border-box; position: relative;">
          <div style="position: absolute; top: 20px; right: 20px; display: flex; gap: 10px;">
            <NButton @click="changeLanguage('en')" :type="currentLocale === 'en' ? 'primary' : 'default'" size="small">English</NButton>
            <NButton @click="changeLanguage('zh')" :type="currentLocale === 'zh' ? 'primary' : 'default'" size="small">中文</NButton>
          </div>
        <h1 style="font-size: 3rem; margin-bottom: 20px;">Luminol</h1>
        <p style="font-size: 1.2rem; max-width: 800px; margin: 0 auto 30px;">{{ t('message.welcome') }}</p>
        <!-- <div style="margin-bottom: 20px;">
          <a href="#" style="color: white; margin: 0 10px;">English</a> | <a href="#" style="color: white; margin: 0 10px;">中文</a>
        </div> -->
        <NButton type="primary" size="large" style="margin-right: 12px;">{{ t('message.startUsing') }}</NButton>
        <NButton strong secondary size="large">{{ t('message.learnMore') }}</NButton>
        <div style="font-size: 1.1rem">
          <p v-if="!isLoading && !error">{{ $t('message.servingPlayers', { count: playerCount }) }}</p>
          <p v-else-if="isLoading">{{ $t('message.loadingPlayers') }}</p>
          <p v-else class="error">{{ $t('message.' + error) }}</p>
        </div>
      </div>

      <!-- Features -->
      <h2 style="text-align: center; font-size: 2rem; margin: 60px 0 40px;">{{ t('message.coreFeatures') }}</h2>
      <div style="max-width: 1200px; margin: 0 auto; padding: 0 24px;">
        <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 24px;">
          <NCard :title="t('message.configurableVanillaFeatures')" bordered class="feature-card" hover>
            <p>{{ t('message.configurableDesc') }}</p>
          </NCard>
          <NCard :title="t('message.tpsMonitoringSupport')" bordered class="feature-card" hover>
            <p>{{ t('message.tpsDesc') }}</p>
          </NCard>
          <NCard :title="t('message.foliaBugFixes')" bordered class="feature-card" hover>
            <p>{{ t('message.bugFixesDesc') }}</p>
          </NCard>
          <NCard :title="t('message.multipleSaveFormats')" bordered class="feature-card" hover>
            <p>{{ t('message.saveFormatsDesc') }}</p>
          </NCard>
          <NCard :title="t('message.expandedApiSupport')" bordered class="feature-card" hover>
            <p>{{ t('message.apiSupportDesc') }}</p>
          </NCard>
        </div>
      </div>

      <!-- Statistics -->
      <!-- <h2 style="text-align: center; font-size: 2rem; margin: 60px 0 40px;">{{ t('message.coreFeatures') }}</h2> -->

    </NLayoutContent>
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
