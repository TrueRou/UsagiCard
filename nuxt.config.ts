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
        '@nuxtjs/i18n',
        '@pinia/nuxt',
        '@nuxt/icon',
        'nuxt-auth-utils',
        '@nuxt/eslint',
    ],
    i18n: {
        defaultLocale: 'zh-CN',
        strategy: 'no_prefix',
        locales: [
            {
                code: 'en-GB',
                flag: 'GB',
                name: 'English (International)',
                file: 'en-GB.json',
            },
            {
                code: 'zh-CN',
                flag: 'CN',
                name: '简体中文 (中国)',
                file: 'zh-CN.json',
            },
        ],
    },
    eslint: {
        config: {
            standalone: false, // <---
        },
    },
    runtimeConfig: {
        leporid: {
            baseURL: 'https://api.dev.turou.fun/leporid',
        },
        otoge: {
            baseURL: 'https://api.dev.turou.fun/otoge',
        },
        public: {
            imageURL: 'https://assets.dev.turou.fun/leporid/images',
            imagePreviewURL: 'https://assets.dev.turou.fun/leporid/thumbnails',
        },
    },
    nitro: {
        preset: 'bun',
    },
})
