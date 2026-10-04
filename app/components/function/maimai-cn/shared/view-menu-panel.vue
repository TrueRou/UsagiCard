<script setup lang="ts">
import type { ViewSyncState } from '~/composables/function/MaimaiCN/useScoreDisplay'
import type { MaimaiTileContent, MaimaiViewMode } from '~/types/api'
import { TILE_CONTENT_OPTIONS, VIEW_MODE_OPTIONS } from '~/composables/function/MaimaiCN/useScoreDisplay'

const props = defineProps<{
    syncState: ViewSyncState
}>()

const emit = defineEmits<{
    (e: 'saveToCard'): void
}>()

const mode = defineModel<MaimaiViewMode>('mode', { required: true })
const tileContent = defineModel<MaimaiTileContent>('tileContent', { required: true })

/** 选择平铺显示内容时顺带切换到平铺，省去一次点击 */
function pickContent(value: MaimaiTileContent) {
    tileContent.value = value
    mode.value = 'tile'
}

const syncInfo = computed(() => {
    switch (props.syncState) {
        case 'syncing':
            return { icon: '', text: '正在同步到卡片…', class: 'text-base-content/60' }
        case 'locked':
            return { icon: 'mdi:lock-outline', text: '卡片已加密，目前只保存在本机', class: 'text-warning' }
        case 'error':
            return { icon: 'mdi:cloud-alert-outline', text: '同步失败，目前只保存在本机', class: 'text-error' }
        default:
            return { icon: 'mdi:cloud-check-outline', text: '已同步到卡片', class: 'text-success' }
    }
})
</script>

<template>
    <div class="space-y-4">
        <section>
            <h4 class="mb-2 text-xs font-semibold text-base-content/60">
                布局
            </h4>
            <div class="grid grid-cols-2 gap-2" role="radiogroup" aria-label="布局">
                <button
                    v-for="option in VIEW_MODE_OPTIONS"
                    :key="option.value"
                    class="flex flex-col items-center gap-1 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors active:scale-95"
                    :class="mode === option.value ? 'border-primary bg-primary/10 text-primary' : 'border-base-300 text-base-content/70 hover:bg-base-200'"
                    role="radio"
                    :aria-checked="mode === option.value"
                    type="button"
                    @click="mode = option.value"
                >
                    <Icon :name="option.icon" class="h-6 w-6" />
                    {{ option.label }}
                </button>
            </div>
        </section>

        <section>
            <h4 class="mb-2 flex items-baseline justify-between gap-2 text-xs font-semibold text-base-content/60">
                平铺显示
                <span class="font-normal text-base-content/45">选择后自动切换到平铺</span>
            </h4>
            <div class="grid grid-cols-4 gap-1.5">
                <button
                    v-for="option in TILE_CONTENT_OPTIONS"
                    :key="option.value"
                    class="chip w-full px-1"
                    :class="mode === 'tile' && tileContent === option.value ? 'chip-on' : 'chip-idle'"
                    :aria-pressed="mode === 'tile' && tileContent === option.value"
                    type="button"
                    @click="pickContent(option.value)"
                >
                    {{ option.label }}
                </button>
            </div>
        </section>

        <footer class="flex items-center justify-between gap-2 border-t border-base-200 pt-3 text-xs" role="status">
            <span class="flex min-w-0 items-center gap-1.5" :class="syncInfo.class">
                <span v-if="syncState === 'syncing'" class="loading loading-spinner loading-xs" />
                <Icon v-else :name="syncInfo.icon" class="h-4 w-4 shrink-0" />
                <span class="truncate">{{ syncInfo.text }}</span>
            </span>
            <button
                v-if="syncState === 'locked' || syncState === 'error'"
                class="btn btn-primary btn-sm shrink-0"
                type="button"
                @click="emit('saveToCard')"
            >
                <Icon name="mdi:content-save-outline" class="h-4 w-4" />
                保存到卡片
            </button>
        </footer>
    </div>
</template>
