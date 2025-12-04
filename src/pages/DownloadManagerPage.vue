<script lang="ts" setup>
import {computed, onBeforeUnmount, onMounted, ref} from 'vue'
import {useI18n} from 'vue-i18n'
import {
  NAlert,
  NButton,
  NCard,
  NInput,
  NLayout,
  NLayoutContent,
  NPagination,
  NSelect,
  NSpin,
  NTable,
  NTag,
  NTooltip
} from 'naive-ui'
import {formatDate} from '../utils/dateUtils.ts'
import type {CacheConfig} from '../config/cacheConfig.ts'
import cacheConfigs from '../config/cacheConfig.ts'
import cacheManager, {type BuildRecord} from '../utils/cacheManager/cacheManager.ts'

const {t, locale} = useI18n()

const builds = ref<BuildRecord[]>([])
const loading = ref<boolean>(true)
const error = ref<string | null>(null)
const currentPage = ref<number>(1)
const pageSize = ref<number>(10)
const totalBuilds = ref<number>(0)
const jumpPageInput = ref<string>('')
const defaultSource = ref<string | null>(null)
const jumpPageError = ref<string | null>(null)

// 缓存相关
const CACHE_KEY = 'github_releases_cache'

// 筛选条件
const filterProject = ref<string | null>(null)
const filterReleaseType = ref<string | null>(null)
const filterVersionPrefix = ref<string | null>(null)
const searchKeyword = ref<string>('')

// 计算总页数
const totalPages = computed(() => Math.ceil(totalBuilds.value / pageSize.value))

// 列宽调整相关
const resizingColumnInfo = ref<{
  leftColumn: HTMLElement | null,
  rightColumn: HTMLElement | null,
  startX: number,
  leftStartWidth: number,
  rightStartWidth: number,
  tableWidth: number
}>({
  leftColumn: null,
  rightColumn: null,
  startX: 0,
  leftStartWidth: 0,
  rightStartWidth: 0,
  tableWidth: 0
})

// 项目选项
const projectOptions = [
  {label: 'Luminol', value: 'Luminol'},
  {label: 'Lophine', value: 'Lophine'},
  {label: 'LightingLuminol', value: 'LightingLuminol'}
]

// 仓库映射
const repositoryMap: Record<string, string> = {
  'Luminol': 'LuminolMC/Luminol',
  'Lophine': 'LuminolMC/Lophine',
  'LightingLuminol': 'LuminolMC/LightingLuminol'
}

// 状态选项
const releaseTypeOptions = [
  {label: t('message.releaseType.release'), value: 'release'},
  {label: t('message.releaseType.prerelease'), value: 'prerelease'}
]

// 版本前缀选项（从所有数据中提取）
const versionPrefixOptions = computed(() => {
  // 从缓存中获取所有数据以构建完整的选项列表
  const allData = cacheManager.getCachedData<BuildRecord[]>(CACHE_KEY) || builds.value
  const prefixes = new Set<string>()

  allData.forEach((build: BuildRecord) => {
    const prefix = getVersionPrefix(build.version)
    if (prefix) {
      prefixes.add(prefix)
    }
  })

  // 按Minecraft版本号规则排序（从高到低）
  return Array.from(prefixes)
      .sort((a, b) => {
        // 将版本号分割为数字部分进行比较
        const aParts = a.split('.').map(Number)
        const bParts = b.split('.').map(Number)

        // 依次比较各部分
        for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
          const aPart = aParts[i] || 0
          const bPart = bParts[i] || 0

          if (aPart !== bPart) {
            return bPart - aPart // 从高到低排序
          }
        }

        return 0
      })
      .map(prefix => ({
        label: prefix,
        value: prefix
      }))
})

// 来源选项
const sourceOptions = computed(() => {
  const options = [
    {label: 'GitHub', value: 'github'}
  ]

  // 添加配置文件中的服务器组
  cacheConfigs.forEach((config: CacheConfig, index: number) => {
    if (config.disabled) return
    options.push({
      label: config.name || `Backup Server ${index + 1}`,
      value: `backup-${index}`
    })
  })

  return options
})

// 根据仓库名获取项目名
const getProjectNameByRepo = (repo: string) => {
  console.log('[getProjectNameByRepo] Looking up project name for repo:', repo)
  return Object.keys(repositoryMap).find(
      key => repositoryMap[key].toLowerCase() === repo.toLowerCase()
  ) || repo.split('/')[1]
}

