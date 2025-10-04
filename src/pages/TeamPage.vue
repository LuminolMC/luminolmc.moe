<script lang="ts" setup>
import {NAlert, NAvatar, NButton, NH2, NSpin, NText} from "naive-ui";
import {useI18n} from 'vue-i18n'
import {computed, onMounted, onUnmounted, ref} from 'vue'
import {useGitHubContributors} from "../services/github";
import {coreContributors} from "../data/coreContributors";

const {t, locale} = useI18n()
const {contributors, isLoading, error, fetchContributors} = useGitHubContributors()
const goTo = (path: string) => {
  window.open(path, '_blank')
}


// 使用手动配置的核心贡献者
const manualCoreContributors = computed(() => coreContributors)

// 所有贡献者（排除手动配置的核心贡献者）
const allContributors = computed(() => {
  const coreUsernames = coreContributors.map(c => c.github)
  return contributors.value.filter(c => !coreUsernames.includes(c.login))
})

const getContributorRole = (contributor: any) => {
  const currentLocale = locale.value as 'zh' | 'en'
  return contributor.role[currentLocale] || contributor.role.en
}

// 响应式头像大小
const windowWidth = ref(window.innerWidth)
const avatarSize = computed(() => {
  if (windowWidth.value >= 1920) return 50
  if (windowWidth.value <= 480) return 36
  if (windowWidth.value <= 768) return 40
  if (windowWidth.value <= 1200) return 44
  return 48
})

// 监听窗口大小变化
const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  fetchContributors()
  window.addEventListener('resize', updateWindowWidth)
})

// 清理事件监听器
onUnmounted(() => {
  window.removeEventListener('resize', updateWindowWidth)
})
</script>

<template>
  <div class="team-page">
    <!-- Hero Section -->
    <header class="hero">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">{{ t('message.teamTitle') }}</h1>
          <p class="hero-description">{{ t('message.teamIntroduction') }}</p>
          <div class="hero-buttons">
            <NButton
                size="large"
                type="primary"
                @click="goTo('https://afdian.com/a/Luminol')"
            >
              {{ t('message.sponsorUs') }}
            </NButton>
            <NButton
                secondary
                size="large"
                strong
                @click="goTo('https://github.com/LuminolMC')"
            >
              {{ t('message.github_upper_case') }}
            </NButton>
          </div>
        </div>
      </div>
    </header>

    <!-- Contributors Sections -->
    <div class="team-sections">

      <!-- Major Contributors Section -->
      <section class="team-section">
        <div class="section-header">
          <NH2 class="section-title">
            {{ t('message.team.majorContributors') }}
          </NH2>
          <NText class="section-description">
            {{ t('message.team.majorContributorsDesc') }}
          </NText>
        </div>

        <div v-if="isLoading" class="loading-container">
          <NSpin size="large">
            <NText>{{ t('message.team.loading') }}</NText>
          </NSpin>
        </div>

        <NAlert v-else-if="error" class="error-alert" type="error">
          {{ t('message.team.error') }}: {{ error }}
        </NAlert>

        <div class="contributors-flex">
          <article
              v-for="contributor in manualCoreContributors"
              :key="contributor.github"
              class="contributor-card"
              @click="goTo(`https://github.com/${contributor.github}`)"
          >
            <div class="contributor-layout">
              <div class="contributor-avatar-container">
                <NAvatar
                    :fallback-src="`https://github.com/${contributor.github}.png`"
                    :size="80"
                    :src="contributor.avatar"
                    class="contributor-avatar"
                />
              </div>
              <div class="contributor-info">
                <div class="contributor-name">{{ contributor.name }}</div>
                <div class="contributor-role">{{ getContributorRole(contributor) }}</div>
                <a
                    :href="`https://github.com/${contributor.github}`"
                    class="contributor-github-link"
                    rel="noreferrer"
                    target="_blank"
                    @click.stop
                >
                  <svg class="github-icon" fill="currentColor" viewBox="0 0 24 24">
                    <path
                        d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  {{ contributor.github }}
                </a>
              </div>
            </div>
          </article>
        </div>
      </section>

      <!-- All Contributors Section -->
      <section class="team-section">
        <div class="section-header">
          <NH2 class="section-title">
            {{ t('message.team.allContributors') }}
          </NH2>
          <NText class="section-description">
            {{ t('message.team.allContributorsDesc') }}
          </NText>
        </div>

        <div v-if="isLoading" class="loading-container">
          <NSpin size="large">
            <NText>{{ t('message.team.loading') }}</NText>
          </NSpin>
        </div>

        <div v-else-if="allContributors.length > 0" class="minor-contributors-flex">
          <div
              v-for="contributor in allContributors"
              :key="contributor.id"
              :title="`${contributor.login} - ${contributor.contributions}${t('message.team.contributions')}`"
              class="minor-contributor"
              @click="goTo(contributor.html_url)"
          >
            <NAvatar
                :fallback-src="`https://github.com/${contributor.login}.png`"
                :size="avatarSize"
                :src="contributor.avatar_url"
                class="minor-contributor-avatar"
            />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.team-page {
  min-height: 100vh;
  background: var(--n-color);
}

