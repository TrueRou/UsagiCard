<script setup lang="ts">
const props = defineProps<{
    artifactId: string
    mode?: 'verify' | 'set'
}>()

const emit = defineEmits<{
    verified: [token: string]
    set: []
    close: []
}>()

const mode = props.mode ?? 'verify'

const digits = ref<string[]>([])
const maxLength = 6
const loading = ref(false)
const error = ref('')
const shaking = ref(false)

const confirmDigits = ref<string[]>([])
const setStep = ref<'input' | 'confirm'>('input')

const displayDigits = computed(() => {
    if (mode === 'set' && setStep.value === 'confirm') {
        return confirmDigits.value
    }
    return digits.value
})

const title = computed(() => {
    if (mode === 'set') {
        return setStep.value === 'input' ? '设置二级密码' : '确认密码'
    }
    return '输入二级密码'
})

function appendDigit(d: string) {
    if (displayDigits.value.length >= maxLength)
        return
    if (mode === 'set' && setStep.value === 'confirm') {
        confirmDigits.value.push(d)
        if (confirmDigits.value.length === maxLength) {
            handleSetConfirm()
        }
    }
    else {
        digits.value.push(d)
        if (digits.value.length === maxLength) {
            if (mode === 'verify') {
                handleVerify()
            }
            else {
                // set mode: 进入确认步骤
                setStep.value = 'confirm'
            }
        }
    }
}

function deleteDigit() {
    if (mode === 'set' && setStep.value === 'confirm') {
        confirmDigits.value.pop()
    }
    else {
        digits.value.pop()
    }
    error.value = ''
}

function clearAll() {
    digits.value = []
    confirmDigits.value = []
    error.value = ''
    setStep.value = 'input'
}

async function handleVerify() {
    loading.value = true
    error.value = ''
    try {
        const password = digits.value.join('')
        const res = await useNuxtApp().$leporid<{ token: string, expires_in: number }>(
            `/api/artifacts/${props.artifactId}/verify-pin`,
            { method: 'POST', body: { password }, showSuccessToast: false },
        )
        emit('verified', res.token)
    }
    catch (e: any) {
        error.value = e?.data?.detail || '密码错误'
        triggerShake()
    }
    finally {
        loading.value = false
    }
}

async function handleSetConfirm() {
    const first = digits.value.join('')
    const second = confirmDigits.value.join('')
    if (first !== second) {
        error.value = '两次密码不一致'
        confirmDigits.value = []
        triggerShake()
        return
    }

    loading.value = true
    error.value = ''
    try {
        await useNuxtApp().$leporid(
            `/api/artifacts/${props.artifactId}/set-pin`,
            { method: 'POST', body: { password: first }, showSuccessToast: true, successMessage: '二级密码设置成功' },
        )
        emit('set')
    }
    catch (e: any) {
        error.value = e?.data?.detail || '设置失败'
        triggerShake()
    }
    finally {
        loading.value = false
    }
}

function triggerShake() {
    shaking.value = true
    digits.value = []
    confirmDigits.value = []
    if (mode === 'set')
        setStep.value = 'input'
    setTimeout(() => { shaking.value = false }, 500)
}

const keypadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del']
</script>

<template>
    <div class="fixed inset-0 z-[100] bg-base-100/95 backdrop-blur-sm flex flex-col items-center justify-center p-6">
        <!-- 关闭按钮 -->
        <button
            class="absolute top-4 right-4 btn btn-ghost btn-sm btn-square"
            @click="emit('close')"
        >
            <Icon name="mdi:close" class="w-5 h-5" />
        </button>

        <!-- 标题 -->
        <h2 class="text-lg font-semibold mb-8">
            {{ title }}
        </h2>

        <!-- 6位圆点指示器 -->
        <div
            class="flex gap-3 mb-3"
            :class="{ 'animate-shake': shaking }"
        >
            <div
                v-for="i in maxLength"
                :key="i"
                class="w-3.5 h-3.5 rounded-full border-2 transition-all duration-150"
                :class="[
                    i <= displayDigits.length
                        ? 'bg-primary border-primary scale-110'
                        : 'border-base-content/30',
                ]"
            />
        </div>

        <!-- 错误提示 -->
        <p v-if="error" class="text-error text-sm mb-4">
            {{ error }}
        </p>
        <p v-else class="text-base-content/40 text-sm mb-4">
            {{ mode === 'set' && setStep === 'confirm' ? '请再次输入密码' : '请输入6位数字密码' }}
        </p>

        <!-- 数字键盘 -->
        <div class="grid grid-cols-3 gap-3 w-64">
            <template v-for="key in keypadKeys" :key="key">
                <button
                    v-if="key === 'del'"
                    class="h-14 rounded-xl flex items-center justify-center active:bg-base-300 transition-colors"
                    :disabled="loading"
                    @click="deleteDigit"
                >
                    <Icon name="mdi:backspace-outline" class="w-6 h-6" />
                </button>
                <div v-else-if="key === ''" class="h-14" />
                <button
                    v-else
                    class="h-14 rounded-xl bg-base-200 hover:bg-base-300 active:bg-base-300 transition-colors text-xl font-medium"
                    :disabled="loading"
                    @click="appendDigit(key)"
                >
                    {{ key }}
                </button>
            </template>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="mt-6">
            <span class="loading loading-spinner loading-sm" />
        </div>
    </div>
</template>

<style scoped>
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
    20%, 40%, 60%, 80% { transform: translateX(4px); }
}
.animate-shake {
    animation: shake 0.5s ease-in-out;
}
</style>