// 使用缓存数据的统一方法
const useCacheData = (page: number = 1) => {
  console.log('[useCacheData] Attempting to use cached data for page:', page)
  const cachedData = cacheManager.getCachedData<BuildRecord[]>(CACHE_KEY)
  if (cachedData) {
    processData(cachedData, page, 'cache')
    error.value = t('message.usingCachedDataDueToError')
    console.log('[useCacheData] Successfully used cached data')
    return true
  }
  console.log('[useCacheData] No cached data available')
  return false
}

// 获取发布数据
const fetchReleases = async (page: number = 1) => {
  console.log('[fetchReleases] Starting to fetch releases for page:', page)
  try {
    loading.value = true
    error.value = null

    // 检查是否在冷却期内
    if (cacheManager.isInCooldown()) {
      console.log('[fetchReleases] In cooldown period')
      // 在冷却期内，直接使用缓存数据
      if (useCacheData(page)) {
        loading.value = false
        console.log('[fetchReleases] Using cached data due to cooldown.')
        return
      }
    }

    // 根据选择的默认来源决定获取数据的方式
    if (defaultSource.value === 'github') {
      // 只从GitHub获取数据
      await fetchFromGitHub(page)
    } else if (defaultSource.value?.startsWith('backup-')) {
      // 只从指定备份服务器获取数据
      const backupIndex = parseInt(defaultSource.value.split('-')[1])
      await fetchFromBackup(backupIndex, page)
    } else if (defaultSource.value === null) {
      // 同时发起所有数据源的请求，哪个先返回就先显示哪个的结果
      await raceDataSources(page)
    }

    // 如果所有方法都失败，尝试使用缓存数据
    if (builds.value.length === 0 && useCacheData(page)) {
      loading.value = false
      console.log('[fetchReleases] Using cached data as final fallback')
      return
    }

  } catch (err) {
    console.error('[fetchReleases] Failed to fetch releases:', err)
    // 遇到任何错误都尝试使用缓存数据，不再设置错误信息
    useCacheData(1)
  } finally {
    loading.value = false
    console.log('[fetchReleases] Finished fetch process, loading:', loading.value)
  }
}

// 竞速模式：同时发起所有数据源的请求，哪个先返回就先显示哪个的结果
const raceDataSources = async (page: number) => {
  console.log('[raceDataSources] Starting race between all data sources')

  // 创建一个Promise数组来并行处理所有数据源
  const fetchPromises: Promise<void>[] = []

  // 添加GitHub数据获取Promise
  fetchPromises.push(fetchFromGitHub(page, true))

  // 添加备份服务器数据获取Promise
  for (let i = 0; i < cacheConfigs.length; i++) {
    fetchPromises.push(fetchFromBackup(i, page, true))
  }

  // 使用Promise.race让第一个完成的Promise更新界面
  try {
    await Promise.race(fetchPromises)
    console.log('[raceDataSources] First data source completed')
  } catch (err) {
    console.error('[raceDataSources] Error in race:', err)
  }

  // 等待所有Promise完成（在后台继续执行）
  Promise.allSettled(fetchPromises).then(() => {
    console.log('[raceDataSources] All data sources completed')
  })
}

// 从GitHub获取数据
const fetchFromGitHub = async (page: number, init: boolean = false) => {
  console.log('[fetchFromGitHub] Starting to fetch GitHub releases for page:', page)

  // 根据筛选条件确定要查询的仓库
  let reposToQuery: string[]
  if (filterProject.value && repositoryMap[filterProject.value]) {
    reposToQuery = [repositoryMap[filterProject.value]]
    console.log('[fetchFromGitHub] Filtering by project:', filterProject.value)
  } else {
    reposToQuery = Object.values(repositoryMap)
    console.log('[fetchFromGitHub] Fetching data for all projects')
  }

  try {
    // 使用缓存管理器从GitHub获取数据
    const allBuildRecords = await cacheManager.fetchFromGitHub(reposToQuery)

    // 如果成功获取到GitHub数据
    if (allBuildRecords.length > 0) {
      console.log('[fetchFromGitHub] Total records from GitHub API:', allBuildRecords.length)
      // 保存到缓存（仅在获取完整数据时缓存）
      if (!filterProject.value && !filterReleaseType.value && !searchKeyword.value && !filterVersionPrefix.value) {
        console.log('[fetchFromGitHub] Saving GitHub API data to cache')
        cacheManager.saveToCache(CACHE_KEY, allBuildRecords)
      }

      // 处理数据，优先级最高
      processData(allBuildRecords, page, 'github-api', true, init)
      jumpPageInput.value = ""
      console.log('[fetchFromGitHub] Completed fetching GitHub releases')
      return
    }
  } catch (error) {
    console.error('[fetchFromGitHub] Error fetching from GitHub:', error)
    cacheManager.setErrorTime()
  }

  // 如果GitHub API获取失败，尝试检查是否有有效缓存
  const cachedData = cacheManager.getCachedData<BuildRecord[]>(CACHE_KEY)
  if (cachedData && page === 1 &&
      !filterProject.value &&
      !filterReleaseType.value &&
      !searchKeyword.value &&
      !filterVersionPrefix.value) {
    console.log('[fetchFromGitHub] Using cached data without filters')
    // 使用缓存数据，即使可能未更新
    processData(cachedData, page, 'cache')
    console.log('[fetchFromGitHub] Using cached data.')
    return
  }
}