/* Hero Section */
.hero {
  background: linear-gradient(135deg, #b6ade6 0%, #9c88ff 100%);
  color: white;
  padding: 8rem 2rem 6rem;
  text-align: left;
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 4rem;
}

.hero-text {
  flex: 1;
  max-width: 600px;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
  line-height: 1.2;
}

.hero-description {
  font-size: 1.25rem;
  line-height: 1.6;
  margin: 0 0 2rem 0;
  opacity: 0.95;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

/* Team Sections */
.team-sections {
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem;
}

.team-section {
  margin-bottom: 4rem;
}

.section-header {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 2rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: var(--n-text-color);
}

.section-description {
  font-size: 1.1rem;
  color: var(--n-text-color-2);
  line-height: 1.6;
}

/* Team Sections 响应式布局 */
@media (min-width: 1920px) {
  .team-sections {
    max-width: 1400px;
    padding: 5rem 3rem;
  }

  .team-section {
    margin-bottom: 5rem;
  }

  .section-title {
    font-size: 2.5rem;
  }

  .section-description {
    font-size: 1.2rem;
  }
}

@media (max-width: 1200px) {
  .team-sections {
    max-width: 100%;
    padding: 3.5rem 1.5rem;
  }

  .team-section {
    margin-bottom: 3.5rem;
  }

  .section-title {
    font-size: 1.8rem;
  }
}

@media (max-width: 768px) {
  .team-sections {
    padding: 3rem 1rem;
  }

  .team-section {
    margin-bottom: 3rem;
  }

  .section-header {
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .section-title {
    font-size: 1.6rem;
  }

  .section-description {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .team-sections {
    padding: 2rem 0.75rem;
  }

  .team-section {
    margin-bottom: 2.5rem;
  }

  .section-title {
    font-size: 1.4rem;
  }

  .section-description {
    font-size: 0.9rem;
  }
}

.members-grid {
  margin-top: 2rem;
}

/* Loading and Error States */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem 0;
}

.error-alert {
  margin: 2rem 0;
}

/* Contributors Styles */
.contributors-flex {
  display: flex;
  flex-wrap: wrap;
  margin-top: 2rem;
  justify-content: center;
}

/* Contributors Flex 响应式布局 */
.contributors-flex .contributor-card {
  margin: 0.75rem;
  flex: 1 1 280px;
  max-width: 400px;
}

@media (min-width: 1920px) {
  .contributors-flex .contributor-card {
    margin: 0.75rem;
    flex: 1 1 400px;
  }
}

@media (min-width: 1200px) and (max-width: 1919px) {
  .contributors-flex .contributor-card {
    margin: 0.625rem;
    flex: 1 1 350px;
  }
}

@media (max-width: 1199px) {
  .contributors-flex .contributor-card {
    margin: 0.5rem;
    flex: 1 1 320px;
  }
}

@media (max-width: 768px) {
  .contributors-flex .contributor-card {
    margin: 0.5rem;
    flex: 1 1 100%;
  }
}

.contributor-card {
  border: 1px solid var(--n-border-color);
  border-radius: 8px;
  background: var(--n-card-color);
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 1rem;
}

.contributor-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.contributor-layout {
  display: flex;
  flex-direction: row;
  gap: 1.5rem;
  align-items: flex-start;
}

.contributor-avatar-container {
  flex-shrink: 0;
}

.contributor-avatar {
  border-radius: 8px;
  overflow: hidden;
}

.contributor-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.contributor-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--n-text-color);
  word-break: break-all;
}

.contributor-role {
  font-size: 0.9rem;
  color: var(--n-text-color-2);
  font-style: italic;
  margin-bottom: 0.25rem;
  line-height: 1.4;
}

.contributor-github-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #18a058;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.3s ease;
  word-break: break-all;
}

.contributor-github-link:hover {
  color: #36ad6a;
}

.github-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* Contributor Card 响应式 */
@media (max-width: 768px) {
  .contributor-layout {
    gap: 1rem;
  }

  .contributor-name {
    font-size: 1rem;
  }

  .contributor-role {
    font-size: 0.85rem;
  }

  .contributor-github-link {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .contributor-card {
    padding: 0.75rem;
  }

  .contributor-layout {
    gap: 0.75rem;
  }

  .contributor-name {
    font-size: 0.95rem;
  }

  .contributor-role {
    font-size: 0.8rem;
  }

  .contributor-github-link {
    font-size: 0.8rem;
  }
}

.minor-contributors-flex {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  margin-top: 2rem;
  padding: 1rem;
  background: var(--n-card-color);
  border-radius: 12px;
  border: 1px solid var(--n-border-color);
}

.minor-contributors-flex .minor-contributor {
  margin: 6px;
}


@media (min-width: 1920px) {
  .minor-contributors-flex .minor-contributor {
    margin: 5px;
  }
}

@media (max-width: 1200px) {

  .minor-contributors-flex .minor-contributor {
    margin: 5px;
  }
}

@media (max-width: 768px) {
  .minor-contributors-flex {
    padding: 0.75rem;
  }

  .minor-contributors-flex .minor-contributor {
    margin: 4px;
  }

}

@media (max-width: 480px) {
  .minor-contributors-flex {
    padding: 0.5rem;
  }

  .minor-contributors-flex .minor-contributor {
    margin: 3px;
  }

}

.minor-contributor {
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s ease;
  border-radius: 50%;
  overflow: hidden;
}

.minor-contributor:hover {
  transform: scale(1.1);
}

.minor-contributor-avatar {
  border: 2px solid var(--n-border-color);
  transition: border-color 0.3s ease;
}

.minor-contributor:hover .minor-contributor-avatar {
  border-color: var(--n-primary-color);
}


@media (max-width: 768px) {
  .hero {
    padding: 6rem 1.5rem 4rem;
    text-align: center;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-description {
    font-size: 1.1rem;
  }

  .hero-buttons {
    justify-content: center;
  }

  .team-sections {
    padding: 3rem 1.5rem;
  }

  .section-title {
    font-size: 1.75rem;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-buttons {
    flex-direction: column;
    align-items: center;
  }

  .hero-buttons .n-button {
    width: 100%;
    max-width: 200px;
  }
}
</style>
