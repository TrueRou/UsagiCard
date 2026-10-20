<script setup lang="ts">
definePageMeta({
    layout: 'default',
})

useHead({
    title: '登录 - 兔兔实验室',
})

const { loggedIn } = useUserSession()
const route = useRoute()

// 登录后的跳转目标：仅允许站内路径
const redirectTarget = computed(() => {
    const r = route.query.redirect as string
    if (r && r.startsWith('/') && !r.startsWith('//') && !r.startsWith('/auth/'))
        return r
    return '/'
})

const loginError = computed(() => (typeof route.query.error === 'string' ? route.query.error : ''))

if (loggedIn.value)
    await navigateTo(redirectTarget.value, { replace: true })

function oauthURL(prompt?: 'create') {
    return loginURL(redirectTarget.value, prompt)
}

async function handleLogin(prompt?: 'create') {
    await navigateTo(oauthURL(prompt), { external: true })
}
</script>

<template>
    <main class="min-h-screen bg-linear-to-b from-base-200 to-base-100 px-6 py-12">
        <section class="mx-auto max-w-md space-y-6 pt-8">
            <header class="space-y-2 text-center">
                <p class="text-sm uppercase tracking-widest text-base-content/60">
                    UsagiLab 兔兔实验室
                </p>
                <h1 class="text-3xl font-bold text-base-content">
                    登录
                </h1>
                <p class="text-sm text-base-content/70">
                    使用 UsagiLab 账号登录后即可申领你的卡片。
                </p>
            </header>

            <div v-if="loginError" role="alert" class="alert alert-error alert-soft text-sm">
                <Icon name="mdi:alert-circle-outline" class="w-5 h-5" />
                <span>{{ loginError }}</span>
            </div>

            <button type="button" class="btn btn-primary w-full" @click="handleLogin()">
                使用 UsagiLab 账号登录
            </button>

            <p class="text-center text-sm">
                没有账户？
                <a :href="oauthURL('create')" class="link link-primary" @click.prevent="handleLogin('create')">
                    注册
                </a>
            </p>

            <div class="text-center">
                <NuxtLink :to="redirectTarget" class="btn btn-ghost btn-sm">
                    返回
                </NuxtLink>
            </div>
        </section>
    </main>
</template>
