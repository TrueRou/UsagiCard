<script setup lang="ts">
import type { PlateCompletionMode, PlateCount, PlateGroup, PlateOverviewItem } from '~/composables/function/MaimaiCN/usePlateProgress'
import { COMPLETION_MODES, percent, PLATE_VERSIONS, songCountFor } from '~/composables/function/MaimaiCN/usePlateProgress'

/** 牌子总览：版本 × 种类的完成度矩阵 */
const props = defineProps<{
    overview: Map<string, PlateOverviewItem>
    loading?: boolean
    /** 上次打开的牌子，返回总览时高亮并滚动到可见 */
    recent?: string | null
}>()

const emit = defineEmits<{
    (e: 'select', id: string): void
}>()

const mode = defineModel<PlateCompletionMode>('mode', { default: 'all' })

function countOf(item: PlateOverviewItem): PlateCount {
    return songCountFor(item, mode.value)
}

const COLUMNS = ['极', '将', '神', '舞舞'] as const
const GROUPS: { key: PlateGroup, label: string }[] = [
    { key: 'dx', label: 'DX' },
    { key: 'old', label: '旧框' },
    { key: 'all', label: '全曲' },
]

const rows = computed(() => GROUPS.map(group => ({
    ...group,
    versions: PLATE_VERSIONS.filter(version => version.group === group.key && version.kinds.some(kind => kind !== '者'))
        .slice()
        .reverse(),
})))

const conqueror = computed(() => props.overview.get('霸者'))

const totals = computed(() => {
    let done = 0
    let total = 0
    for (const item of props.overview.values()) {
        total++
        if (isDone(item))
            done++
    }
    return { done, total }
})

function cellOf(versionKey: string, kind: string) {
    return props.overview.get(`${versionKey}${kind}`)
}

function isDone(item: PlateOverviewItem | undefined) {
    if (!item)
        return false
    const count = countOf(item)
    return count.total > 0 && count.done === count.total
}

function pctText(item: PlateOverviewItem) {
    const value = percent(countOf(item))
    return value >= 100 ? '100' : value.toFixed(value >= 10 ? 0 : 1)
}

const root = ref<HTMLElement | null>(null)
onMounted(() => {
    if (!props.recent)
        return
    nextTick(() => root.value?.querySelector(`[data-plate="${CSS.escape(props.recent!)}"]`)?.scrollIntoView({ block: 'center' }))
})
</script>

