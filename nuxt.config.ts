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
    ],
    eslint: {
        config: {
            standalone: false, // <---
        },
    },
    runtimeConfig: {
        session: {
            name: 'nuxt-session',
            password: process.env.NUXT_SESSION_PASSWORD || '',
            maxAge: 31536000,
            cookie: {
                sameSite: 'lax',
            },
        },
        leporid: {
            baseURL: 'https://api.turou.fun/leporid',
        },
        otoge: {
            baseURL: 'https://api.turou.fun/otoge',
            developerToken: '',
        },
        public: {
            URL: 'http://localhost:3000',
            imageURL: 'https://assets.turou.fun/leporid/images',
            imagePreviewURL: 'https://assets.turou.fun/leporid/thumbnails',
        },
    },
    nitro: {
        preset: 'bun',
    },
})