// 从备份服务器获取数据
const fetchFromBackup = async (backupIndex: number, page: number, isParallel: boolean = false) => {
  console.log('[fetchFromBackup] Starting to fetch from backup server index:', backupIndex)
  const selectedConfig = cacheConfigs[backupIndex]

  if (selectedConfig.disabled) return

  if (!selectedConfig) {
    console.log('[fetchFromBackup] Invalid backup server index')
    return
  }

  let backupData = null
  try {
    console.log('[fetchFromBackup] Attempting to fetch from selected backup cache:', selectedConfig.url)
    const backupResponse = await fetch(selectedConfig.url)
    console.log('[fetchFromBackup] Backup cache response status:', backupResponse.status)
    if (backupResponse.ok) {
      backupData = await backupResponse.json()
      console.log('[fetchFromBackup] Successfully fetched backup data, items:', backupData?.length || 0)
    } else {
      console.log('[fetchFromBackup] Backup cache request failed, status:', backupResponse.status)
      // 备用缓存获取失败时使用本地缓存
      if (!isParallel && useCacheData(page)) {
        console.log('[fetchFromBackup] Using cached data due to backup cache.')
        return
      }
    }
  } catch (e) {
    console.warn('[fetchFromBackup] Primary backup cache unavailable, trying old backup:', e)
    try {
      const oldBackupResponse = await fetch(selectedConfig.oldUrl || '');
      console.log('[fetchFromBackup] Old backup cache response status:', oldBackupResponse.status)
      if (oldBackupResponse.ok) {
        backupData = await oldBackupResponse.json()
        console.log('[fetchFromBackup] Successfully fetched old backup data, items:', backupData?.length || 0)
      } else {
        console.log('[fetchFromBackup] Old backup cache request failed, status:', oldBackupResponse.status)
        // 旧备用缓存也获取失败时使用本地缓存
        if (!isParallel && useCacheData(page)) {
          console.log('[fetchFromBackup] Using cached data due to old backup cache.')
          return
        }
      }
    } catch (oldError) {
      console.warn('[fetchFromBackup] Old backup cache also unavailable:', oldError)
      // 所有备用方案都失败时使用本地缓存
      if (!isParallel && useCacheData(page)) {
        console.log('[fetchFromBackup] Using cached data due to all backup cache.')
        return
      }
    }
  }

  if (backupData) {
    console.log('[fetchFromBackup] Processing backup data')
    try {
      // 验证数据格式
      if (!Array.isArray(backupData)) {
        throw new Error('Invalid backup data format')
      }

      // 使用缓存管理器处理备份数据
      const allBuildRecords: BuildRecord[] = backupData.map((item: any) => {
        return cacheManager.processBackupData(item, getProjectNameByRepo);
      });

      console.log('[fetchFromBackup] Processed backup data, total records:', allBuildRecords.length)

      // 保存到本地缓存
      if (!filterProject.value && !filterReleaseType.value && !searchKeyword.value && !filterVersionPrefix.value) {
        console.log('[fetchFromBackup] Saving backup data to cache')
        cacheManager.saveToCache(CACHE_KEY, allBuildRecords)
      }

      // 只有在非并行模式下或者当前没有数据显示时才处理数据
      if (!isParallel || builds.value.length === 0) {
        processData(allBuildRecords, page, 'backup')
      }
      console.log('[fetchFromBackup] Successfully processed backup data')
      return
    } catch (dataError) {
      console.error('[fetchFromBackup] Backup data validation failed:', dataError)
      // 数据异常时使用缓存
      if (!isParallel && useCacheData(page)) {
        console.log('[fetchFromBackup] Using cached data due to backup data validation failure')
        return
      }
    }
  }
}

