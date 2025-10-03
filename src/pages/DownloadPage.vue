<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref, onMounted, computed } from 'vue'
import {
  NLayout,
  NLayoutContent,
  NButton,
  NCard,
  NCode,
  NSpin,
  NAlert
} from 'naive-ui'

const { t } = useI18n()

interface Release {
  name: string
  tag_name: string
  published_at: string
  html_url: string
  prerelease: boolean
}

const releases = ref<Release[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const activeProject = ref('luminol')

// 获取稳定版本
const getStableReleases = () => {
  return releases.value
    .filter(release => !release.prerelease)
    .sort((a, b) => {
      const dateA = new Date(a.published_at).getTime()
      const dateB = new Date(b.published_at).getTime()
      return dateB - dateA
    })
}

// 获取开发版本
const getDevReleases = () => {
  return releases.value
    .filter(release => release.prerelease)
    .sort((a, b) => {
      const dateA = new Date(a.published_at).getTime()
      const dateB = new Date(b.published_at).getTime()
      return dateB - dateA
    })
}

// 获取项目名称
const getProjectName = () => {
  switch (activeProject.value) {
    case 'lophine':
      return 'Lophine'
    case 'lightingluminol':
      return 'LightingLuminol'
    default:
      return 'Luminol'
  }
}

// 根据项目获取仓库URL
const getRepoUrl = computed(() => {
  return `https://github.com/LuminolMC/${getProjectName()}`
})

// 获取Gradle构建命令
const getGradleCommand = () => {
  return './gradlew applyAllPatches && ./gradlew createMojmapPaperclipJar'
}

// 使用 Intl.DateTimeFormat API 格式化发布时间为UTC时间包含时分秒(CN使用UTC+8)
const formatReleaseDate = (dateString: string) => {
  const date = new Date(dateString);
  const isChinese = useI18n().locale.value === 'zh';

  if (isChinese) {
    // CN使用UTC+8
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Shanghai',
      timeZoneName: 'short'
    }).format(date);
  } else {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'UTC',
      timeZoneName: 'short'
    }).format(date);
  }
}


const fetchReleases = async () => {
  try {
    loading.value = true
    const projectName = getProjectName()

    const response = await fetch(`https://api.github.com/repos/LuminolMC/${projectName}/releases`)
    if (!response.ok) {
      throw new Error('获取版本信息失败')
    }
    const data = await response.json()
    releases.value = data
  } catch (err) {
    error.value = err instanceof Error ? err.message : '未知错误'
    console.error('获取版本信息失败:', err)
  } finally {
    loading.value = false
  }
}

const openGithub = () => {
  window.open(getRepoUrl.value)
}

const openReleaseUrl = (url: string) => {
  window.open(url, '_blank')
}

const switchProject = (project: string) => {
  activeProject.value = project
  fetchReleases()
}

onMounted(() => {
  fetchReleases()
})
</script>

