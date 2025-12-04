<script lang="ts" setup>
import {useI18n} from 'vue-i18n'
import {computed, onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import {formatDate} from '../utils/dateUtils.ts'
import {NAlert, NButton, NCard, NCode, NLayout, NLayoutContent, NSpin} from 'naive-ui'
import cacheManager from '../utils/cacheManager/cacheManager.ts'

const {t} = useI18n()
const router = useRouter() // 初始化路由

interface Release {
  name: string
  tag_name: string
  published_at: string
  html_url: string
  prerelease: boolean
}

const releases = ref<Release[]>([])
const loading = ref(true)
const hasError = ref(false)
const activeProject = ref('luminol')

// 缓存相关常量
const CACHE_KEY_PREFIX = 'github_releases_'

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

// 使用缓存数据的统一方法
const useCacheData = (projectName: string) => {
  const cacheKey = `${CACHE_KEY_PREFIX}${projectName}`;
  const cachedData = cacheManager.getCachedData<Release[]>(cacheKey)
  if (cachedData) {
    releases.value = cachedData
    hasError.value = false
    return true
  }
  return false
}

// 打开构建查看器页面
const openBuildViewer = () => {
  router.push('/build-viewer')
}

const fetchReleases = async () => {
  try {
    loading.value = true
    const projectName = getProjectName()
    const cacheKey = `${CACHE_KEY_PREFIX}${projectName}`;

    // 检查是否在冷却期内
    if (cacheManager.isInCooldown()) {
      // 在冷却期内，直接使用缓存数据
      if (useCacheData(projectName)) {
        loading.value = false
        return
      }
    }

    // 首先检查是否有有效缓存
    const cachedData = cacheManager.getCachedData<Release[]>(cacheKey)
    if (cachedData) {
      releases.value = cachedData
      hasError.value = false
      loading.value = false
      // 即使有缓存也尝试更新数据
    }

    const response = await fetch(`https://api.github.com/repos/LuminolMC/${projectName}/releases`)
    if (!response.ok) {
      // GitHub API 不可用时，尝试使用远程缓存
      const backupData = await cacheManager.fetchFromBackupCache<Release>(
          projectName,
          (item: any) => ({
            name: item.name || item.tag_name,
            tag_name: item.tag_name,
            published_at: item.published_at || new Date().toISOString(),
            html_url: item.html_url || `https://github.com/LuminolMC/${projectName}/releases/tag/${item.tag_name}`,
            prerelease: item.prerelease || false
          })
      );

      if (backupData) {
        releases.value = backupData
        // 保存到本地缓存
        cacheManager.saveToCache(cacheKey, backupData)
        hasError.value = false
        loading.value = false
        return
      }

      // 如果没有远程缓存，使用本地缓存
      if (useCacheData(projectName)) {
        console.warn('Using local cached data due to network error')
      } else {
        throw new Error(t('message.fetchVersionInfoError'))
      }
      loading.value = false
      return
    }

    const data = await response.json()
    releases.value = data

    // 保存到缓存
    cacheManager.saveToCache(cacheKey, data)

    hasError.value = false
  } catch (err) {
    cacheManager.setErrorTime()
    // 如果请求失败，尝试使用远程缓存
    const projectName = getProjectName()
    const cacheKey = `${CACHE_KEY_PREFIX}${projectName}`;

    const backupData = await cacheManager.fetchFromBackupCache<Release>(
        projectName,
        (item: any) => ({
          name: item.name || item.tag_name,
          tag_name: item.tag_name,
          published_at: item.published_at || new Date().toISOString(),
          html_url: item.html_url || `https://github.com/LuminolMC/${projectName}/releases/tag/${item.tag_name}`,
          prerelease: item.prerelease || false
        })
    );

    if (backupData) {
      releases.value = backupData
      // 保存到本地缓存
      cacheManager.saveToCache(cacheKey, backupData)
      hasError.value = false
      loading.value = false
      return
    }

    // 如果没有远程缓存，使用本地缓存
    if (useCacheData(projectName)) {
      console.warn('Using cached data due to network error:', err)
    } else {
      hasError.value = true
      console.error(t('message.fetchVersionInfoError') + ':', err)
    }
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
      <div
          style="text-align: center; padding: 150px 24px; background: #b6ade6; color: white; margin-bottom: 40px; width: 100%; box-sizing: border-box; position: relative;">
        <!-- 二级菜单 -->
        <div
            style="position: absolute; top: 20px; left: 0; right: 0; text-align: center; background: transparent; padding: 10px 0; z-index: 10;">
          <span
              :style="{
              color: activeProject === 'luminol' ? '#4ade80' : 'white',
              fontSize: '1.2rem',
              margin: '0 20px',
              cursor: 'pointer',
              transition: 'color 0.3s',
              textShadow: '0 0 4px rgba(0,0,0,0.5)'
            }"
              @click="switchProject('luminol')"
          >
            Luminol
          </span>
          <span
              :style="{
              color: activeProject === 'lophine' ? '#4ade80' : 'white',
              fontSize: '1.2rem',
              margin: '0 20px',
              cursor: 'pointer',
              transition: 'color 0.3s',
              textShadow: '0 0 4px rgba(0,0,0,0.5)'
            }"
              @click="switchProject('lophine')"
          >
            Lophine
          </span>
          <span
              :style="{
              color: activeProject === 'lightingluminol' ? '#4ade80' : 'white',
              fontSize: '1.2rem',
              margin: '0 20px',
              cursor: 'pointer',
              transition: 'color 0.3s',
              textShadow: '0 0 4px rgba(0,0,0,0.5)'
            }"
              @click="switchProject('lightingluminol')"
          >
            LightingLuminol
          </span>
        </div>

        <h1 style="font-size: 3rem; margin-bottom: 20px;">{{ t('message.downloadTitle', [getProjectName()]) }}</h1>
        <p style="font-size: 1.2rem; max-width: 800px; margin: 0 auto 30px;">
          {{ t('message.downloadDesc', [getProjectName()]) }}</p>

        <!-- 构建查看器 -->
        <NButton size="large" style="margin-right: 12px;" type="primary" @click="openGithub">
          {{ t('message.github_upper_case') }}
        </NButton>
        <NButton size="large" style="margin-right: 12px;" type="primary" @click="openBuildViewer">
          {{ t('message.buildViewer') }}
        </NButton>
        <p style="font-size: 1.2rem;">{{ t('message.downloadNotice', [getProjectName()]) }}</p>
      </div>

      <!-- 下载选项 -->
      <div style="max-width: 900px; margin: 0 auto; padding: 0 24px;">
        <NSpin :show="loading">
          <div v-if="hasError">
            <NAlert :closable="false" :title="t('message.error')" type="error">
              {{ t('message.fetchVersionInfoError') }}
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
                    style="color: #409eff; text-decoration: underline;"
                    @click="openReleaseUrl(release.html_url)"
                >
                  {{ release.tag_name }}
                </a>
              </p>
              <p style="margin-bottom: 30px;">{{ t('message.releaseDate') }}: {{
                  formatDate(release.published_at)
                }}</p>
              <NButton size="large" style="width: 100%;" type="primary" @click="openReleaseUrl(release.html_url)">
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
                    style="color: #409eff; text-decoration: underline;"
                    @click="openReleaseUrl(release.html_url)"
                >
                  {{ release.tag_name }}
                </a>
              </p>
              <p style="margin-bottom: 30px;">{{ t('message.releaseDate') }}: {{
                  formatDate(release.published_at)
                }}</p>
              <NButton size="large" style="width: 100%;" type="warning" @click="openReleaseUrl(release.html_url)">
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
              <li style="margin-bottom: 15px;">{{ t('message.installGuides.2') }}
                <NCode :code="`java -jar ${getProjectName().toLowerCase()}-paperclip.jar`" inline lang="shell"/>
              </li>
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
              <li style="margin-bottom: 15px;">
                <NCode :code="`git clone https://github.com/LuminolMC/${getProjectName()}.git`" inline lang="shell"/>
              </li>
              <li style="margin-bottom: 15px;">
                <NCode :code="getGradleCommand()" inline lang="shell"/>
              </li>
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
</style>