// 处理数据（包括过滤和分页）
const processData = (allBuildRecords: BuildRecord[], page: number, source: string, isHighPriority: boolean = false, init: boolean = false) => {
  console.log(`[processData] Starting to process data from ${source}, total records:`, allBuildRecords.length, 'page:', page, 'isHighPriority:', isHighPriority)
  try {
    // 应用搜索关键词过滤
    if (searchKeyword.value) {
      console.log('[processData] Applying search filter:', searchKeyword.value)
      allBuildRecords = allBuildRecords.filter(record =>
          record.version.includes(searchKeyword.value) ||
          record.projectName.includes(searchKeyword.value) ||
          record.branch.includes(searchKeyword.value) ||
          record.commitHash.includes(searchKeyword.value) ||
          record.commitMessage.includes(searchKeyword.value)
      )
      console.log('[processData] Records after search filter:', allBuildRecords.length)
    }

    // 应用状态过滤
    if (filterReleaseType.value) {
      console.log('[processData] Applying release type filter:', filterReleaseType.value)
      allBuildRecords = allBuildRecords.filter(record =>
          record.releaseType === filterReleaseType.value
      )
      console.log('[processData] Records after release type filter:', allBuildRecords.length)
    }

    // 应用项目过滤
    if (filterProject.value) {
      console.log('[processData] Applying project filter:', filterProject.value)
      allBuildRecords = allBuildRecords.filter(record =>
          record.projectName === filterProject.value
      )
      console.log('[processData] Records after project filter:', allBuildRecords.length)
    }

    // 应用版本前缀过滤
    if (filterVersionPrefix.value) {
      console.log('[processData] Applying version prefix filter:', filterVersionPrefix.value)
      allBuildRecords = allBuildRecords.filter(record =>
          getVersionPrefix(record.version) === filterVersionPrefix.value
      )
      console.log('[processData] Records after version prefix filter:', allBuildRecords.length)
    }

    // 强制按时间排序（最新的在前）
    allBuildRecords.sort((a, b) => {
      const dateA = new Date(a.startTime).getTime();
      const dateB = new Date(b.startTime).getTime();
      return dateB - dateA;
    });
    console.log('[processData] Records sorted by time');

    totalBuilds.value = allBuildRecords.length
    console.log('[processData] Total builds after filtering:', totalBuilds.value)

    // 分页处理
    const startIndex = (page - 1) * pageSize.value
    const endIndex = page * pageSize.value

    // 如果是高优先级数据（如GitHub），正在翻页或者当前没有数据显示，则更新数据
    if (!init || isHighPriority || builds.value.length === 0 || page !== currentPage.value) {
      builds.value = allBuildRecords.slice(startIndex, endIndex)
      console.log('[processData] Updated builds with high priority data or page change')
    } else {
      // 如果已有数据显示且不是高优先级数据，则不更新
      console.log('[processData] Keeping existing data, new data is not high priority')
    }

    console.log('[processData] Paginated builds, start:', startIndex, 'end:', endIndex, 'result count:', builds.value.length)

    // 输出数据来源信息
    if (builds.value.length > 0) {
      console.log('[processData] Data source for current page:', source)
    }
  } catch (e) {
    console.error('[processData] Error processing data:', e)
  }
}

const getReleaseTypeType = (releaseType: string) => {
  switch (releaseType) {
    case 'release':
      return 'success'
    case 'prerelease':
      return 'warning'
    default:
      return 'default'
  }
}

const getReleaseTypeText = (releaseType: string) => {
  switch (releaseType) {
    case 'release':
      return t('message.releaseType.release')
    case 'prerelease':
      return t('message.releaseType.prerelease')
    default:
      return releaseType
  }
}

// 分割版本号的函数
const getVersionPrefix = (version: string) => {
  // 版本号和提交哈希通过"-"分隔
  const parts = version.split('-')
  return parts[0] || ''
}

// 获取版本号后缀的函数
const getVersionSuffix = (version: string) => {
  // 获取除了第一个部分外的所有内容
  const parts = version.split('-')
  return parts.slice(1).join('-') || ''
}

