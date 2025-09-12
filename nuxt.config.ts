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
  modules: ['@nuxtjs/i18n', 'nuxt-auth-utils'],
  i18n: {
    defaultLocale: 'en-GB',
    locales: [
      { code: 'en-GB', name: 'English' },
      { code: 'zh-CN', name: '简体中文' },
    ]
  },
  runtimeConfig: {
    leporidApi: 'http://localhost:8080',
  }
})