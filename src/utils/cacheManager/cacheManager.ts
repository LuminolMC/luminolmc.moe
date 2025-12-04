import cacheConfigs from '../../config/cacheConfig.ts';

// 定义通用类型
interface CacheData<T> {
    timestamp: number;
    data: T;
}

// GitHub发布信息接口
export interface GitHubRelease {
    id: number;
    name: string;
    tag_name: string;
    published_at: string;
    html_url: string;
    prerelease: boolean;
    assets?: Array<{
        browser_download_url: string;
        download_count: number;
        content_type: string;
        name: string;
    }>;
    author?: {
        login: string;
    };
    body?: string;
    target_commitish?: string;
}

// 构建记录接口
export interface BuildRecord {
    id: number;
    projectName: string;
    version: string;
    buildNumber: number;
    releaseType: 'release' | 'prerelease';
    startTime: string;
    endTime: string;
    duration: number;
    commitHash: string;
    branch: string;
    triggerBy: string;
    commitMessage: string;
    downloadUrl?: string;
    downloadCount?: number;
    fromCache?: boolean;
}

// 缓存管理器类
class CacheManager {
    private readonly CACHE_DURATION = 30 * 60 * 1000; // 30分钟
    private readonly COOLDOWN_DURATION = 15 * 60 * 1000; // 15分钟
    private lastErrorTime = 0; // 上次错误时间

    // 检查缓存是否有效
    isCacheValid(cachedData: any): boolean {
        if (!cachedData) return false;
        const now = Date.now();
        return (now - cachedData.timestamp) < this.CACHE_DURATION;
    }

