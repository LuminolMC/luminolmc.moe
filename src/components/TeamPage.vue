<script setup lang="ts">
import {NButton} from "naive-ui";
import { useI18n } from 'vue-i18n'
import ProfileCard from "./ProfileCard.vue";
const { t } = useI18n()

const goTo = (path: string) => {
  window.open(path)
}
</script>

<template>
  <NLayout class="layout">
    <NLayoutContent style="padding: 0; margin: 0; width: 100%; box-sizing: border-box;" class="hero">
      <!-- Hero -->
      <div class="hero">
        <h1 style="font-size: 3.5rem; margin-bottom: 20px;">{{ t('message.teamTitle') }}</h1>
        <p style="font-size: 1.2rem; max-width: 800px;">{{ t('message.teamIntroduction') }}</p>
        <NButton type="primary" size="large" style="margin-right: 12px;" @click="goTo('https://github.com/LuminolMC')">{{ t('message.github_upper_case') }}</NButton>
        <NButton strong secondary size="large" @click="goTo('https://afdian.com/a/Luminol')">{{ t('message.sponsorUs') }}</NButton>
      </div>
    </NLayoutContent>
  </NLayout>
  <NLayout class="member" style="margin: auto 100px">
    <NFlex vertical>
      <p>{{ t('message.coreMembers') }}</p>
      <NGrid cols="1 400:2 600:3" style="width: 100%;">
        <NGridItem>
          <ProfileCard
              name="Earthme"
              :description="t('message.coreDev')"
              avatar="https://avatars.githubusercontent.com/u/79621885?v=4"
          />
        </NGridItem>
        <NGridItem>
          <ProfileCard
              name="Earthme"
              description="Luminol core dev"
              avatar="https://avatars.githubusercontent.com/u/79621885?v=4"
          />
        </NGridItem>
        <NGridItem>
          <ProfileCard
              name="Earthme"
              description="Luminol core dev"
              avatar="https://avatars.githubusercontent.com/u/79621885?v=4"
          />
        </NGridItem>
      </NGrid>
    </NFlex>
  </NLayout>


</template>

<style scoped>
.layout {
  min-height: 100vh;
}

.hero {
  text-align: left;
  background: #b6ade6;
  color: white;
  padding: 15vh 7vw;
  width: 100%;
  box-sizing: border-box;
  position: relative;
}

.member {
  text-align: left;
  color: white;
  margin: 1vh 1vw;
  width: 100%;
  box-sizing: border-box;
  position: relative;
}
</style>
