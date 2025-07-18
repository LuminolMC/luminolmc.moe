<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { h } from 'vue'
import {
  type MenuOption,
  NMenu,
  NAffix
} from 'naive-ui'

const menuOptions: MenuOption[] = [
  {
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
</script>

<template>
  <div>
    <NAffix>
      <NLayoutHeader>
        <div class="header-container">
          <div class="logo">Luminol</div>
          <NMenu :options="menuOptions" mode="horizontal" class="menu"/>
        </div>
      </NLayoutHeader>
    </NAffix>
    <router-view />
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
