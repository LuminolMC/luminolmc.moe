<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  NLayout,
  NLayoutContent,
  NCard,
  NTable,
  NSpin,
  NAlert,
  NButton,
  NTag,
  NPagination,
  NSelect,
  NInput,
  NTooltip
} from 'naive-ui'
import { formatReleaseDate } from '../utils/dateUtils.ts'

const { t } = useI18n()

interface BuildRecord {
  id: number
  projectName: string
  version: string
  buildNumber: number
  status: 'success' | 'failed' | 'building'
  startTime: string
  endTime: string
  duration: number // in seconds
  commitHash: string
  branch: string
  triggerBy: string
}

const builds = ref<BuildRecord[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const currentPage = ref(1)
const pageSize = ref(10)
const totalBuilds = ref(0)

// 缓存相关
const CACHE_KEY = 'github_releases_cache'
const CACHE_DURATION = 15 * 60 * 1000 // 15分钟

// 筛选条件
const filterProject = ref<string | null>(null)
const filterStatus = ref<string | null>(null)
const searchKeyword = ref('')

// 项目选项
const projectOptions = [
  { label: 'Luminol', value: 'Luminol' },
  { label: 'Lophine', value: 'Lophine' },
  { label: 'LightingLuminol', value: 'LightingLuminol' }
]

// 仓库映射
const repositoryMap: Record<string, string> = {
  'Luminol': 'LuminolMC/Luminol',
  'Lophine': 'LuminolMC/Lophine',
  'LightingLuminol': 'LuminolMC/LightingLuminol'
}

// 状态选项
const statusOptions = [
  { label: t('message.buildStatus.success'), value: 'success' },
  { label: t('message.buildStatus.failed'), value: 'failed' },
  { label: t('message.buildStatus.building'), value: 'building' }
]

// 检查缓存是否有效
const isCacheValid = (cachedData: any) => {
  if (!cachedData) return false
  const now = Date.now()
  return (now - cachedData.timestamp) < CACHE_DURATION
}

// 从缓存获取数据
const getCachedData = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      const parsed = JSON.parse(cached)
      if (isCacheValid(parsed)) {
        return parsed.data
      } else {
        // 缓存过期，清除缓存
        localStorage.removeItem(CACHE_KEY)
      }
    }
  } catch (e) {
    console.error('Failed to read cache:', e)
  }
  return null
}

// 保存数据到缓存
const saveToCache = (data: any) => {
  try {
    const cacheData = {
      timestamp: Date.now(),
      data: data
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
  } catch (e) {
    console.error('Failed to save cache:', e)
  }
}

// 获取GitHub releases数据
const fetchGitHubReleases = async (page: number = 1) => {
  try {
    loading.value = true
    error.value = null

    // 检查是否有有效缓存
    const cachedData = getCachedData()
    if (cachedData && page === 1 &&
        !filterProject.value &&
        !filterStatus.value &&
        !searchKeyword.value) {
      // 使用缓存数据
      processData(cachedData, page)
      return
    }

    // 根据筛选条件确定要查询的仓库
    let reposToQuery: string[] = []
    if (filterProject.value && repositoryMap[filterProject.value]) {
      reposToQuery = [repositoryMap[filterProject.value]]
    } else {
      reposToQuery = Object.values(repositoryMap)
    }

    // 获取所有仓库的发布信息
    let allBuildRecords: BuildRecord[] = []

    for (const repo of reposToQuery) {
      // 获取项目名
      const projectName = Object.keys(repositoryMap).find(
        key => repositoryMap[key] === repo
      ) || repo.split('/')[1]

      // 分页获取所有发布（GitHub API每页最多100条）
      let page = 1
      let hasMore = true
      let totalFetched = 0

      while (hasMore) {
        const response = await fetch(
          `https://api.github.com/repos/${repo}/releases?per_page=100&page=${page}`
        )

        if (!response.ok) {
          throw new Error(`GitHub API request failed with status ${response.status}`)
        }

        const releases = await response.json()

        // 转换为BuildRecord格式
        const buildRecords: BuildRecord[] = releases.map((release: any) => ({
          id: release.id,
          projectName: projectName,
          version: release.tag_name,
          buildNumber: release.id,
          status: release.prerelease ? 'building' : 'success',
          startTime: release.published_at,
          endTime: release.published_at,
          duration: 0,
          commitHash: release.target_commitish.substring(0, 8),
          branch: release.target_commitish,
          triggerBy: release.author?.login || 'Unknown'
        }))

        allBuildRecords = [...allBuildRecords, ...buildRecords]
        totalFetched += releases.length

        // 如果返回结果少于100条，说明已经到最后一页
        if (releases.length < 100) {
          hasMore = false
        } else {
          page++
        }
      }
    }

    // 保存到缓存（仅在获取完整数据时缓存）
    if (!filterProject.value && !filterStatus.value && !searchKeyword.value) {
      saveToCache(allBuildRecords)
    }

    // 处理数据
    processData(allBuildRecords, page)
  } catch (err) {
    console.error('Failed to fetch GitHub releases:', err)
    error.value = err instanceof Error ? err.message : t('message.fetchBuildRecordsError')
  } finally {
    loading.value = false
  }
}

// 处理数据（包括过滤和分页）
const processData = (allBuildRecords: BuildRecord[], page: number) => {
  // 应用搜索关键词过滤
  if (searchKeyword.value) {
    allBuildRecords = allBuildRecords.filter(record =>
      record.version.includes(searchKeyword.value) ||
      record.projectName.includes(searchKeyword.value) ||
      record.branch.includes(searchKeyword.value)
    )
  }

  // 应用状态过滤
  if (filterStatus.value) {
    allBuildRecords = allBuildRecords.filter(record =>
      record.status === filterStatus.value
    )
  }

  totalBuilds.value = allBuildRecords.length

  // 分页处理
  builds.value = allBuildRecords.slice(
    (page - 1) * pageSize.value,
    page * pageSize.value
  )
}

const getStatusType = (status: string) => {
  switch (status) {
    case 'success': return 'success'
    case 'failed': return 'error'
    case 'building': return 'warning'
    default: return 'default'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'success': return t('message.buildStatus.success')
    case 'failed': return t('message.buildStatus.failed')
    case 'building': return t('message.buildStatus.building')
    default: return status
  }
}

const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60

  if (h > 0) return `${h}${t('message.time.hour')}${m}${t('message.time.minute')}${s}${t('message.time.second')}`
  if (m > 0) return `${m}${t('message.time.minute')}${s}${t('message.time.second')}`
  return `${s}${t('message.time.second')}`
}

