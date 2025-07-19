<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { h, computed } from 'vue'
import {
  type MenuOption,
  NMenu,
  NAffix,
  NLayoutFooter
} from 'naive-ui'

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
        { default: () => '主页' }
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
        { default: () => '下载' }
      ),
  }  
]
const route = useRoute()
const currentRouteName = computed(() => route.name as string)
</script>

<template>
  <div>
    <NAffix>
      <NLayoutHeader>
        <div class="header-container">
          <div class="logo">Luminol</div>
          <NMenu :options="menuOptions" mode="horizontal" class="menu" v-model:value="currentRouteName"/>
        </div>
      </NLayoutHeader>
    </NAffix>
    <router-view />
    <div style="padding-top: 20px;">
      <NLayoutFooter style="text-align: center; padding: 24px; background: #f5f5f5; padding: 20px 24px; text-align: center;">
        <p>© 2025 Luminol Team. 保留所有权利。</p>
      </NLayoutFooter>
    </div>
  </div>

</template>

<style scoped>
.header-container {
  display: flex;
  align-items: center;
  height: 60px;
  justify-content: space-between;
  padding: 0 40px;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  color: #646cff;
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
</style>
