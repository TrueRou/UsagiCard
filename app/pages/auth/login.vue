<template>
    <div class="min-h-screen bg-base-200 p-4">
        <div class="max-w-md mx-auto pt-16">
            <h1 class="text-3xl font-bold text-center mb-8">{{ t('login') }}</h1>

            <form @submit.prevent="handleLogin" class="space-y-6">
                <div>
                    <label class="block text-sm font-medium mb-2">{{ t('username') }}</label>
                    <input v-model="form.username" type="text" :placeholder="t('username-placeholder')"
                        class="input input-bordered w-full" :class="{ 'input-error': validationErrors.username }" />
                    <p v-if="validationErrors.username" class="text-error text-sm mt-1">
                        {{ validationErrors.username }}
                    </p>
                </div>

                <div>
                    <label class="block text-sm font-medium mb-2">{{ t('password') }}</label>
                    <input v-model="form.password" type="password" :placeholder="t('password-placeholder')"
                        class="input input-bordered w-full" :class="{ 'input-error': validationErrors.password }" />
                    <p v-if="validationErrors.password" class="text-error text-sm mt-1">
                        {{ validationErrors.password }}
                    </p>
                </div>

                <div v-if="errorMessage" class="alert alert-error">
                    <span>{{ errorMessage }}</span>
                </div>

                <button type="submit" class="btn btn-primary w-full" :class="{ 'loading': loading }"
                    :disabled="loading">
                    {{ loading ? t('logging-in') : t('login') }}
                </button>
            </form>

            <hr class="my-8">

            <p class="text-center text-sm">
                {{ t('no-account') }}
                <NuxtLink to="/auth/register" class="link link-primary">
                    {{ t('register') }}
                </NuxtLink>
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import type { LoginRequest, ApiResponse } from '~/def/api'

const { t } = useI18n()
const { loggedIn, fetch: fetchUser } = useUserSession()

// Redirect if already logged in
watchEffect(() => {
    if (loggedIn.value) {
        navigateTo('/')
    }
})

// Zod schema for validation
const loginSchema = z.object({
    username: z.string().min(1, t('username-required')),
    password: z.string().min(1, t('password-required')),
})

const form = reactive<LoginRequest>({
    username: '',
    password: ''
})

const validationErrors = reactive<Partial<Record<keyof LoginRequest, string>>>({})
const loading = ref(false)
const errorMessage = ref('')

const validateForm = () => {
    validationErrors.username = ''
    validationErrors.password = ''

    try {
        loginSchema.parse(form)
        return true
    } catch (error) {
        if (error instanceof z.ZodError) {
            error.issues.forEach((issue) => {
                const field = issue.path[0] as keyof LoginRequest
                if (field in validationErrors) {
                    validationErrors[field] = issue.message
                }
            })
        }
        return false
    }
}

const handleLogin = async () => {
    if (!validateForm()) return

    loading.value = true
    errorMessage.value = ''

    try {
        await $fetch<void>('/api/auth/login', {
            method: 'POST',
            body: form
        })

        await fetchUser()
        await navigateTo('/')
    } catch (error: unknown) {
        const apiError = error as { data?: ApiResponse }
        errorMessage.value = apiError.data?.message || t('login-failed')
    } finally {
        loading.value = false
    }
}

useHead({
    title: t('login')
})
</script>

<i18n lang="yaml">
en-GB:
  login: Login
  username: Username
  password: Password
  username-placeholder: Enter your username
  password-placeholder: Enter your password
  username-required: Username is required
  password-required: Password is required
  logging-in: Logging in...
  login-failed: Login failed. Please check your credentials.
  or: OR
  no-account: Don't have an account?
  register: Register

zh-CN:
  login: 登录
  username: 用户名
  password: 密码
  username-placeholder: 请输入用户名
  password-placeholder: 请输入密码
  username-required: 用户名不能为空
  password-required: 密码不能为空
  logging-in: 登录中...
  login-failed: 登录失败，请检查您的凭据。
  or: 或者
  no-account: 没有账户？
  register: 注册
</i18n>