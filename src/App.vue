<script setup lang="ts">
import {useI18n} from 'vue-i18n'
const { t, locale } = useI18n()
const currentLocale = locale

import {RouterLink, useRoute} from 'vue-router'
import {h, computed} from 'vue'
import {
  type MenuOption,
  NMenu,
  NLayoutFooter, NButton
} from 'naive-ui'

function changeLanguage(lang: string) {
  locale.value = lang
}

const menuOptions: MenuOption[] = [
  {
    key: 'home',
    label: () =>
        h(
            RouterLink,
            {
              to: {
                name: 'home',
              }
            },
            {default: () => t('message.home')}
        ),
  },
  {
    key: 'download',
    label: () =>
        h(
            RouterLink,
            {
              to: {
                name: 'download',
              }
            },
            {default: () => t('message.download')}
        ),
  },
  {
    key: 'team',
    label: () =>
        h(
            RouterLink,
            {
              to: {
                name: 'team',
              }
            },
            {default: () => t('message.team')}
        ),
  }
]
const route = useRoute()
const currentRouteName = computed(() => route.name as string)
</script>

<template>
    <NLayoutHeader>
      <div class="header-container">
        <div class="logo">Luminol</div>
        <NMenu :options="menuOptions" mode="horizontal" class="menu" v-model:value="currentRouteName"/>
        <div style="top: 20px; right: 20px; display: flex; gap: 10px;">
          <NButton @click="changeLanguage('en')" :type="currentLocale === 'en' ? 'primary' : 'default'" size="small">English</NButton>
          <NButton @click="changeLanguage('zh')" :type="currentLocale === 'zh' ? 'primary' : 'default'" size="small">中文</NButton>
        </div>
      </div>
    </NLayoutHeader>
    <router-view/>
    <div style="padding-top: 20px;">
      <NLayoutFooter style="background: #f5f5f5; padding: 40px 24px;">
        <div class="footer-container">
          <div class="footer-column">
            <h3>{{ t('message.gettingStarted') }}</h3>
            <ul>
              <li>
                <RouterLink to="/download">{{ t('message.downloads') }}</RouterLink>
              </li>
              <li><a href="#">{{ t('message.documentation') }}</a></li>
              <li><a href="#">{{ t('message.javadocs') }}</a></li>
            </ul>
          </div>
          <div class="footer-column">
            <h3>{{ t('message.community') }}</h3>
            <ul>
              <li><a href="https://qm.qq.com/q/cFB0SXpWOQ">{{ t('message.qqgroup') }}</a></li>
              <li><a href="https://github.com/LuminolMC">Github</a></li>
              <li><a href="https://discord.gg/Qd7m3V6eDx">Discord</a></li>
              <li><a href="https://t.me/LuminolMinecraft">Telegram</a></li>
            </ul>
          </div>
          <div class="footer-column">
            <h3>LuminolMC</h3>
            <ul>
              <li><a href="#">{{ t('message.ourTeam') }}</a></li>
              <li><a href="#">{{ t('message.contribute') }}</a></li>
              <li><a href="#">{{ t('message.sponsors') }}</a></li>
            </ul>
          </div>
          <div class="footer-column">
            <h3>{{ t('message.friendship_links') }}</h3>
            <ul>
              <li><a href="https://www.locyan.cn/">Locyan Network</a></li>
              <li><a href="https://www.rainyun.com/">雨云</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom" style="margin-top: 30px; text-align: center;">
          <p>{{ t('message.copyright') }}</p>
          <!-- <p style="margin-top: 10px; font-size: 12px;">{{ t('message.websiteVersion') }} 02ef2e7</p> -->
          <p style="margin-top: 10px; font-size: 12px;">{{ t('message.disclaimer') }}</p>
<!--          <p><a href="https://github.com/LuminolMC/luminolmc.moe">luminolmc.moe @ {{ currentCommit }}</a></p>-->
        </div>
      </NLayoutFooter>
    </div>

</template>

<style scoped>
.header-container {
  display: flex;
  align-items: center;
  height: 60px;
  justify-content: space-between;
  margin-top: 0;
  padding: 0 40px;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  color: #b6ade6;
  vertical-align: middle;
}

.menu {
  padding-left: 20px;
  font-weight: 500;
  color: #000;
}

@media (max-width: 768px) {
  .header-container {
    padding: 0 20px;
  }

  .logo {
    font-size: 20px;
  }
}

.footer-container {
  display: flex;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  flex-wrap: wrap;
}

.footer-column {
  flex: 1;
  min-width: 200px;
  margin-bottom: 20px;
  padding: 0 15px;
}

.footer-column h3 {
  font-size: 16px;
  margin-bottom: 15px;
  color: #333;
}

.footer-column ul {
  list-style: none;
  padding: 0;
}

.footer-column li {
  margin-bottom: 10px;
}

.footer-column a {
  color: #b6ade6;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-column a:hover {
  color: #535bf2;
  text-decoration: underline;
}

@media (max-width: 768px) {
  .footer-container {
    flex-direction: column;
    align-items: center;
  }

  .footer-column {
    text-align: center;
  }
}

.footer-bottom {
  margin-top: 30px;
  text-align: center;
}

.footer-bottom p {
  margin: 5px 0;
}
</style>
