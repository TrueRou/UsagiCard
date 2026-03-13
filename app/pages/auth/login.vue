<script setup lang="ts">
import { z } from 'zod'

useHead({
    title: '登录 - UsagiLab',
})

const { loggedIn, fetch: fetchUser } = useUserSession()
const route = useRoute()

// 登录后的跳转目标：优先使用 ?redirect= 参数，否则按资料完整性决定
const redirectTarget = computed(() => {
    const r = route.query.redirect as string
    if (r && r.startsWith('/'))
        return r
    return '/'
})

const strategyOptions: Array<{ value: AuthStrategy, name: string, desc: string, passwordLabel: string, usernameLabel?: string }> = [
    { value: AuthStrategy.LOCAL, name: 'UsagiLab 通行证', desc: '使用 UsagiLab 统一认证（原兔卡账号）登录', passwordLabel: '密码', usernameLabel: '用户名' },
]

watch(loggedIn, async () => {
    if (loggedIn.value) {
        await navigateTo(redirectTarget.value, { external: true })
    }
})

// Zod schema for validation
const loginSchema = z.object({
    username: z.string().min(1, '用户名不能为空'),
    password: z.string().min(1, '密码不能为空'),
    refresh_token: z.string().optional(),
    strategy: z.number(),
})

interface LoginForm {
    username: string
    password: string
    refresh_token?: string
    strategy: AuthStrategy
}

const form = reactive<LoginForm>({
    username: '',
    password: '',
    strategy: AuthStrategy.LOCAL,
})

const { validate, ve } = useFormValidation(loginSchema, form)

async function handleLogin() {
    if (!validate())
        return

    await useNuxtApp().$leporid('/api/nuxt/auth/login', {
        method: 'POST',
        body: {
            username: form.username,
            password: form.password,
            strategy: form.strategy,
        },
        showSuccessToast: true,
        successMessage: '登录成功！',
    })

    await fetchUser()
}
</script>

<template>
    <div>
        <BannerAccountSystem />

        <div class="max-w-md mx-auto px-4 pt-16">
            <h1 class="text-3xl font-bold text-center mb-8">
                登录
            </h1>

            <form class="space-y-6" @submit.prevent="handleLogin">
                <div v-if="strategyOptions[form.strategy]?.usernameLabel">
                    <label class="block text-sm font-medium mb-2">{{ strategyOptions[form.strategy]?.usernameLabel }}</label>
                    <input
                        v-model="form.username" type="text" :placeholder="`请输入${strategyOptions[form.strategy]?.usernameLabel}`"
                        class="input input-bordered w-full" :class="{ 'input-error': ve('username') }"
                    >
                    <p v-if="ve('username')" class="text-error text-sm mt-1">
                        {{ ve('username') }}
                    </p>
                </div>

                <div>
                    <label class="block text-sm font-medium mb-2">{{ strategyOptions[form.strategy]?.passwordLabel }}</label>
                    <input
                        v-model="form.password" type="password" :placeholder="`请输入${strategyOptions[form.strategy]?.passwordLabel}`"
                        class="input input-bordered w-full" :class="{ 'input-error': ve('password') }"
                    >
                    <p v-if="ve('password')" class="text-error text-sm mt-1">
                        {{ ve('password') }}
                    </p>
                </div>

                <div>
                    <p class="block text-sm font-medium mb-3">
                        登录方式
                    </p>
                    <div class="space-y-3">
                        <label
                            v-for="option in strategyOptions" :key="option.value"
                            class="flex items-start gap-3 rounded-box border border-base-300 px-3 py-2"
                        >
                            <input
                                v-model="form.strategy" type="radio" class="radio radio-primary mt-1"
                                :value="option.value"
                            >
                            <div>
                                <p class="font-medium text-sm">
                                    {{ option.name }}
                                </p>
                                <p class="text-xs text-base-content/70">
                                    {{ option.desc }}
                                </p>
                            </div>
                        </label>
                    </div>
                </div>

                <button type="submit" class="btn btn-primary w-full">
                    登录
                </button>
            </form>

            <hr class="my-8">

            <p class="text-center text-sm">
                没有账户？
                <NuxtLink to="/auth/register" class="link link-primary">
                    注册
                </NuxtLink>
            </p>
        </div>
    </div>
</template>
