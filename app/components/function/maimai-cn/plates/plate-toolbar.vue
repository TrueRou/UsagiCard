<script setup lang="ts">
import type { PlateDef } from '~/composables/function/MaimaiCN/usePlateProgress'
import { DifficultyShortNames, useMaimaiUtils } from '~/composables/function/MaimaiCN/useMaimaiUtils'

/** 牌子页吸顶工具条：返回总览、切换牌子 / 种类、隐藏已完成、当前难度 */
const props = defineProps<{
    plate: PlateDef
    diff: number | null
}>()

const emit = defineEmits<{
    (e: 'back'): void
    (e: 'openPicker'): void
    (e: 'selectPlate', id: string): void
    (e: 'clearDiff'): void
}>()

const hideCompleted = defineModel<boolean>('hideCompleted', { default: false })

const { getDifficultyColor, getDifficultyTextClass } = useMaimaiUtils()

const kinds = computed(() => props.plate.version.kinds)
const diffLabel = computed(() => props.diff === null ? '' : DifficultyShortNames[props.diff])
const hideTitle = computed(() => {
    if (props.diff !== null)
        return `隐藏 ${diffLabel.value} 已达成的曲目`
    return '隐藏所有要求难度均已达成的曲目'
})
</script>

<template>
    <section class="sticky top-0 z-20 -mx-2 space-y-2 bg-base-100/85 px-2 py-2 backdrop-blur-md sm:-mx-3 sm:px-3 lg:-mx-4 lg:px-4">
        <div class="flex items-center gap-2">
            <button class="btn btn-ghost btn-square btn-sm" type="button" aria-label="返回牌子总览" title="牌子总览" @click="emit('back')">
                <Icon name="mdi:arrow-left" class="h-5 w-5" />
            </button>
            <button
                class="btn btn-sm min-w-0 flex-1 justify-between rounded-xl bg-base-200 sm:max-w-64"
                type="button"
                aria-haspopup="dialog"
                @click="emit('openPicker')"
            >
                <span class="truncate text-base font-black">{{ plate.label }}</span>
                <Icon name="mdi:swap-horizontal" class="h-4 w-4 shrink-0 opacity-60" />
            </button>
            <button
                class="chip shrink-0"
                :class="hideCompleted ? 'border-primary/50 bg-primary/10 text-primary' : 'chip-idle'"
                :aria-pressed="hideCompleted"
                :title="hideTitle"
                type="button"
                @click="hideCompleted = !hideCompleted"
            >
                <Icon :name="hideCompleted ? 'mdi:eye-off-outline' : 'mdi:eye-outline'" class="h-4 w-4" />
                隐藏已完成
            </button>
        </div>

        <div class="relative">
            <div class="scrollbar-none -mx-2 flex items-center gap-1.5 overflow-x-auto px-2 pr-8 lg:mx-0 lg:px-0" data-no-swipe>
                <button
                    v-if="diff !== null"
                    class="chip gap-1.5 border-transparent"
                    :class="getDifficultyTextClass(diff)"
                    :style="{ backgroundColor: getDifficultyColor(diff) }"
                    type="button"
                    aria-label="取消难度筛选，恢复全显示"
                    @click="emit('clearDiff')"
                >
                    仅 {{ diffLabel }}
                    <Icon name="mdi:close" class="h-3.5 w-3.5" />
                </button>
                <template v-if="kinds.length > 1">
                    <span v-if="diff !== null" class="mx-0.5 h-5 w-px shrink-0 bg-base-300" aria-hidden="true" />
                    <button
                        v-for="kind in kinds"
                        :key="kind"
                        class="chip min-w-10"
                        :class="plate.kind === kind ? 'chip-on' : 'chip-idle'"
                        :aria-pressed="plate.kind === kind"
                        type="button"
                        @click="emit('selectPlate', `${plate.version.key}${kind}`)"
                    >
                        {{ plate.version.key }}{{ kind }}
                    </button>
                </template>
            </div>
            <div class="pointer-events-none absolute inset-y-0 -right-2 w-8 bg-linear-to-l from-base-100/90 to-transparent lg:hidden" aria-hidden="true" />
        </div>
    </section>
</template>
