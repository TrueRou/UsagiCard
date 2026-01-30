// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },
    css: ['~/assets/css/main.css'],
    vite: {
        plugins: [
            tailwindcss(),
        ],
    },
    modules: [
        '@pinia/nuxt',
        '@nuxt/icon',
        'nuxt-auth-utils',
        '@nuxt/eslint',
        '@vueuse/nuxt',
        '@nuxtjs/i18n',
    ],
    eslint: {
        config: {
            standalone: false, // <---
        },
    },
    runtimeConfig: {
        bunny: {
            baseURL: 'http://localhost:7100',
        },
        leporid: {
            baseURL: 'https://api.turou.fun/leporid',
        },
        otoge: {
            baseURL: 'https://api.turou.fun/otoge',
        },
        public: {
            imageURL: 'https://assets.turou.fun/leporid/images',
            imagePreviewURL: 'https://assets.turou.fun/leporid/thumbnails',
        },
    },
    i18n: {
        defaultLocale: 'zh-CN',
        strategy: 'no_prefix',
        locales: [
            {
                code: 'zh-CN',
                flag: 'CN',
                name: '简体中文 (中国)',
            },
        ],
    },
    nitro: {
        preset: 'bun',
    },
})