// 添加新的时间格式化函数，用于将时间分三行显示（根据语言环境决定时区）
const formatReleaseDateTimeLines = (dateString: string) => {
  if (!dateString) return {date: '', time: '', timezone: ''}

  try {
    // 处理 ISO 8601 格式的时间字符串
    const date = new Date(dateString)

    // 如果是有效的日期
    if (!isNaN(date.getTime())) {
      // 根据语言环境决定使用哪个时区
      let targetDate;
      let timezoneLabel;

      if (locale.value === 'en') {
        // 英文环境显示UTC时间
        targetDate = date;
        timezoneLabel = 'UTC';
      } else {
        // 中文环境显示UTC+8时间
        targetDate = new Date(date.getTime() + 8 * 60 * 60 * 1000);
        timezoneLabel = 'UTC+8';
      }

      const year = targetDate.getUTCFullYear()
      const month = String(targetDate.getUTCMonth() + 1).padStart(2, '0')
      const day = String(targetDate.getUTCDate()).padStart(2, '0')

      const hours = String(targetDate.getUTCHours()).padStart(2, '0')
      const minutes = String(targetDate.getUTCMinutes()).padStart(2, '0')
      const seconds = String(targetDate.getUTCSeconds()).padStart(2, '0')

      return {
        date: `${year}-${month}-${day}`,
        time: `${hours}:${minutes}:${seconds}`,
        timezone: timezoneLabel
      }
    }

    // 如果日期解析失败，尝试手动分割字符串
    const parts = dateString.split('T')
    if (parts.length < 2) {
      return {date: dateString, time: '', timezone: ''}
    }

    const datePart = parts[0]
    const timeAndTimezone = parts[1]

    // 分离时间和时区
    let timePart, timezonePart

    if (timeAndTimezone.includes('Z')) {
      [timePart] = timeAndTimezone.split('Z')
      // 根据语言环境决定如何转换时区
      if (timePart) {
        const [hours, minutes, seconds] = timePart.split(':').map(Number)
        let totalSeconds = hours * 3600 + minutes * 60 + (seconds || 0);

        // 只有在中文环境下才加8小时
        if (locale.value !== 'en') {
          totalSeconds += 8 * 3600;
        }

        const newHours = Math.floor(totalSeconds / 3600) % 24
        const newMinutes = Math.floor((totalSeconds % 3600) / 60)
        const newSeconds = totalSeconds % 60
        timePart = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}:${String(newSeconds).padStart(2, '0')}`
      }
      timezonePart = locale.value === 'en' ? 'UTC' : 'UTC+8'
    } else if (timeAndTimezone.includes('+') || timeAndTimezone.includes('-')) {
      const regex = /([+-]\d{2}:\d{2})/
      const match = timeAndTimezone.match(regex)
      if (match) {
        timePart = timeAndTimezone.substring(0, match.index)
        // 根据语言环境决定时区标签
        timezonePart = locale.value === 'en' ? 'UTC' : 'UTC+8'

        // 根据语言环境调整时间
        if (timePart) {
          const [hours, minutes, seconds] = timePart.split(':').map(Number)
          let totalSeconds = hours * 3600 + minutes * 60 + (seconds || 0);

          // 只有在中文环境下才调整为UTC+8
          if (locale.value !== 'en') {
            totalSeconds += 8 * 3600;
          }

          const newHours = Math.floor(totalSeconds / 3600) % 24
          const newMinutes = Math.floor((totalSeconds % 3600) / 60)
          const newSeconds = totalSeconds % 60
          timePart = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}:${String(newSeconds).padStart(2, '0')}`
        }
      } else {
        timePart = timeAndTimezone
        timezonePart = locale.value === 'en' ? 'UTC' : 'UTC+8'
      }
    } else {
      timePart = timeAndTimezone
      timezonePart = locale.value === 'en' ? 'UTC' : 'UTC+8'
    }

    return {
      date: datePart,
      time: timePart,
      timezone: timezonePart
    }
  } catch (e) {
    console.error('Error formatting date:', e)
    return {date: dateString, time: '', timezone: ''}
  }
}

const pageSizeOptions = computed(() => [
  10, 20, 50, 100, 200, 500, 1000
].map(size => ({
  label: t('message.pageSize', {count: size}),
  value: size
})))

const handlePageChange = (page: number) => {
  console.log('[handlePageChange] Page changed to:', page)
  currentPage.value = page
  jumpPageInput.value = ""
  fetchReleases(page)
}

// 添加页面大小变更处理函数
const handlePageSizeChange = (size: number) => {
  console.log('[handlePageSizeChange] Page size changed to:', size)
  pageSize.value = size
  currentPage.value = 1
  jumpPageInput.value = ''
  fetchReleases()
}

// 查看详情功能 - 跳转到GitHub发行版页面
const viewBuildDetails = (build: BuildRecord) => {
  console.log('[viewBuildDetails] Viewing details for build:', build.id)
  // 根据项目名获取仓库路径
  const repoPath = repositoryMap[build.projectName] || `LuminolMC/${build.projectName}`;
  // 构造GitHub发行版页面URL
  const url = `https://github.com/${repoPath}/releases/tag/${build.version}`;
  // 在新标签页中打开链接
  window.open(url, '_blank');
}