<template>
  <NLayout class="layout">
    <NLayoutContent style="padding: 0; margin: 0; width: 100%; box-sizing: border-box;">
      <!-- 下载区域 -->
      <div style="text-align: center; padding: 150px 24px; background: #b6ade6; color: white; margin-bottom: 40px; width: 100%; box-sizing: border-box; position: relative;">
        <!-- 二级菜单 -->
        <div style="position: absolute; top: 20px; left: 0; right: 0; text-align: center; background: transparent; padding: 10px 0; z-index: 10;">
          <span
            @click="switchProject('luminol')"
            :style="{
              color: activeProject === 'luminol' ? '#4ade80' : 'white',
              fontSize: '1.2rem',
              margin: '0 20px',
              cursor: 'pointer',
              transition: 'color 0.3s',
              textShadow: '0 0 4px rgba(0,0,0,0.5)'
            }"
          >
            Luminol
          </span>
          <span
            @click="switchProject('lophine')"
            :style="{
              color: activeProject === 'lophine' ? '#4ade80' : 'white',
              fontSize: '1.2rem',
              margin: '0 20px',
              cursor: 'pointer',
              transition: 'color 0.3s',
              textShadow: '0 0 4px rgba(0,0,0,0.5)'
            }"
          >
            Lophine
          </span>
          <span
            @click="switchProject('lightingluminol')"
            :style="{
              color: activeProject === 'lightingluminol' ? '#4ade80' : 'white',
              fontSize: '1.2rem',
              margin: '0 20px',
              cursor: 'pointer',
              transition: 'color 0.3s',
              textShadow: '0 0 4px rgba(0,0,0,0.5)'
            }"
          >
            LightingLuminol
          </span>
        </div>

        <h1 style="font-size: 3rem; margin-bottom: 20px;">{{ t('message.downloadTitle', [getProjectName()]) }}</h1>
        <p style="font-size: 1.2rem; max-width: 800px; margin: 0 auto 30px;">{{ t('message.downloadDesc', [getProjectName()]) }}</p>
        <NButton type="primary" size="large" style="margin-right: 12px;" @click="openGithub">{{ t('message.github_upper_case') }}</NButton>
        <p style="font-size: 1.2rem;">{{ t('message.downloadNotice', [getProjectName()]) }}</p>
      </div>

      <!-- 下载选项 -->
      <div style="max-width: 900px; margin: 0 auto; padding: 0 24px;">
        <NSpin :show="loading">
          <div v-if="error">
            <NAlert type="error" :title="t('message.error')" :closable="false">
              {{ error }}
            </NAlert>
          </div>

          <div v-else style="display: flex; flex-wrap: wrap; justify-content: center; gap: 30px;">
            <!-- 稳定版本 -->
            <NCard
              v-for="release in getStableReleases().slice(0, 1)"
              :key="release.tag_name"
              :title="t('message.stableVersion')"
              bordered
              style="flex: 1 1 350px; max-width: 500px; padding: 30px;"
            >
              <p style="margin-bottom: 20px;">
                {{ t('message.version') }}:
                <a
                  href="javascript:void(0)"
                  @click="openReleaseUrl(release.html_url)"
                  style="color: #409eff; text-decoration: underline;"
                >
                  {{ release.tag_name }}
                </a>
              </p>
              <p style="margin-bottom: 30px;">{{ t('message.releaseDate') }}: {{ formatReleaseDate(release.published_at) }}</p>
              <NButton type="primary" size="large" style="width: 100%;" @click="openReleaseUrl(release.html_url)">
                {{ t('message.downloadStable') }}
              </NButton>
            </NCard>

            <!-- 开发版本 -->
            <NCard
              v-for="release in getDevReleases().slice(0, 1)"
              :key="release.tag_name"
              :title="t('message.devVersion')"
              bordered
              style="flex: 1 1 350px; max-width: 500px; padding: 30px;"
            >
              <p style="margin-bottom: 20px;">
                {{ t('message.version') }}:
                <a
                  href="javascript:void(0)"
                  @click="openReleaseUrl(release.html_url)"
                  style="color: #409eff; text-decoration: underline;"
                >
                  {{ release.tag_name }}
                </a>
              </p>
              <p style="margin-bottom: 30px;">{{ t('message.releaseDate') }}: {{ formatReleaseDate(release.published_at) }}</p>
              <NButton type="warning" size="large" style="width: 100%;" @click="openReleaseUrl(release.html_url)">
                {{ t('message.downloadDev') }}
              </NButton>
            </NCard>
          </div>
        </NSpin>
      </div>

      <div style="max-width: 900px; margin: 80px auto 60px; padding: 0 24px;">
        <h2 style="text-align: center; font-size: 2.2rem; margin-bottom: 40px;">{{ t('message.installGuide') }}</h2>
        <NCard bordered>
          <div style="padding: 20px;">
            <ol style="text-align: left; font-size: 1rem; line-height: 1.8;">
              <li style="margin-bottom: 15px;">{{ t('message.installGuides.1', [getProjectName()]) }}</li>
              <li style="margin-bottom: 15px;">{{ t('message.installGuides.2') }} <NCode :code="`java -jar ${getProjectName().toLowerCase()}-paperclip.jar`" lang="shell" inline/></li>
              <li>{{ t('message.installGuides.3', [getProjectName()]) }}</li>
            </ol>
          </div>
        </NCard>
      </div>

      <div style="max-width: 900px; margin: 80px auto 60px; padding: 0 24px;">
        <h2 style="text-align: center; font-size: 2.2rem; margin-bottom: 40px;">{{ t('message.diyBuild') }}</h2>
        <NCard bordered>
          <div style="padding: 20px;">
            <ol style="text-align: left; font-size: 1rem; line-height: 1.8;">
              <li style="margin-bottom: 15px;"><NCode :code="`git clone https://github.com/LuminolMC/${getProjectName()}.git`" lang="shell" inline/></li>
              <li style="margin-bottom: 15px;"><NCode :code="getGradleCommand()" lang="shell" inline/></li>
              <li>{{ t('message.findYourJar') }}</li>
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
