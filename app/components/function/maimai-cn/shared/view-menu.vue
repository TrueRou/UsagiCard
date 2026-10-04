<script setup lang="ts">
import type { ViewSyncState } from '~/composables/function/MaimaiCN/useScoreDisplay'
import type { MaimaiTileContent, MaimaiViewMode } from '~/types/api'
import { VIEW_MODE_OPTIONS } from '~/composables/function/MaimaiCN/useScoreDisplay'
import BaseModal from './base-modal.vue'
import ViewMenuPanel from './view-menu-panel.vue'

/**
 * 视图设置入口：桌面端为下拉面板，移动端为底部弹层。
 * 两种容器用 CSS 断点切换，避免服务端渲染与客户端媒体查询结果不一致。
 */
const props = withDefaults(defineProps<{
    syncState: ViewSyncState
    showLabel?: boolean
    /** 不传时跟随当前布局显示对应图标 */
    triggerIcon?: string
}>(), {
    showLabel: true,
    triggerIcon: undefined,
})

const emit = defineEmits<{
    (e: 'saveToCard'): void
}>()

const mode = defineModel<MaimaiViewMode>('mode', { required: true })
const tileContent = defineModel<MaimaiTileContent>('tileContent', { required: true })

const sheetOpen = ref(false)
const icon = computed(() => props.triggerIcon ?? VIEW_MODE_OPTIONS.find(option => option.value === mode.value)?.icon ?? 'mdi:view-grid-outline')
const needsAttention = computed(() => props.syncState === 'locked' || props.syncState === 'error')
</script>

<template>
    <div class="shrink-0">
        <div class="dropdown dropdown-end hidden lg:inline-block">
            <div tabindex="0" role="button" class="chip chip-idle relative" aria-label="视图设置" title="视图设置">
                <Icon :name="icon" class="h-4 w-4" />
                <span v-if="showLabel">视图</span>
                <span v-if="needsAttention" class="status status-warning absolute -right-0.5 -top-0.5" aria-hidden="true" />
            </div>
            <div tabindex="0" class="dropdown-content z-30 mt-1.5 w-80 rounded-xl border border-base-300 bg-base-100 p-3 shadow-xl">
                <ViewMenuPanel
                    v-model:mode="mode"
                    v-model:tile-content="tileContent"
                    :sync-state="syncState"
                    @save-to-card="emit('saveToCard')"
                />
            </div>
        </div>

        <button type="button" class="chip chip-idle relative lg:hidden" aria-label="视图设置" @click="sheetOpen = true">
            <Icon :name="icon" class="h-4 w-4" />
            <span v-if="showLabel">视图</span>
            <span v-if="needsAttention" class="status status-warning absolute -right-0.5 -top-0.5" aria-hidden="true" />
        </button>
        <BaseModal v-model:open="sheetOpen" title="视图设置" box-class="max-w-md">
            <ViewMenuPanel
                v-model:mode="mode"
                v-model:tile-content="tileContent"
                :sync-state="syncState"
                @save-to-card="emit('saveToCard')"
            />
        </BaseModal>
    </div>
</template>
