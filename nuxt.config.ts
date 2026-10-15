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
        'nuxt-auth-utils',
    ],
    icon: {
        localApiEndpoint: '/_nuxt_icon',
    },
    typescript: {
        // tests/ 下的纯函数单测（bun test）不在 Nuxt 默认的 tests/nuxt/** 范围内，显式纳入 app 上下文做类型检查
        tsConfig: {
            include: ['../tests/**/*'],
        },
    },
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
        // UsagiLab 账号登录（OAuth 授权码 + PKCE），凭据通过 NUXT_OAUTH_OIDC_* 注入
        oauth: {
            oidc: {
                clientId: '',
                clientSecret: '',
            },
        },
        leporidae: {
            baseURL: 'https://api.turou.fun/leporidae',
            fePublicURL: 'https://hoshirabi.com',
            developerToken: '4616dd015b6139704d259ea9c1a0e29d',
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