// 分割版本号的函数
const getVersionPrefix = (version: string) => {
  const parts = version.split('-')
  return parts[0] || ''
}

// 获取版本号后缀的函数
const getVersionSuffix = (version: string) => {
  const parts = version.split('-')
  return parts.slice(1).join('-') || ''
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchGitHubReleases(page)
}

// 添加页面大小变更处理函数
const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchGitHubReleases()
}

// 查看详情功能
const viewBuildDetails = (buildId: number) => {
  // 实现查看详情逻辑
  console.log(`查看构建 #${buildId} 的详情`)
}

// 执行搜索
const performSearch = () => {
  currentPage.value = 1
  fetchGitHubReleases()
}

// 重置筛选条件
const resetFilters = () => {
  filterProject.value = null
  filterStatus.value = null
  searchKeyword.value = ''
  currentPage.value = 1
  fetchGitHubReleases()
}

// 清除缓存函数
const clearCache = () => {
  localStorage.removeItem(CACHE_KEY)
}

onMounted(() => {
  fetchGitHubReleases()
})
</script>

<template>
  <NLayout class="layout">
    <NLayoutContent style="padding: 20px;">
      <NCard :title="t('message.buildHistory')" style="margin-bottom: 20px;">
        <!-- 筛选区域 -->
        <div style="margin-bottom: 20px; display: flex; flex-wrap: wrap; gap: 12px; align-items: center;">
          <NSelect
            v-model:value="filterProject"
            :options="projectOptions"
            :placeholder="t('message.selectProject')"
            clearable
            style="width: 150px;"
          />
          <NSelect
            v-model:value="filterStatus"
            :options="statusOptions"
            :placeholder="t('message.selectStatus')"
            clearable
            style="width: 150px;"
          />
          <NInput
            v-model:value="searchKeyword"
            :placeholder="t('message.searchKeyword')"
            style="width: 200px;"
          />
          <NButton @click="performSearch">
            {{ t('message.search') }}
          </NButton>
          <NButton @click="resetFilters">
            {{ t('message.reset') }}
          </NButton>
          <!-- 添加清除缓存按钮 -->
          <NButton @click="clearCache">
            {{ t('message.clearCache') }}
          </NButton>
        </div>

        <NSpin :show="loading">
          <div v-if="error">
            <NAlert type="error" :title="t('message.error')" :closable="false">
              {{ error }}
            </NAlert>
          </div>

          <div v-else>
            <div class="table-container">
              <NTable :bordered="true" :single-line="false" class="build-table">
                <thead>
                  <tr>
                    <th class="resizable-column" style="width: 80px;">
                      <div class="column-content">ID</div>
                    </th>
                    <th class="resizable-column">
                      <div class="column-content">{{ t('message.project') }}</div>
                    </th>
                    <th class="resizable-column">
                      <div class="column-content">{{ t('message.versionPrefix') }}</div>
                    </th>
                    <th class="resizable-column">
                      <div class="column-content">{{ t('message.versionSuffix') }}</div>
                    </th>
                    <th class="resizable-column">
                      <div class="column-content">{{ t('message.status') }}</div>
                    </th>
                    <th class="resizable-column">
                      <div class="column-content">{{ t('message.startTime') }}</div>
                    </th>
                    <th class="resizable-column">
                      <div class="column-content">{{ t('message.duration') }}</div>
                    </th>
                    <th class="resizable-column">
                      <div class="column-content">{{ t('message.branch') }}</div>
                    </th>
                    <th class="resizable-column">
                      <div class="column-content">{{ t('message.triggerBy') }}</div>
                    </th>
                    <th class="resizable-column" style="width: 100px;">
                      <div class="column-content">{{ t('message.actions') }}</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="build in builds" :key="build.id">
                    <td>
                      <NTooltip trigger="hover" placement="top">
                        <template #trigger>
                          <div class="cell-content">#{{ build.id }}</div>
                        </template>
                        {{ build.id }}
                      </NTooltip>
                    </td>
                    <td>
                      <NTooltip trigger="hover" placement="top">
                        <template #trigger>
                          <div class="cell-content">{{ build.projectName }}</div>
                        </template>
                        {{ build.projectName }}
                      </NTooltip>
                    </td>
                    <td>
                      <NTooltip trigger="hover" placement="top">
                        <template #trigger>
                          <div class="cell-content">{{ getVersionPrefix(build.version) }}</div>
                        </template>
                        {{ getVersionPrefix(build.version) }}
                      </NTooltip>
                    </td>
                    <td>
                      <NTooltip trigger="hover" placement="top">
                        <template #trigger>
                          <div class="cell-content">{{ getVersionSuffix(build.version) }}</div>
                        </template>
                        {{ getVersionSuffix(build.version) }}
                      </NTooltip>
                    </td>
                    <td>
                      <NTag :type="getStatusType(build.status)">
                        {{ getStatusText(build.status) }}
                      </NTag>
                    </td>
                    <td>
                      <NTooltip trigger="hover" placement="top">
                        <template #trigger>
                          <div class="cell-content">{{ formatReleaseDate(build.startTime) }}</div>
                        </template>
                        {{ formatReleaseDate(build.startTime) }}
                      </NTooltip>
                    </td>
                    <td>
                      <NTooltip trigger="hover" placement="top">
                        <template #trigger>
                          <div class="cell-content">{{ formatDuration(build.duration) }}</div>
                        </template>
                        {{ formatDuration(build.duration) }}
                      </NTooltip>
                    </td>
                    <td>
                      <NTooltip trigger="hover" placement="top">
                        <template #trigger>
                          <div class="cell-content">{{ build.branch }}</div>
                        </template>
                        {{ build.branch }}
                      </NTooltip>
                    </td>
                    <td>
                      <NTooltip trigger="hover" placement="top">
                        <template #trigger>
                          <div class="cell-content">{{ build.triggerBy }}</div>
                        </template>
                        {{ build.triggerBy }}
                      </NTooltip>
                    </td>
                    <td>
                      <NButton text type="primary" @click="viewBuildDetails(build.id)">
                        {{ t('message.viewDetails') }}
                      </NButton>
                    </td>
                  </tr>
                  <tr v-if="builds.length === 0">
                    <td colspan="10" style="text-align: center;">{{ t('message.noBuildRecords') }}</td>
                  </tr>
                </tbody>
              </NTable>
            </div>

            <div style="display: flex; justify-content: center; margin-top: 20px;">
              <NPagination
                v-model:page="currentPage"
                :page-size="pageSize"
                :item-count="totalBuilds"
                :page-sizes="[10, 20, 50, 100]"
                show-size-picker
                @update:page="handlePageChange"
                @update:page-size="handlePageSizeChange"
              />
            </div>
          </div>
        </NSpin>
      </NCard>
    </NLayoutContent>
  </NLayout>
