import {ref} from 'vue'

export interface GitHubContributor {
    id: number
    login: string
    avatar_url: string
    html_url: string
    contributions: number
    type: string
}

const GITHUB_API_BASE = 'https://api.github.com'
const REPO_OWNER = 'LuminolMC'
const REPO_NAME = 'Luminol'

// 缓存贡献者数据
const contributorsCache = ref<GitHubContributor[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

export const useGitHubContributors = () => {
    const fetchContributors = async (): Promise<GitHubContributor[]> => {
        if (contributorsCache.value.length > 0) {
            return contributorsCache.value
        }

        isLoading.value = true
        error.value = null

        try {
            const response = await fetch(
                `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contributors?per_page=100`
            )

            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`)
            }

            const data: GitHubContributor[] = await response.json()

            // 过滤掉机器人账户
            const filteredData = data.filter(contributor =>
                contributor.type === 'User' &&
                !contributor.login.includes('bot') &&
                !contributor.login.includes('dependabot')
            )

            contributorsCache.value = filteredData
            return filteredData
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to fetch contributors'
            console.error('Error fetching contributors:', err)
            return []
        } finally {
            isLoading.value = false
        }
    }

    const getMajorContributors = (contributors: GitHubContributor[]) => {
        return contributors.filter(c => c.contributions >= 100)
    }

    const getMinorContributors = (contributors: GitHubContributor[]) => {
        return contributors.filter(c => c.contributions < 100)
    }

    return {
        contributors: contributorsCache,
        isLoading,
        error,
        fetchContributors,
        getMajorContributors,
        getMinorContributors
    }
}