// 下载功能
const downloadBuild = (build: BuildRecord) => {
  console.log('[downloadBuild] Downloading build:', build.id)
  if (build.downloadUrl) {
    window.open(build.downloadUrl, '_blank');
  }
}

// 执行搜索
const performSearch = () => {
  console.log('[performSearch] Performing search with keyword:', searchKeyword.value)
  currentPage.value = 1
  jumpPageInput.value = ''
  fetchReleases()
}

// 重置筛选条件
const resetFilters = () => {
  console.log('[resetFilters] Resetting all filters')
  filterProject.value = null
  filterReleaseType.value = null
  filterVersionPrefix.value = null
  searchKeyword.value = ''
  currentPage.value = 1
  jumpPageInput.value = ''
  fetchReleases()
}

// 清除缓存并重新获取数据
const clearCache = () => {
  console.log('[clearCache] Clearing all local storage')
  localStorage.clear()
  // 重置相关状态
  builds.value = []
  currentPage.value = 1
  jumpPageInput.value = ''
  totalBuilds.value = 0
  // 重新获取数据
  fetchReleases()
}

// 添加跳转到指定页的处理函数
const handleJumpPage = () => {
  const pageNum = parseInt(jumpPageInput.value)
  const maxPage = Math.ceil(totalBuilds.value / pageSize.value)
  console.log('[handleJumpPage] Jumping to page:', pageNum, 'max page:', maxPage)

  if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= maxPage) {
    jumpPageError.value = null  // 清除错误信息
    currentPage.value = pageNum
    fetchReleases(pageNum)
  } else {
    jumpPageError.value = t('message.invalidPageNumber', {
      min: 1,
      max: maxPage
    })
  }
}

// 修改开始调整列宽的方法
const startResizing = (e: MouseEvent, columnIndex: number) => {
  console.log('[startResizing] Starting column resize for column:', columnIndex)
  const table = document.querySelector('.build-table')
  if (!table) return

  // 类型断言为 HTMLElement 数组以访问 offsetWidth 属性
  const columns = Array.from(table.querySelectorAll('.resizable-column')) as HTMLElement[]
  if (columnIndex >= columns.length - 1) return // 最后一列不能调整宽度

  resizingColumnInfo.value = {
    leftColumn: columns[columnIndex],
    rightColumn: columns[columnIndex + 1],
    startX: e.clientX,
    leftStartWidth: columns[columnIndex].offsetWidth,
    rightStartWidth: columns[columnIndex + 1].offsetWidth,
    tableWidth: (table as HTMLElement).offsetWidth
  }

  document.body.style.cursor = 'col-resize'
  e.preventDefault()
}

// 修改调整列宽的方法
const resizeColumn = (e: MouseEvent) => {
  if (!resizingColumnInfo.value.leftColumn || !resizingColumnInfo.value.rightColumn) return

  const diff = e.clientX - resizingColumnInfo.value.startX

  const newLeftWidth = resizingColumnInfo.value.leftStartWidth + diff
  const newRightWidth = resizingColumnInfo.value.rightStartWidth - diff

  // 设置最小宽度限制
  if (newLeftWidth > 100 && newRightWidth > 100) {
    // 类型断言为 HTMLElement 以访问 style 属性
    const leftColumn = resizingColumnInfo.value.leftColumn as HTMLElement
    const rightColumn = resizingColumnInfo.value.rightColumn as HTMLElement

    leftColumn.style.width = `${newLeftWidth}px`
    rightColumn.style.width = `${newRightWidth}px`

    // 保持表格总宽度不变
    const table = document.querySelector('.build-table') as HTMLElement | null
    if (table) {
      const currentTableWidth = resizingColumnInfo.value.tableWidth
      const newTableWidth = currentTableWidth + (newLeftWidth + newRightWidth -
          (resizingColumnInfo.value.leftStartWidth + resizingColumnInfo.value.rightStartWidth))
      table.style.width = `${newTableWidth}px`
    }
  }
}

// 修改停止调整的方法
const stopResizing = () => {
  console.log('[stopResizing] Stopping column resize')
  resizingColumnInfo.value = {
    leftColumn: null,
    rightColumn: null,
    startX: 0,
    leftStartWidth: 0,
    rightStartWidth: 0,
    tableWidth: 0
  }
  document.body.style.cursor = ''
}

