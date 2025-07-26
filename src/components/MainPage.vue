<script setup lang="ts">
import { callApi } from "@zayne-labs/callapi";
import { ref, onMounted, computed } from "vue"
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import {
  NLayout,
  NLayoutContent,
  NButton,
  NCard,
} from 'naive-ui'

type TimeValuePair = [number, number]
type TimeSeriesData = TimeValuePair[];
const isLoading = ref(true);
const error = ref<string | null>(null)
const sum = ref<number>(0)

onMounted(async () => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  const urls = [
    "https://bstats.org/api/v1/plugins/20909/charts/players/data",
    "https://bstats.org/api/v1/plugins/26599/charts/players/data",
    "https://bstats.org/api/v1/plugins/26215/charts/players/data",
  ];

  try {
    const promises = urls.map(url =>
        callApi<TimeSeriesData>(url, { signal: controller.signal })
            .then(response => {
              if (response.data === null) {
                throw new Error(`Unable to retrieve time series for ${url}`);
              }
              return response.data[response.data.length - 1][1];
            })
    );

    const results = await Promise.all(promises);
    clearTimeout(timeoutId);
    sum.value = results.reduce((total, num) => total + num, 0);
  } catch (err) {
    error.value = String(err);
    console.error("Fetch error:", err);
  } finally {
    isLoading.value = false;
  }
});

const goTo = (url: string) => {
  window.open(url)
}

const softwareItems = computed(() => {
  return [
    { name: "Luminol", description: t('message.software.luminolDesc'), link: "https://github.com/LuminolMC/Luminol" },
    { name: "Lophine", description: t('message.software.lophineDesc'), link: "https://github.com/LuminolMC/Lophine" },
    { name: "LightingLuminol", description: t('message.software.lightningLuminolDesc'), link: "https://github.com/LuminolMC/LightingLuminol" },
  ]
})
</script>

<template>
  <NLayout class="layout">
    <NLayoutContent style="padding: 0; margin: 0; width: 100%; box-sizing: border-box;">
      <!-- Hero -->
      <div style="text-align: center; padding: 200px 24px; background: #b6ade6; color: white; margin-bottom: 40px; width: 100%; box-sizing: border-box; position: relative;">
        <h1 style="font-size: 4rem; margin-bottom: 20px;">LuminolMC</h1>
        <p style="font-size: 1.2rem; max-width: 800px; margin: 0 auto 30px;">{{ t('message.welcome') }}</p>
        <div style="display: inline-flex; align-items: center;">
          <NButton type="primary" size="large" style="margin-right: 12px;">{{ t('message.startUsing') }}</NButton>
          <NButton strong secondary size="large" style="margin-right: 12px;">{{ t('message.learnMore') }}</NButton>
          <NButton type="info" strong secondary size="large" style="color: black; margin-right: 0;" @click="goTo('https://www.rainyun.com/rgs/aiyuyun_')">
            在&nbsp<img src="./rainyun.svg" alt="rainyun" height="20px"/>&nbsp上部署
          </NButton>
        </div>

        <div style="font-size: 1.1rem">
          <p v-if="!isLoading && !error">{{ $t('message.servingPlayers', { count: sum }) }}</p>
          <p v-else-if="isLoading">{{ $t('message.loadingPlayers') }}</p>
          <p v-else class="error">{{ $t('message.' + error) }}</p>
        </div>
      </div>

      <h2 style="text-align: center; font-size: 2rem; margin: 60px 0 40px;">{{ t('message.majorProject') }}</h2>
      <div style="max-width: 1200px; margin: 0 auto; padding: 0 24px;">
        <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 24px;">
          <NCard v-for="(item) in softwareItems" :title="item.name" class="software-card" hoverable @click="goTo(item.link)">
            {{ item.description }}
          </NCard>
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
    </NLayoutContent>
  </NLayout>
</template>

<style scoped>
.layout {
  min-height: 100vh;
}

.software-card {
  flex: 1 1 280px;

  transition: transform 0.3s;
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
