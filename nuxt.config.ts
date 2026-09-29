// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: process.env.NODE_ENV === 'development' },
    css: ['~/assets/styles/main.css'],
    app: {
        head: {
            link: [
                { rel: 'dns-prefetch', href: 'https://static.turou.fun' },
                { rel: 'preconnect', href: 'https://static.turou.fun', crossorigin: '' },
            ],
        },
    },
    vite: {
        plugins: [
            tailwindcss(),
        ],
        server: {
            allowedHosts: true,
        },
        build: {
            sourcemap: false,
        },
    },
    modules: [
        '@pinia/nuxt',
        '@nuxt/icon',
        '@nuxt/eslint',
        '@vueuse/nuxt',
    ],
    icon: {
        localApiEndpoint: '/_nuxt_icon',
    },
    eslint: {
        config: {
            standalone: false, // <---
        },
    },
    runtimeConfig: {
        public: {
            URL: 'http://localhost:3000',
            imageURL: 'https://static.turou.fun/leporidae/images',
            imagePreviewURL: 'https://static.turou.fun/leporidae/images',
        },
    },
    nitro: {
        preset: 'bun',
        routeRules: {
            '/api/**': {
                proxy: {
                    to: `${process.env.NUXT_LEPORIDAE_BASE_URL || 'https://api.turou.fun/leporidae'}/**`,
                    headers: {
                        'X-Developer-Token': process.env.NUXT_LEPORIDAE_DEVELOPER_TOKEN || '4616dd015b6139704d259ea9c1a0e29d',
                    },
                },
            },
        },
    },
    hooks: {
        'pages:extend': (pages) => {
            const artifactIndex = pages.find(
                page => page.name === 'artifacts-id',
            )
            if (artifactIndex) {
                pages.push({
                    ...artifactIndex,
                    name: 'cards-id',
                    path: '/cards/:id()',
                })
            }
        },
    },

})
