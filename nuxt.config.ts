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
    ],
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