    // 从缓存获取数据
    getCachedData<T>(cacheKey: string): T | null {
        try {
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                const parsed: CacheData<T> = JSON.parse(cached);
                if (this.isCacheValid(parsed)) {
                    return parsed.data;
                } else {
                    // 缓存过期，清除缓存
                    localStorage.removeItem(cacheKey);
                }
            }
        } catch (e) {
            console.error('[CacheManager] Failed to read cache:', e);
        }
        return null;
    }

    // 保存数据到缓存
    saveToCache<T>(cacheKey: string, data: T): void {
        try {
            const cacheData: CacheData<T> = {
                timestamp: Date.now(),
                data: data
            };
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        } catch (e) {
            console.error('[CacheManager] Failed to save cache:', e);
        }
    }

    // 检查是否在冷却期内
    isInCooldown(): boolean {
        const now = Date.now();
        return (now - this.lastErrorTime) < this.COOLDOWN_DURATION;
    }

    // 设置错误时间
    setErrorTime(): void {
        this.lastErrorTime = Date.now();
    }

    // 加载可能的JSON结构配置
    private async loadPossibleStructures(): Promise<Array<{name: string, target: string}>> {
        try {
            const structures: Array<{name: string, target: string}> = [];

            // 动态导入所有可能的结构配置文件
            const modules = import.meta.glob('./possibleJsonStructure/*.json');

            // 依次加载每个结构文件
            for (const path in modules) {
                try {
                    const module = await modules[path]() as { default: {name: string, target: string} };
                    structures.push(module.default);
                } catch (e) {
                    console.warn(`[CacheManager] Failed to load structure from ${path}:`, e);
                }
            }

            return structures;
        } catch (e) {
            console.error('[CacheManager] Failed to load possible structures:', e);
            return [];
        }
    }

    // 在数据结构中查找目标数组
    private findReleasesInStructure(data: any, structures: Array<{name: string, target: string}>): any[] {
        // 遍历所有可能的结构
        for (const structure of structures) {
            const targetPath = structure.target;

            if (targetPath === "*#*" || targetPath === "") {
                // 直接是数组的情况
                if (Array.isArray(data)) {
                    return data;
                }
            } else {
                // 嵌套路径的情况
                const result = this.getNestedProperty(data, targetPath);
                if (Array.isArray(result)) {
                    return result;
                }
            }
        }

        // 如果没找到匹配的结构，返回空数组
        return [];
    }

    // 获取嵌套属性值
    private getNestedProperty(obj: any, path: string): any {
        return path.split('.').reduce((current, prop) => {
            return current && current[prop] !== undefined ? current[prop] : undefined;
        }, obj);
    }

    // 从备份服务器获取数据
    async fetchFromBackupCache<T>(
        projectName: string,
        dataTransformer: (item: any) => T
    ): Promise<T[] | null> {
        // 加载可能的结构配置
        const possibleStructures = await this.loadPossibleStructures();

        // 遍历所有缓存配置
        for (const config of cacheConfigs) {
            if (config.disabled) continue;

            try {
                // 尝试获取主缓存
                const backupResponse = await fetch(config.url);
                if (backupResponse.ok) {
                    const backupData = await backupResponse.json();

                    // 使用动态加载的结构查找发布数据
                    let releasesData: any[] = [];

                    if (possibleStructures.length > 0) {
                        releasesData = this.findReleasesInStructure(backupData, possibleStructures);
                    } else {
                        // 如果没有加载到结构定义，使用默认逻辑
                        releasesData = backupData;
                    }

                    // 过滤出指定项目的发布信息
                    const projectData = releasesData.filter((item: any) =>
                        item.source_repo && item.source_repo.toLowerCase().includes(projectName.toLowerCase())
                    );

                    // 转换数据格式
                    const convertedData: T[] = projectData.map(dataTransformer);
                    return convertedData;
                }
            } catch (e) {
                console.warn(`[CacheManager] Primary backup cache (${config.name}) unavailable, trying next:`, e);
                // 如果有配置旧缓存URL，则尝试获取旧缓存
                if (config.oldUrl) {
                    try {
                        const oldBackupResponse = await fetch(config.oldUrl);
                        if (oldBackupResponse.ok) {
                            const oldBackupData = await oldBackupResponse.json();

                            // 使用动态加载的结构查找发布数据
                            let releasesData: any[] = [];

                            if (possibleStructures.length > 0) {
                                releasesData = this.findReleasesInStructure(oldBackupData, possibleStructures);
                            } else {
                                // 如果没有加载到结构定义，使用默认逻辑
                                releasesData = oldBackupData;
                            }

                            // 过滤出指定项目的发布信息
                            const projectData = releasesData.filter((item: any) =>
                                item.source_repo && item.source_repo.toLowerCase().includes(projectName.toLowerCase())
                            );

                            // 转换数据格式
                            const convertedData: T[] = projectData.map(dataTransformer);
                            return convertedData;
                        }
                    } catch (oldError) {
                        console.warn(`[CacheManager] Old backup cache (${config.name}) also unavailable:`, oldError);
                    }
                }
            }
        }
        return null;
    }

    // 从GitHub获取发布数据
    async fetchFromGitHub(repos: string[]): Promise<BuildRecord[]> {
        let allBuildRecords: BuildRecord[] = [];

        for (const repo of repos) {
            // 获取项目名
            const projectName = repo.split('/')[1];

            // 分页获取所有发布（GitHub API每页最多100条）
            let apiPage = 1;
            let hasMore = true;

            while (hasMore) {
                try {
                    const response = await fetch(
                        `https://api.github.com/repos/${repo}/releases?per_page=100&page=${apiPage}`
                    );

                    if (!response.ok) {
                        break;
                    }

                    const releases: GitHubRelease[] = await response.json();

                    // 转换为BuildRecord格式
                    const buildRecords: BuildRecord[] = releases.map((release) => {
                        // 从tag_name提取提交哈希
                        const tagParts = release.tag_name.split('-');
                        const commitHash = tagParts.length > 1 ? tagParts[tagParts.length - 1].substring(0, 8) : '';

                        // 从assets中提取下载信息
                        let downloadUrl = '';
                        let downloadCount = 0;

                        if (release.assets && release.assets.length > 0) {
                            // 查找有效的下载资产（排除源代码压缩包）
                            const downloadAsset = release.assets.find((asset) =>
                                asset.browser_download_url &&
                                !asset.browser_download_url.includes('/source.') &&
                                (asset.content_type.includes('application/') || asset.name.endsWith('.jar'))
                            ) || release.assets[0];

                            if (downloadAsset) {
                                downloadUrl = downloadAsset.browser_download_url || '';
                                downloadCount = downloadAsset.download_count || 0;
                            }
                        }

                        // 从release body中提取提交信息
                        const commitMessage = this.extractCommitMessage(release.body || '');

                        // 从release body中提取分支信息
                        let branch = 'main';
                        const branchMatch = release.body?.match(/### Branch Info\n> ([\w\/\-\.]+)/);
                        if (branchMatch && branchMatch[1]) {
                            branch = branchMatch[1];
                        } else if (release.target_commitish) {
                            branch = release.target_commitish;
                        }

                        return {
                            id: release.id,
                            projectName: projectName,
                            version: release.tag_name,
                            buildNumber: release.id,
                            releaseType: release.prerelease ? 'prerelease' : 'release',
                            startTime: release.published_at,
                            endTime: release.published_at,
                            duration: 0,
                            commitHash: commitHash,
                            branch: branch,
                            triggerBy: release.author?.login || 'Unknown',
                            commitMessage: commitMessage,
                            downloadUrl: downloadUrl,
                            downloadCount: downloadCount,
                            fromCache: false
                        };
                    });

                    allBuildRecords = [...allBuildRecords, ...buildRecords];

                    // 如果返回结果少于100条，说明已经到最后一页
                    if (releases.length < 100) {
                        hasMore = false;
                    } else {
                        apiPage++;
                    }
                } catch (error) {
                    console.error(`[CacheManager] Error fetching releases for ${repo}:`, error);
                    break;
                }
            }
        }

        return allBuildRecords;
    }

    // 从发行版正文中提取提交信息的第一行
    extractCommitMessage(body: string): string {
        if (!body) return '';

        // 查找提交信息部分，格式为 "Commit Message\n> 提交信息内容"
        const commitMessageMatch = body.match(/### Commit Message\n> (.+)/);
        if (commitMessageMatch && commitMessageMatch[1]) {
            return commitMessageMatch[1];
        }

        return '';
    }

    // 处理备份数据为BuildRecord格式
    processBackupData(item: any, projectNameGetter: (repo: string) => string): BuildRecord {
        // 数据验证和默认值处理
        if (!item.source_repo || !item.tag_name) {
            throw new Error('Invalid item data in backup');
        }

        // 从source_repo提取项目名
        const projectName = projectNameGetter(item.source_repo);

        // 从tag_name提取版本信息和commit hash
        const tagParts = item.tag_name.split('-');
        const version = item.tag_name;
        // 提取提交哈希 (如: 1.21.8-cba8cbd -> cba8cbd)
        const commitHash = tagParts.length > 1 ? tagParts[tagParts.length - 1].substring(0, 8) : '';

        // 从body中提取分支信息
        let branch = 'main';
        const branchMatch = item.body?.match(/### Branch Info\n> ([\w\/\-\.]+)/);
        if (branchMatch && branchMatch[1]) {
            branch = branchMatch[1];
        }

        // 从body中提取触发者信息
        let triggerBy = 'Unknown';
        if (item.body?.includes('automatically compiled by GitHub Actions')) {
            triggerBy = 'GitHub Actions';
        }

        // 从body中提取提交信息
        const commitMessage = this.extractCommitMessage(item.body);

        // 从assets中提取下载信息
        let downloadUrl = '';
        let downloadCount = 0;

        if (item.assets && item.assets.length > 0) {
            const asset = item.assets[0]; // 使用第一个资产作为下载链接
            downloadUrl = asset.download_url || '';
            downloadCount = asset.download_count || 0;
        }

        // 根据备份数据中的状态字段设置状态，如果没有则根据tag名称判断
        let releaseType: 'release' | 'prerelease' = 'release';
        if (item.releaseType) {
            releaseType = item.releaseType;
        } else if (item.prerelease !== undefined) {
            releaseType = item.prerelease ? 'prerelease' : 'release';
        } else {
            // 根据tag名称判断是否为预发布版本
            const lowerTagName = item.tag_name.toLowerCase();
            if (lowerTagName.includes('beta') ||
                lowerTagName.includes('alpha') ||
                lowerTagName.includes('rc') ||
                lowerTagName.includes('snapshot') ||
                lowerTagName.includes('dev')) {
                releaseType = 'prerelease';
            }
        }

        return {
            id: item.id || Math.floor(Math.random() * 1000000),
            projectName: projectName,
            version: version,
            buildNumber: item.id || Math.floor(Math.random() * 1000000),
            releaseType: releaseType,
            startTime: item.published_at || new Date().toISOString(),
            endTime: item.published_at || new Date().toISOString(),
            duration: item.duration || 0,
            commitHash: commitHash,
            branch: branch,
            triggerBy: triggerBy,
            commitMessage: commitMessage,
            downloadUrl: downloadUrl,
            downloadCount: downloadCount,
            fromCache: true
        };
    }
}

// 创建缓存管理器实例
const cacheManager = new CacheManager();

export default cacheManager;
