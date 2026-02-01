<script lang="ts" setup>
import {useI18n} from 'vue-i18n'
import {RouterLink, useRoute} from 'vue-router'
import {type Component, computed, h, onMounted} from 'vue'
import {ExternalLink} from "@vicons/tabler";
import {type MenuOption, NDropdown, NIcon, NLayoutFooter, NMenu, NText} from 'naive-ui'
import {useLanguageStore} from './store/language'

const {t, locale} = useI18n()

function changeLanguage(lang: string) {
  locale.value = lang
  useLanguageStore().language = lang
}

function renderIcon(icon: Component) {
  return () => h(NIcon, null, {default: () => h(icon)})
}

onMounted(() => {
  changeLanguage(useLanguageStore().language)
})

const menuConfigs = [
  {key: 'home', nameKey: 'message.home', route: 'home'},
  {key: 'download', nameKey: 'message.download', route: 'download'},
  {key: 'team', nameKey: 'message.teamNav', route: 'team'},
  {
    key: 'luminolcraft',
    nameKey: 'message.luminolCraft',
    externalUrl: 'https://craft.luminolsuki.moe/',
    icon: ExternalLink
  }
];

const menuOptions = computed<MenuOption[]>(() =>
    menuConfigs.map(config => ({
      key: config.key,
      label: () => config.externalUrl
          ? h('a', {href: config.externalUrl, target: '_blank'}, t(config.nameKey))
          : h(RouterLink, {to: {name: config.route}}, {default: () => t(config.nameKey)}),
      ...(config.icon && {icon: renderIcon(config.icon)})
    }))
);

const languageOptions = [
  {key: 'zh', labelKey: 'message.simplifiedChinese'},
  {key: 'en', labelKey: 'message.english'}
];

const dropdownOptions = computed<MenuOption[]>(() =>
    languageOptions.map(option => ({
      label: t(option.labelKey),
      key: option.key,
      props: {
        onClick: () => changeLanguage(option.key)
      }
    }))
);

const route = useRoute()
const currentRouteName = computed(() => route.name as string)
</script>

<template>
  <NLayoutHeader>
    <div class="header-container">
      <div class="logo">Luminol</div>
      <div style="flex-grow: 1;">
        <NMenu v-model:value="currentRouteName" :options="menuOptions" class="menu" mode="horizontal"/>
      </div>
      <NDropdown :options="dropdownOptions" trigger="hover">
        <NText class="language">{{ t('message.language') }}</NText>
      </NDropdown>
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
            <li><a href="https://qm.qq.com/q/cFB0SXpWOQ">{{ t('message.qqGroup') }}</a></li>
            <li><a href="https://github.com/LuminolMC">{{ t('message.github_upper_case') }}</a></li>
            <li><a href="https://discord.gg/Qd7m3V6eDx">{{ t('message.discord') }}</a></li>
            <li><a href="https://t.me/LuminolMinecraft">{{ t('message.telegram') }}</a></li>
          </ul>
        </div>
        <div class="footer-column">
          <h3>LuminolMC</h3>
          <ul>
            <li>
              <RouterLink to="/team">{{ t('message.ourTeam') }}</RouterLink>
            </li>
            <li><a href="#">{{ t('message.contribute') }}</a></li>
            <li><a href="https://afdian.com/a/Luminol">{{ t('message.sponsors') }}</a></li>
          </ul>
        </div>
        <div class="footer-column">
          <h3>{{ t('message.friendship_links') }}</h3>
          <ul>
            <li><a href="https://www.locyan.cn/">{{ t('message.locyanNetwork') }}</a></li>
            <li><a href="https://www.rainyun.com/">{{ t('message.rainyun') }}</a></li>
            <li><a href="https://www.ej-technologies.com/jprofiler">{{ t('message.jprofiler') }}</a></li>
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

.language {
  color: #646cff;
}

.language:hover {
  cursor: pointer;
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
