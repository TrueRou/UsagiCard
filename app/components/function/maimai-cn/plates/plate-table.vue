<script setup lang="ts">
import type { ChartEntry } from '~/composables/function/MaimaiCN/useMaimaiTypes'
import type { PlateKind, PlateTableGroup } from '~/composables/function/MaimaiCN/usePlateProgress'
import PlateCell from './plate-cell.vue'

/** 完成表：按等级分组的封面墙（参考 yuzu 完成表） */
defineProps<{
    groups: PlateTableGroup[]
    kind: PlateKind
    /** 是否筛选了单一难度 */
    filtered: boolean
}>()

const emit = defineEmits<{
    (e: 'select', entry: ChartEntry): void
}>()
</script>

<template>
    <div class="space-y-2">
        <section
            v-for="group in groups"
            :key="group.label"
            class="panel grid grid-cols-[2.5rem_1fr] gap-2 p-2 [contain-intrinsic-size:auto_12rem] [content-visibility:auto] sm:grid-cols-[3.5rem_1fr] sm:p-3"
        >
            <header class="flex flex-col items-center gap-0.5 pt-1">
                <span class="text-lg leading-none font-black text-sky-400 [text-shadow:0_0_1px_white] sm:text-2xl">{{ group.label }}</span>
                <span class="font-mono text-[10px] text-base-content/50 tabular-nums">{{ group.count.done }}/{{ group.count.total }}</span>
            </header>
            <div class="grid grid-cols-5 gap-1 sm:grid-cols-7 sm:gap-1.5 md:grid-cols-9 lg:grid-cols-11 xl:grid-cols-13 2xl:grid-cols-16">
                <PlateCell
                    v-for="item in group.items"
                    :key="item.song.song.id"
                    :item="item"
                    :kind="kind"
                    :filtered="filtered"
                    @select="emit('select', $event)"
                />
            </div>
        </section>
    </div>
</template>
