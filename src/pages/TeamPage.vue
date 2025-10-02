<script setup lang="ts">
import { NButton, NH2, NText, NAvatar, NSpin, NAlert } from "naive-ui";
import { useI18n } from 'vue-i18n'
import { onMounted, onUnmounted, computed, ref } from 'vue'
import { useGitHubContributors } from "../services/github";

const { t } = useI18n()
const { contributors, isLoading, error, fetchContributors, getMajorContributors, getMinorContributors } = useGitHubContributors()

const goTo = (path: string) => {
  window.open(path, '_blank')
}


const majorContributors = computed(() => getMajorContributors(contributors.value))
const minorContributors = computed(() => getMinorContributors(contributors.value))

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
              type="primary" 
              size="large" 
              @click="goTo('https://afdian.com/a/Luminol')"
            >
              {{ t('message.sponsorUs') }}
            </NButton>
            <NButton 
              strong 
              secondary 
              size="large" 
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

        <NAlert v-else-if="error" type="error" class="error-alert">
          {{ t('message.team.error') }}: {{ error }}
        </NAlert>

        <div v-else-if="majorContributors.length > 0" class="contributors-flex">
          <div 
            v-for="contributor in majorContributors" 
            :key="contributor.id"
            class="contributor-card major-contributor"
            @click="goTo(contributor.html_url)"
          >
            <NAvatar
              :size="80"
              :src="contributor.avatar_url"
              :fallback-src="`https://github.com/${contributor.login}.png`"
              class="contributor-avatar"
            />
            <div class="contributor-info">
              <div class="contributor-name">{{ contributor.login }}</div>
              <div class="contributor-stats">
                {{ contributor.contributions }}{{ t('message.team.contributions') }}
              </div>
            </div>
          </div>
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

        <div v-else-if="minorContributors.length > 0" class="minor-contributors-flex">
          <div 
            v-for="contributor in minorContributors" 
            :key="contributor.id"
            class="minor-contributor"
            @click="goTo(contributor.html_url)"
            :title="`${contributor.login} - ${contributor.contributions}${t('message.team.contributions')}`"
          >
            <NAvatar
              :size="avatarSize"
              :src="contributor.avatar_url"
              :fallback-src="`https://github.com/${contributor.login}.png`"
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
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

/* Contributors Grid 响应式布局 */
@media (min-width: 1920px) {
  .contributors-flex {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
  }
}

@media (max-width: 1200px) {
  .contributors-flex {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 1.25rem;
  }
}

@media (max-width: 768px) {
  .contributors-flex {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .contributors-flex {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
}

.contributor-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  border: 1px solid var(--n-border-color);
  border-radius: 12px;
  background: var(--n-card-color);
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.contributor-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: var(--n-primary-color);
}

.major-contributor {
  min-height: 180px;
}

/* Contributor Card 响应式 */
@media (max-width: 768px) {
  .contributor-card {
    padding: 1.25rem;
  }
  
  .major-contributor {
    min-height: 160px;
  }
}

@media (max-width: 480px) {
  .contributor-card {
    padding: 1rem;
  }
  
  .major-contributor {
    min-height: 140px;
  }
  
  .contributor-name {
    font-size: 1rem;
  }
  
  .contributor-stats {
    font-size: 0.85rem;
  }
}

.contributor-avatar {
  margin-bottom: 1rem;
  border: 2px solid var(--n-border-color);
  transition: border-color 0.3s ease;
}

.contributor-card:hover .contributor-avatar {
  border-color: var(--n-primary-color);
}

.contributor-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.contributor-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--n-text-color);
  margin-bottom: 0.5rem;
}

.contributor-stats {
  font-size: 0.9rem;
  color: var(--n-text-color-2);
}

.minor-contributors-flex {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 12px;
  margin-top: 2rem;
  padding: 1rem;
  background: var(--n-card-color);
  border-radius: 12px;
  border: 1px solid var(--n-border-color);
}


@media (min-width: 1920px) {
  .minor-contributors-flex {
    grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
    gap: 10px;
  }
}

@media (max-width: 1200px) {
  .minor-contributors-flex {
    grid-template-columns: repeat(auto-fill, minmax(55px, 1fr));
    gap: 10px;
  }
}

@media (max-width: 768px) {
  .minor-contributors-flex {
    grid-template-columns: repeat(auto-fill, minmax(48px, 1fr));
    gap: 8px;
    padding: 0.75rem;
  }
}

@media (max-width: 480px) {
  .minor-contributors-flex {
    grid-template-columns: repeat(auto-fill, minmax(42px, 1fr));
    gap: 6px;
    padding: 0.5rem;
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
