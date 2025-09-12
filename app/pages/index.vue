<template>
  <div>
    <app-nav />
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-4xl font-bold text-center mb-8">{{ t('welcome') }}</h1>
      <p class="text-center text-lg">{{ t('welcome-message') }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
const { t } = useI18n()

useHead({
  title: t('welcome')
})
</script>

<i18n lang="yaml">
en-GB:
  welcome: Welcome to Bunny
  welcome-message: Create and manage your customizable NFC cards

zh-CN:
  welcome: 欢迎来到 Bunny
  welcome-message: 创建和管理您的可定制NFC卡片
</i18n>