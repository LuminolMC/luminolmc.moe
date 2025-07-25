<template>
  <n-card :bordered="false" hoverable>
    <div class="profile-card">
      <div class="avatar-wrapper">
        <n-avatar
            :size="80"
            :src="avatar"
            :fallback-src="fallbackAvatar"
        />
      </div>
      <div class="profile-info">
        <n-h2 class="name">{{ name }}</n-h2>
        <n-text depth="3" class="description">{{ description }}</n-text>
      </div>
    </div>
  </n-card>
</template>

<script setup>
import { NCard, NAvatar, NH2, NText } from 'naive-ui'

const props = defineProps({
  name: {
    type: String,
    required: true,
    default: 'Unnamed'
  },
  description: {
    type: String,
    default: 'Nothing here'
  },
  avatar: {
    type: String,
    default: ''
  },
  fallbackAvatar: {
    type: String,
    default: 'https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg' // Naive UI 的默认头像
  }
})
</script>

<style scoped>
.profile-card {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar-wrapper {
  flex-shrink: 0;
}

.profile-info {
  flex-grow: 1;
}

.name {
  margin: 0 0 5px 0;
}

.description {
  display: block;
  line-height: 1.5;
}
</style>
