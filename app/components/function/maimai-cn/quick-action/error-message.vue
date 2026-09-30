<script setup lang="ts">
const props = defineProps<{
    message: string
}>()

const MAX_PREVIEW_LENGTH = 120

const detailOpen = ref(false)

/**
 * 将后端返回的转义字符串还原为可读文本：
 * - `\\n` → 换行
 * - `\\'` → `'`
 * - `\\"` → `"`
 * - `\\\\` → `\\`
 */
function unescapeError(raw: string): string {
    return raw
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\'/g, '\'')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\')
}

const normalized = computed(() => unescapeError(props.message ?? ''))

/** 单行化用于预览：把换行折叠成空格，并压缩连续空白 */
const previewText = computed(() => normalized.value.replace(/\s+/g, ' ').trim())

const isTruncated = computed(() => previewText.value.length > MAX_PREVIEW_LENGTH)

const preview = computed(() =>
    isTruncated.value
        ? `${previewText.value.slice(0, MAX_PREVIEW_LENGTH).trimEnd()}…`
        : previewText.value,
)

function openDetail() {
    detailOpen.value = true
}

function closeDetail() {
    detailOpen.value = false
}
</script>

<template>
    <div class="flex items-start gap-1.5 text-xs text-error">
        <p class="flex-1 break-words leading-snug">
            {{ preview }}
        </p>
        <button
            v-if="isTruncated"
            type="button"
            class="shrink-0 rounded border border-error/40 bg-error/10 px-1.5 py-0.5 text-[10px] font-medium leading-none transition-colors hover:border-error hover:bg-error/20"
            title="查看完整错误信息"
            @click="openDetail"
        >
            ...
        </button>

        <Teleport to="body">
            <div
                v-if="detailOpen"
                class="fixed inset-0 z-1000 flex items-center justify-center bg-black/55 p-4"
                @click.self="closeDetail"
            >
                <div class="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden border border-base-300 bg-base-100 rounded-lg">
                    <div class="flex items-center justify-between gap-3 border-b border-base-300/70 px-4 py-3">
                        <h3 class="text-base font-semibold text-base-content">
                            错误详情
                        </h3>
                        <button
                            type="button"
                            class="btn btn-ghost btn-sm btn-circle"
                            aria-label="关闭错误详情"
                            @click="closeDetail"
                        >
                            <Icon name="mdi:close" class="w-5 h-5" />
                        </button>
                    </div>
                    <div class="overflow-auto p-4">
                        <pre class="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-error">{{ normalized }}</pre>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>
