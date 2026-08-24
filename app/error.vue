<script setup lang="ts">
const props = defineProps<{
    error: {
        statusCode?: number
        statusMessage?: string
        message?: string
        stack?: string
        data?: Record<string, any>
    }
}>()

const title = computed(() => {
    return props.error.statusMessage || '页面发生错误'
})

const description = computed(() => {
    return props.error.message || props.error.statusMessage || '很抱歉，页面暂时不可用。'
})

const isDev = import.meta.dev

const stackText = computed(() => {
    if (!isDev || !props.error.stack)
        return ''
    return String(props.error.stack).trim()
})

const dataText = computed(() => {
    if (!isDev || !props.error.data)
        return ''
    try {
        return JSON.stringify(props.error.data, null, 2)
    }
    catch {
        return String(props.error.data)
    }
})
</script>

<template>
    <main class="min-h-screen bg-linear-to-b from-base-200 to-base-100 px-6 py-12">
        <section class="mx-auto max-w-3xl space-y-6">
            <p class="text-sm uppercase tracking-widest text-base-content/60">
                Error {{ error.statusCode || 500 }}
            </p>

            <h1 class="text-3xl font-bold text-base-content md:text-4xl">
                {{ title }}
            </h1>

            <p class="text-base text-base-content/80 md:text-lg">
                {{ description }}
            </p>

            <div
                v-if="stackText || dataText"
                class="rounded-box border border-base-300 bg-base-100"
            >
                <div class="space-y-4 p-4">
                    <div v-if="stackText">
                        <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-base-content/60">
                            Stack Trace
                        </p>
                        <pre class="max-h-80 overflow-auto rounded bg-base-200 p-3 text-xs text-base-content/80">{{ stackText }}</pre>
                    </div>

                    <div v-if="dataText">
                        <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-base-content/60">
                            Error Data
                        </p>
                        <pre class="max-h-72 overflow-auto rounded bg-base-200 p-3 text-xs text-base-content/80">{{ dataText }}</pre>
                    </div>
                </div>
            </div>
        </section>
    </main>
</template>
