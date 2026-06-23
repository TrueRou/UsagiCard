<script setup lang="ts">
const props = defineProps<{
    artifactId: string
}>()

const { storageOf } = await useArtifact(props.artifactId)
const { copy, copied } = useClipboard()

const aquaStorage = storageOf('MaimaiAqua')
const accessCode = computed(() => aquaStorage.value.access_code ?? '')
</script>

<template>
    <div class="space-y-4">
        <div class="space-y-1">
            <p class="text-sm font-medium text-base-content/60">
                Amusement IC 访问代码
            </p>
            <template v-if="accessCode">
                <button
                    class="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-base-200 hover:bg-base-300 active:scale-95 transition-all font-mono text-sm text-base-content text-left"
                    :title="copied ? '已复制' : '点击复制卡号'"
                    type="button"
                    @click="copy(accessCode)"
                >
                    <span class="flex-1 truncate">{{ accessCode }}</span>
                    <svg v-if="!copied" class="w-3.5 h-3.5 shrink-0 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <svg v-else class="w-3.5 h-3.5 shrink-0 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <polyline points="20 6 9 17 4 12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </button>
            </template>
            <p v-else class="text-sm text-base-content/40 px-3 py-2">
                暂无卡号
            </p>
        </div>
    </div>
</template>