</template>

<style scoped>
.layout {
  min-height: 100vh;
}

/* 自适应表格容器 */
.table-container {
  overflow-x: auto;
  max-width: 100%;
  position: relative;
}

/* 表格样式 */
.build-table {
  width: 100%;
  min-width: 800px;
  table-layout: fixed;
  border-collapse: collapse;
}

.build-table th,
.build-table td {
  padding: 12px 8px;
  text-align: left;
  border-right: 1px solid #e0e0e0;
}

.build-table th:last-child,
.build-table td:last-child {
  border-right: none;
}

/* 可调整列宽样式 */
.resizable-column {
  position: relative;
  overflow: hidden;
}

.column-content {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cell-content {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 可调整列宽的拖拽手柄 */
.resizable-column::after {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 5px;
  cursor: col-resize;
  background-color: transparent;
  transition: background-color 0.2s;
}

.resizable-column:hover::after {
  background-color: #1890ff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .build-table {
    font-size: 12px;
  }

  .build-table th,
  .build-table td {
    padding: 8px 4px;
  }

  /* 在小屏幕上隐藏部分列 */
  .build-table th:nth-child(7),
  .build-table td:nth-child(7) {
    display: none;
  }
}

/* 工具提示样式优化 */
:deep(.n-tooltip) {
  max-width: 300px;
  word-wrap: break-word;
}

/* 移除导航栏悬浮效果 */
:deep(.n-layout-header) {
  box-shadow: none !important;
}
</style>
