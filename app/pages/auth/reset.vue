<script setup lang="ts">
import { z } from 'zod'

useHead({
    title: '重置密码 - 兔兔实验室',
})

const nuxtApp = useNuxtApp()
const notificationsStore = useNotificationsStore()

const form = reactive({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
})

const schema = z.object({
    username: z.string().min(3, '用户名至少 3 个字符'),
    email: z.string().email('请输入正确的邮箱地址'),
    password: z.string().min(6, '密码至少 6 个字符'),
    confirmPassword: z.string(),
}).refine(values => values.password === values.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
})

const { validate, ve } = useFormValidation(schema, form)
const isSubmitting = ref(false)

async function handleSubmit() {
    if (!validate() || isSubmitting.value)
        return

    isSubmitting.value = true
    try {
        await nuxtApp.$leporid('/api/auth/reset', {
            method: 'PATCH',
            body: {
                username: form.username,
                email: form.email,
                password: form.password,
            },
        })
        notificationsStore.addNotification({
            type: 'info',
            message: '账户信息已更新，请重新登录。',
        })
        await navigateTo('/auth/login', { replace: true })
    }
    finally {
        isSubmitting.value = false
    }
}
</script>

<template>
    <div class="max-w-md mx-auto px-4 pt-16">
        <div class="space-y-2 text-center">
            <h1 class="text-2xl font-bold">
                完成密码重置步骤
            </h1>
            <p class="text-sm text-base-content/70">
                联系管理员删除密码后，可以通过输入用户名和注册邮箱来重置密码。请确保输入的信息准确无误。
            </p>
        </div>

        <form class="mt-6 space-y-4" @submit.prevent="handleSubmit">
            <div>
                <label class="mb-1 block text-sm font-medium">用户名</label>
                <input
                    v-model="form.username" class="input input-bordered w-full" type="text"
                    :class="{ 'input-error': ve('username') }" placeholder="请输入原用户名"
                >
            </div>

            <div>
                <label class="mb-1 block text-sm font-medium">邮箱</label>
                <input
                    v-model="form.email" class="input input-bordered w-full" type="email"
                    :class="{ 'input-error': ve('email') }" placeholder="请输入原邮箱"
                >
                <p v-if="ve('email')" class="mt-1 text-xs text-error">
                    {{ ve('email') }}
                </p>
            </div>

            <div>
                <label class="mb-1 block text-sm font-medium">密码</label>
                <input
                    v-model="form.password" class="input input-bordered w-full" type="password"
                    :class="{ 'input-error': ve('password') }" placeholder="输入新密码"
                >
                <p v-if="ve('password')" class="mt-1 text-xs text-error">
                    {{ ve('password') }}
                </p>
            </div>

            <div>
                <label class="mb-1 block text-sm font-medium">确认密码</label>
                <input
                    v-model="form.confirmPassword" class="input input-bordered w-full" type="password"
                    :class="{ 'input-error': ve('confirmPassword') }" placeholder="再次输入新密码"
                >
                <p v-if="ve('confirmPassword')" class="mt-1 text-xs text-error">
                    {{ ve('confirmPassword') }}
                </p>
            </div>

            <button class="btn btn-warning w-full" type="submit" :disabled="isSubmitting">
                <span v-if="isSubmitting" class="loading loading-spinner" />
                <span>立即更新</span>
            </button>
        </form>
    </div>
</template>
