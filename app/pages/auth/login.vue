<template>
    <div class="max-w-md mx-auto pt-16">
        <h1 class="text-3xl font-bold text-center mb-8">{{ t('login') }}</h1>

        <form @submit.prevent="handleLogin" class="space-y-6">
            <div>
                <label class="block text-sm font-medium mb-2">{{ t('username') }}</label>
                <input v-model="form.username" type="text" :placeholder="t('username-placeholder')"
                    class="input input-bordered w-full" :class="{ 'input-error': hasFieldError('username') }" />
                <p v-if="hasFieldError('username')" class="text-error text-sm mt-1">
                    {{ getFieldError('username') }}
                </p>
            </div>

            <div>
                <label class="block text-sm font-medium mb-2">{{ t('password') }}</label>
                <input v-model="form.password" type="password" :placeholder="t('password-placeholder')"
                    class="input input-bordered w-full" :class="{ 'input-error': hasFieldError('password') }" />
                <p v-if="hasFieldError('password')" class="text-error text-sm mt-1">
                    {{ getFieldError('password') }}
                </p>
            </div>

            <button type="submit" class="btn btn-primary w-full">
                {{ t('login') }}
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
</template>

<script setup lang="ts">
import { z } from 'zod'
import type { LoginRequest } from '~/def/auth'

const { t } = useI18n()
const { loggedIn, fetch: fetchUser } = useUserSession()
const { request } = useLeporid()

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

const { errors, validate, hasFieldError, getFieldError } = useFormValidation(loginSchema, form)

const handleLogin = async () => {
    if (!validate()) return

    await request<void>('/api/auth/login', {
        method: 'POST',
        body: form,
        showSuccessToast: true,
        successMessage: t('login-success')
    })

    await fetchUser()
    await navigateTo('/')
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
  login-success: Login successful!
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
  login-success: 登录成功！
  no-account: 没有账户？
  register: 注册
</i18n>