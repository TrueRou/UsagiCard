<script setup lang="ts">
import { z } from 'zod'

const { loggedIn, fetch: fetchUser } = useUserSession()

// Redirect if already logged in
watchEffect(() => {
    if (loggedIn.value) {
        navigateTo('/')
    }
})

// Zod schema for validation
const loginSchema = z.object({
    username: z.string().min(1, '用户名不能为空'),
    password: z.string().min(1, '密码不能为空'),
    refresh_token: z.string().optional(),
})

const form = reactive<UserAuthRequest>({
    username: '',
    password: '',
})

const { validate, ve } = useFormValidation(loginSchema, form)

async function handleLogin() {
    if (!validate())
        return

    await useNuxtApp().$leporid('/api/nuxt/auth/login', {
        method: 'POST',
        body: form,
        showSuccessToast: true,
        successMessage: '登录成功！',
    })

    await fetchUser()
    await navigateTo('/')
}

useHead({
    title: '登录',
})
</script>

<template>
    <div class="max-w-md mx-auto pt-16">
        <h1 class="text-3xl font-bold text-center mb-8">
            登录
        </h1>

        <form class="space-y-6" @submit.prevent="handleLogin">
            <div>
                <label class="block text-sm font-medium mb-2">用户名</label>
                <input
                    v-model="form.username" type="text" placeholder="请输入用户名"
                    class="input input-bordered w-full" :class="{ 'input-error': ve('username') }"
                >
                <p v-if="ve('username')" class="text-error text-sm mt-1">
                    {{ ve('username') }}
                </p>
            </div>

            <div>
                <label class="block text-sm font-medium mb-2">密码</label>
                <input
                    v-model="form.password" type="password" placeholder="请输入密码"
                    class="input input-bordered w-full" :class="{ 'input-error': ve('password') }"
                >
                <p v-if="ve('password')" class="text-error text-sm mt-1">
                    {{ ve('password') }}
                </p>
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
</template>
