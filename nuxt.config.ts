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
        leporidae: {
            baseURL: 'https://api.turou.fun/leporidae',
            developerToken: '',
        },
        public: {
            URL: 'https://uc.turou.fun',
            imageURL: 'https://eo.assets.turou.fun/leporidae/images',
            imagePreviewURL: 'https://eo.assets.turou.fun/leporidae/thumbnails/',
        },
    },
    nitro: {
        preset: 'bun',
        externals: {
            inline: ['vue', 'vue-router', 'vue-bundle-renderer', '@vue/server-renderer', '@vueuse', 'pinia', 'unhead'],
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
