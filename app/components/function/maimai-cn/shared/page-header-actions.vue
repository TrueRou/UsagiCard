<script setup lang="ts">
import type { ArtifactUserResponse } from '~/types/api'

/** 成绩页在外壳页头右侧插入的操作：刷新、快捷操作（查分更新） */
const props = defineProps<{
    artifact: ArtifactUserResponse
    loading?: boolean
}>()

const emit = defineEmits<{
    (e: 'refresh'): void
    (e: 'updated'): void
}>()

const qButton = useQButton(toRef(props, 'artifact'))
const hasQuickActions = computed(() => Object.keys(qButton.quickActions.value ?? {}).length > 0)
</script>

<template>
    <ClientOnly>
        <Teleport to="#functions-header-slot">
            <button
                class="btn btn-ghost btn-square lg:btn-sm"
                type="button"
                title="刷新"
                aria-label="刷新数据"
                :disabled="loading"
                @click="emit('refresh')"
            >
                <Icon name="mdi:refresh" class="h-5 w-5" :class="loading ? 'animate-spin' : ''" />
            </button>
            <button
                v-if="hasQuickActions"
                class="btn btn-ghost btn-square lg:btn-sm"
                type="button"
                title="快捷操作"
                aria-label="打开快捷操作（查分更新）"
                @click="qButton.qDialogOpen(true)"
            >
                <Icon name="mdi:rocket-launch-outline" class="h-5 w-5" />
            </button>
        </Teleport>
        <DialogQButton :ctx="qButton" @on-maimai-update-complete="emit('updated')" />
    </ClientOnly>
</template>