<template>
    <div ref="root" class="space-y-3">
        <section class="panel flex items-center justify-between gap-3 px-3 py-2.5">
            <div class="min-w-0 space-y-1.5">
                <div class="text-[11px] text-base-content/55">
                    牌子总览 · 完成度口径
                </div>
                <div class="join" role="radiogroup" aria-label="完成度口径">
                    <button
                        v-for="option in COMPLETION_MODES"
                        :key="option.value"
                        class="btn join-item btn-sm"
                        :class="mode === option.value ? 'btn-primary' : 'btn-ghost bg-base-200'"
                        role="radio"
                        :aria-checked="mode === option.value"
                        :title="option.description"
                        type="button"
                        @click="mode = option.value"
                    >
                        {{ option.label }}
                    </button>
                </div>
            </div>
            <div class="text-right">
                <div class="font-mono text-lg font-bold tabular-nums">
                    {{ loading ? '…' : totals.done }}<span class="text-sm text-base-content/45">/{{ totals.total }}</span>
                </div>
                <div class="text-[11px] text-base-content/55">
                    已完成牌子
                </div>
            </div>
        </section>

        <section v-for="group in rows" :key="group.key" class="panel overflow-hidden">
            <header class="grid grid-cols-[2.75rem_repeat(4,minmax(0,1fr))] gap-1 border-b border-base-200 bg-base-200/40 px-2 py-1.5 text-center text-[11px] font-semibold text-base-content/55">
                <span class="text-left">{{ group.label }}</span>
                <span v-for="kind in COLUMNS" :key="kind">{{ kind }}</span>
            </header>
            <div class="divide-y divide-base-200">
                <div
                    v-for="version in group.versions"
                    :key="version.key"
                    class="grid grid-cols-[2.75rem_repeat(4,minmax(0,1fr))] items-center gap-1 px-2 py-1"
                >
                    <span class="truncate text-sm font-bold" :title="version.label">{{ version.label }}</span>
                    <template v-for="kind in COLUMNS" :key="kind">
                        <button
                            v-if="cellOf(version.key, kind)"
                            :data-plate="`${version.key}${kind}`"
                            type="button"
                            class="flex min-h-11 flex-col justify-center gap-1 rounded-lg px-1.5 py-1 text-left transition-[background-color,transform] active:scale-95"
                            :class="[
                                isDone(cellOf(version.key, kind)) ? 'bg-success/15 text-success' : 'hover:bg-base-200',
                                recent === `${version.key}${kind}` ? 'ring-2 ring-primary/60' : '',
                            ]"
                            :aria-label="`${version.label}${kind}`"
                            @click="emit('select', `${version.key}${kind}`)"
                        >
                            <template v-if="loading">
                                <span class="skeleton h-3 w-10" />
                                <span class="skeleton h-1 w-full" />
                            </template>
                            <template v-else>
                                <span class="flex items-baseline justify-between gap-1">
                                    <span class="font-mono text-xs font-bold tabular-nums sm:text-sm">
                                        <Icon v-if="isDone(cellOf(version.key, kind))" name="mdi:check-decagram" class="-mt-0.5 h-3.5 w-3.5" />
                                        <template v-else>{{ pctText(cellOf(version.key, kind)!) }}%</template>
                                    </span>
                                    <span class="hidden font-mono text-[10px] text-base-content/45 tabular-nums sm:inline">
                                        {{ countOf(cellOf(version.key, kind)!).done }}/{{ countOf(cellOf(version.key, kind)!).total }}
                                    </span>
                                </span>
                                <span class="h-1 overflow-hidden rounded-full bg-base-300">
                                    <span
                                        class="block h-full rounded-full"
                                        :class="isDone(cellOf(version.key, kind)) ? 'bg-success' : 'bg-primary'"
                                        :style="{ width: `${percent(countOf(cellOf(version.key, kind)!))}%` }"
                                    />
                                </span>
                            </template>
                        </button>
                        <span v-else class="text-center text-xs text-base-content/25" aria-hidden="true">—</span>
                    </template>
                </div>
                <div v-if="group.key === 'all' && conqueror" class="grid grid-cols-[2.75rem_1fr] items-center gap-1 px-2 py-1">
                    <span class="text-sm font-bold">霸者</span>
                    <button
                        data-plate="霸者"
                        type="button"
                        class="flex min-h-11 items-center gap-3 rounded-lg px-2 py-1 transition-[background-color,transform] active:scale-95"
                        :class="[isDone(conqueror) ? 'bg-success/15 text-success' : 'hover:bg-base-200', recent === '霸者' ? 'ring-2 ring-primary/60' : '']"
                        aria-label="霸者"
                        @click="emit('select', '霸者')"
                    >
                        <span class="h-1.5 flex-1 overflow-hidden rounded-full bg-base-300">
                            <span class="block h-full rounded-full" :class="isDone(conqueror) ? 'bg-success' : 'bg-primary'" :style="{ width: `${percent(countOf(conqueror))}%` }" />
                        </span>
                        <span class="font-mono text-xs font-bold tabular-nums">
                            {{ loading ? '…' : `${countOf(conqueror).done}/${countOf(conqueror).total}` }}
                        </span>
                    </button>
                </div>
            </div>
        </section>
        <p class="px-1 text-[11px] leading-relaxed text-base-content/45">
            「全部难度」需要一首歌的所有要求难度都达成；「仅 MASTER」只判断 MASTER、Re:MASTER。已删除曲目不计入。
        </p>
    </div>
</template>
