// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: process.env.NODE_ENV === 'development' },
    css: ['~/assets/css/main.css'],
    app: {
        head: {
            link: [
                { rel: 'dns-prefetch', href: 'https://cdn.assets.turou.fun' },
                { rel: 'preconnect', href: 'https://cdn.assets.turou.fun', crossorigin: '' },
            ],
        },
    },
    vite: {
        plugins: [
            tailwindcss(),
        ],
        build: {
            sourcemap: false,
        },
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
        credential: {
            key: '',
        },
        public: {
            URL: 'http://localhost:3000',
            imageURL: 'https://cdn.assets.turou.fun/leporid/images',
            imagePreviewURL: 'https://cdn.assets.turou.fun/leporid/thumbnails',
        },
    },
    nitro: {
        preset: 'bun',
    },
})
