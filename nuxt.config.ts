// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  modules: ['@nuxtjs/i18n', 'nuxt-auth-utils', '@pinia/nuxt', '@nuxt/icon'],
  i18n: {
    defaultLocale: 'zh-CN',
    strategy: 'no_prefix',
    locales: [
      {
        code: "en-GB",
        flag: "GB",
        name: 'English (International)',
      },
      {
        code: "zh-CN",
        flag: "CN",
        name: '简体中文 (中国)',
      },
    ]
  },
  runtimeConfig: {
    leporidApi: 'http://localhost:8080',
  }
})