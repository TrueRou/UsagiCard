<template>
    <div class="min-h-screen bg-base-200 p-4">
        <div class="max-w-md mx-auto pt-16">
            <h1 class="text-3xl font-bold text-center mb-8">{{ t('register') }}</h1>

            <form @submit.prevent="handleRegister" class="space-y-6">
                <div>
                    <label class="block text-sm font-medium mb-2">{{ t('username') }}</label>
                    <input v-model="form.username" type="text" :placeholder="t('username-placeholder')"
                        class="input input-bordered w-full" :class="{ 'input-error': validationErrors.username }" />
                    <p v-if="validationErrors.username" class="text-error text-sm mt-1">
                        {{ validationErrors.username }}
                    </p>
                </div>

                <div>
                    <label class="block text-sm font-medium mb-2">{{ t('phone') }}</label>
                    <input v-model="form.phone" type="tel" :placeholder="t('phone-placeholder')"
                        class="input input-bordered w-full" :class="{ 'input-error': validationErrors.phone }" />
                    <p v-if="validationErrors.phone" class="text-error text-sm mt-1">
                        {{ validationErrors.phone }}
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

                <div>
                    <label class="block text-sm font-medium mb-2">{{ t('confirm-password') }}</label>
                    <input v-model="form.confirmPassword" type="password"
                        :placeholder="t('confirm-password-placeholder')" class="input input-bordered w-full"
                        :class="{ 'input-error': validationErrors.confirmPassword }" />
                    <p v-if="validationErrors.confirmPassword" class="text-error text-sm mt-1">
                        {{ validationErrors.confirmPassword }}
                    </p>
                </div>

                <div v-if="errorMessage" class="alert alert-error">
                    <span>{{ errorMessage }}</span>
                </div>

                <div v-if="successMessage" class="alert alert-success">
                    <span>{{ successMessage }}</span>
                </div>

                <button type="submit" class="btn btn-primary w-full" :class="{ 'loading': loading }"
                    :disabled="loading">
                    {{ loading ? t('registering') : t('register') }}
                </button>
            </form>

            <hr class="my-8">

            <p class="text-center text-sm">
                {{ t('have-account') }}
                <NuxtLink to="/auth/login" class="link link-primary">
                    {{ t('login') }}
                </NuxtLink>
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import type { RegisterRequest, ApiResponse } from '~/def/api'

const { t } = useI18n()
const { loggedIn } = useUserSession()

// Redirect if already logged in
watchEffect(() => {
    if (loggedIn.value) {
        navigateTo('/')
    }
})

// Extended register form with confirmPassword
interface RegisterForm extends RegisterRequest {
    confirmPassword: string
}

// Zod schema for validation
const registerSchema = z.object({
    username: z.string().min(3, t('username-min-length')),
    phone: z.string().regex(/^1[3-9]\d{9}$/, t('phone-invalid')),
    password: z.string().min(6, t('password-min-length')),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: t('password-mismatch'),
    path: ['confirmPassword'],
})

const form = reactive<RegisterForm>({
    username: '',
    phone: '',
    password: '',
    confirmPassword: ''
})

const validationErrors = reactive<Partial<Record<keyof RegisterForm, string>>>({})
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const validateForm = () => {
    Object.keys(validationErrors).forEach(key => {
        validationErrors[key as keyof RegisterForm] = ''
    })

    try {
        registerSchema.parse(form)
        return true
    } catch (error) {
        if (error instanceof z.ZodError) {
            error.issues.forEach((issue) => {
                const field = issue.path[0] as keyof RegisterForm
                if (field in validationErrors) {
                    validationErrors[field] = issue.message
                }
            })
        }
        return false
    }
}

const handleRegister = async () => {
    if (!validateForm()) return

    loading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    try {
        const requestData: RegisterRequest = {
            username: form.username,
            password: form.password,
            phone: form.phone
        }

        await $fetch<void>('/api/auth/register', {
            method: 'POST',
            body: requestData
        })

        successMessage.value = t('register-success')

        // Redirect to login page after successful registration
        setTimeout(() => {
            navigateTo('/auth/login')
        }, 2000)
    } catch (error: unknown) {
        const apiError = error as { data?: ApiResponse }
        errorMessage.value = apiError.data?.message || t('register-failed')
    } finally {
        loading.value = false
    }
}

useHead({
    title: t('register')
})
</script>

<i18n lang="yaml">
en-GB:
  register: Register
  username: Username
  phone: Phone Number
  password: Password
  confirm-password: Confirm Password
  username-placeholder: Enter your username
  phone-placeholder: Enter your phone number
  password-placeholder: Enter your password
  confirm-password-placeholder: Confirm your password
  username-required: Username is required
  username-min-length: Username must be at least 3 characters
  phone-required: Phone number is required
  phone-invalid: Please enter a valid phone number
  password-required: Password is required
  password-min-length: Password must be at least 6 characters
  confirm-password-required: Please confirm your password
  password-mismatch: Passwords do not match
  registering: Registering...
  register-failed: Registration failed. Please try again.
  register-success: Registration successful! Redirecting to login...
  or: OR
  have-account: Already have an account?
  login: Login

zh-CN:
  register: 注册
  username: 用户名
  phone: 手机号
  password: 密码
  confirm-password: 确认密码
  username-placeholder: 请输入用户名
  phone-placeholder: 请输入手机号
  password-placeholder: 请输入密码
  confirm-password-placeholder: 请确认密码
  username-required: 用户名不能为空
  username-min-length: 用户名至少需要3个字符
  phone-required: 手机号不能为空
  phone-invalid: 请输入有效的手机号
  password-required: 密码不能为空
  password-min-length: 密码至少需要6个字符
  confirm-password-required: 请确认密码
  password-mismatch: 两次输入的密码不一致
  registering: 注册中...
  register-failed: 注册失败，请重试。
  register-success: 注册成功！正在跳转到登录页面...
  or: 或者
  have-account: 已有账户？
  login: 登录
</i18n>