// 添加事件监听
onMounted(() => {
  console.log('[onMounted] Component mounted, starting initial fetch')
  fetchReleases()
  jumpPageInput.value = ''
  document.addEventListener('mousemove', resizeColumn)
  document.addEventListener('mouseup', stopResizing)
  console.log('[onMounted] Event listeners added')
})

// 移除事件监听
onBeforeUnmount(() => {
  console.log('[onBeforeUnmount] Component unmounting, removing event listeners')
  document.removeEventListener('mousemove', resizeColumn)
  document.removeEventListener('mouseup', stopResizing)
})
</script>

<template>
  <NLayout class="layout">
    <NLayoutContent style="padding: 20px;">
      <NCard :title="t('message.buildHistory')" style="margin-bottom: 20px;">
        <!-- 筛选区域 -->
        <div style="margin-bottom: 20px; display: flex; flex-wrap: wrap; gap: 12px; align-items: center;">
          <!-- 添加默认来源选择框 -->
          <NSelect
              v-model:value="defaultSource"
              :options="sourceOptions"
              :placeholder="t('message.selectSource')"
              clearable
              style="width: 200px;"
          />
          <NSelect
              v-model:value="filterProject"
              :options="projectOptions"
              :placeholder="t('message.selectProject')"
              clearable
              style="width: 200px;"
          />
          <NSelect
              v-model:value="filterReleaseType"
              :options="releaseTypeOptions"
              :placeholder="t('message.selectStatus')"
              clearable
              style="width: 200px;"
          />
          <NSelect
              v-model:value="filterVersionPrefix"
              :options="versionPrefixOptions"
              :placeholder="t('message.selectVersionPrefix')"
              clearable
              style="width: 200px;"
          />
          <NInput
              v-model:value="searchKeyword"
              :placeholder="t('message.searchKeyword')"
              style="width: 400px;"
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
          <div v-if="error && !builds.length">
            <NAlert :closable="false" :title="t('message.error')" type="error">
              {{ error }}
            </NAlert>
          </div>

          <!-- 始终显示内容，即使有错误 -->
          <div>
            <div class="table-container">
              <NTable :bordered="true" :single-line="false" class="build-table">
                <thead>
                <tr>
                  <th class="resizable-column" @mousedown="startResizing($event, 0)">
                    <div class="column-content">{{ t('message.project') }}</div>
                  </th>
                  <th class="resizable-column" @mousedown="startResizing($event, 1)">
                    <div class="column-content">{{ t('message.versionPrefix') }}</div>
                  </th>
                  <th class="resizable-column" @mousedown="startResizing($event, 2)">
                    <div class="column-content">{{ t('message.versionSuffix') }}</div>
                  </th>
                  <th class="resizable-column" @mousedown="startResizing($event, 3)">
                    <div class="column-content">{{ t('message.status') }}</div>
                  </th>
                  <th class="resizable-column" @mousedown="startResizing($event, 4)">
                    <div class="column-content">{{ t('message.startTime') }}</div>
                  </th>
                  <th class="resizable-column" @mousedown="startResizing($event, 5)">
                    <div class="column-content">{{ t('message.branch') }}</div>
                  </th>
                  <th class="resizable-column commit-message-column" @mousedown="startResizing($event, 6)">
                    <div class="column-content">{{ t('message.commitMessage') }}</div>
                  </th>
                  <th class="resizable-column" @mousedown="startResizing($event, 7)">
                    <div class="column-content">{{ t('message.download') }}</div>
                  </th>
                  <th class="resizable-column" style="width: 100px;" @mousedown="startResizing($event, 8)">
                    <div class="column-content">{{ t('message.actions') }}</div>
                  </th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="build in builds" :key="build.id">
                  <td>
                    <NTooltip placement="top" trigger="hover">
                      <template #trigger>
                        <div class="cell-content">{{ build.projectName }}</div>
                      </template>
                      {{ build.projectName }}
                    </NTooltip>
                  </td>
                  <td>
                    <NTooltip placement="top" trigger="hover">
                      <template #trigger>
                        <div class="cell-content">{{ getVersionPrefix(build.version) }}</div>
                      </template>
                      {{ getVersionPrefix(build.version) }}
                    </NTooltip>
                  </td>
                  <td>
                    <NTooltip placement="top" trigger="hover">
                      <template #trigger>
                        <div class="cell-content">{{ getVersionSuffix(build.version) }}</div>
                      </template>
                      {{ getVersionSuffix(build.version) }}
                    </NTooltip>
                  </td>
                  <td>
                    <NTag :type="getReleaseTypeType(build.releaseType)">
                      {{ getReleaseTypeText(build.releaseType) }}
                    </NTag>
                  </td>
                  <td>
                    <NTooltip placement="top" trigger="hover">
                      <template #trigger>
                        <div class="datetime-cell">
                          <div class="datetime-line">{{ formatReleaseDateTimeLines(build.startTime).date }}</div>
                          <div class="datetime-line">{{ formatReleaseDateTimeLines(build.startTime).time }}</div>
                          <div class="datetime-line timezone-line">
                            {{ formatReleaseDateTimeLines(build.startTime).timezone }}
                          </div>
                        </div>
                      </template>
                      {{ formatDate(build.startTime) }}
                    </NTooltip>
                  </td>
                  <td>
                    <NTooltip placement="top" trigger="hover">
                      <template #trigger>
                        <div class="cell-content">{{ build.branch }}</div>
                      </template>
                      {{ build.branch }}
                    </NTooltip>
                  </td>
                  <td>
                    <div class="commit-message-cell">{{ build.commitMessage }}</div>
                  </td>
                  <td>
                    <div v-if="build.downloadUrl" class="download-cell">
                      <NTooltip placement="top" trigger="hover">
                        <template #trigger>
                          <NButton text type="primary" @click="downloadBuild(build)">
                            {{ t('message.download') }}
                          </NButton>
                        </template>
                        <span :style="{ color: build.fromCache ? 'red' : 'green' }">
                            {{ build.fromCache ? t('message.dataFromCache') : t('message.realTimeData') }}
                          </span>
                      </NTooltip>
                      <span
                          :style="{
                            color: build.fromCache ? 'red' : 'green',
                            marginLeft: '5px'
                          }"
                          :title="build.fromCache ? t('message.dataFromCache') : t('message.realTimeData')"
                      >
                          ({{ build.downloadCount }})
                        </span>
                    </div>
                    <div v-else>
                      {{ t('message.noDownloadAvailable') }}
                    </div>
                  </td>
                  <td>
                    <NButton text type="primary" @click="viewBuildDetails(build)">
                      {{ t('message.viewDetails') }}
                    </NButton>
                  </td>
                </tr>
                <tr v-if="builds.length === 0">
                  <td colspan="9" style="text-align: center;">{{ t('message.noBuildRecords') }}</td>
                </tr>
                </tbody>
              </NTable>
            </div>

            <div style="display: flex; justify-content: center; margin-top: 20px; align-items: center; gap: 16px;">
              <NPagination
                  v-model:page="currentPage"
                  :item-count="totalBuilds"
                  :page-size="pageSize"
                  :page-sizes="pageSizeOptions"
                  show-size-picker
                  @update:page="handlePageChange"
                  @update:page-size="handlePageSizeChange"
              />
              <!-- 添加页码跳转功能 -->
              <div style="display: flex; align-items: center; gap: 8px;">
                <span>{{ t('message.goToPage') }}</span>
                <NInput
                    v-model:value="jumpPageInput"
                    :placeholder="t('message.pageNumber')"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    style="width: 100px;"
                    @keyup.enter="handleJumpPage"
                />
                <NButton @click="handleJumpPage">
                  {{ t('message.go') }}
                </NButton>
                <span>/ {{ totalPages }} {{ t('message.page') }}</span>
                <!-- 添加错误信息显示 -->
                <div v-if="jumpPageError" style="color: #f56c6c; font-size: 12px; margin-left: 10px;">
                  {{ jumpPageError }}
                </div>
              </div>
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
  min-width: 1000px; /* 增加最小宽度以适应新增列 */
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
  user-select: none;
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

/* 提交信息单元格样式 - 支持自动换行 */
.commit-message-cell {
  word-break: break-word;
  white-space: normal;
  line-height: 1.4;
}

/* 提交列样式 */
.commit-message-column {
  min-width: 200px;
}

/* 下载列样式 */
.download-cell {
  display: flex;
  align-items: center;
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
  z-index: 1;
}

.resizable-column:hover::after {
  background-color: #1890ff;
}

/* 时间显示多行样式 */
.datetime-cell {
  display: flex;
  flex-direction: column;
  line-height: 1.4;
}

.datetime-line {
  text-align: left;
  white-space: nowrap;
}

.timezone-line {
  font-size: 0.85em;
  opacity: 0.7;
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
  .build-table th:nth-child(5),
  .build-table td:nth-child(5),
  .build-table th:nth-child(7),
  .build-table td:nth-child(7) {
    display: none;
  }

  .build-table {
    min-width: 800px;
  }
}
</style>
