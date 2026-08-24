<script setup lang="ts">
defineProps<{
    artifactId: string
}>()

const emit = defineEmits<{
    verified: [pin: string]
    close: []
}>()

const digits = ref<string[]>([])
const maxLength = 6
const shaking = ref(false)

function appendDigit(d: string) {
    if (digits.value.length >= maxLength)
        return
    digits.value.push(d)
    if (digits.value.length === maxLength) {
        // PIN 由后续写请求携带至后端校验（X-Pin header），此处直接返回
        emit('verified', digits.value.join(''))
    }
}

function deleteDigit() {
    digits.value.pop()
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
            输入二级密码
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
                    i <= digits.length
                        ? 'bg-primary border-primary scale-110'
                        : 'border-base-content/30',
                ]"
            />
        </div>

        <p class="text-base-content/40 text-sm mb-4">
            请输入6位数字密码
        </p>

        <!-- 数字键盘 -->
        <div class="grid grid-cols-3 gap-3 w-64">
            <template v-for="key in keypadKeys" :key="key">
                <button
                    v-if="key === 'del'"
                    class="h-14 rounded-xl flex items-center justify-center active:bg-base-300 transition-colors"
                    @click="deleteDigit"
                >
                    <Icon name="mdi:backspace-outline" class="w-6 h-6" />
                </button>
                <div v-else-if="key === ''" class="h-14" />
                <button
                    v-else
                    class="h-14 rounded-xl bg-base-200 hover:bg-base-300 active:bg-base-300 transition-colors text-xl font-medium"
                    @click="appendDigit(key)"
                >
                    {{ key }}
                </button>
            </template>
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
