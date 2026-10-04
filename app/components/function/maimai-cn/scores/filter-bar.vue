<script setup lang="ts">
import type { FilterDifficulty, ScoreFilterState, ScoreSortState } from '~/composables/function/MaimaiCN/useMaimaiTypes'
import { DifficultyColors } from '~/composables/function/MaimaiCN/useMaimaiUtils'
import { activeFilterCount, cloneFilter, LEVEL_PRESETS, LEVEL_RANGE_LIMIT, SORT_FIELD_OPTIONS } from '~/composables/function/MaimaiCN/useScoreView'

const props = defineProps<{
    filter: ScoreFilterState
    sort: ScoreSortState
}>()

const emit = defineEmits<{
    (e: 'update:filter', value: ScoreFilterState): void
    (e: 'update:sort', value: ScoreSortState): void
    (e: 'openAdvanced'): void
    (e: 'openSort'): void
}>()

const keyword = defineModel<string>('keyword', { default: '' })

const difficultyChips: { label: string, value: FilterDifficulty | null }[] = [
    { label: '全部', value: null },
    { label: 'EXP', value: 2 },
    { label: 'MAS', value: 3 },
    { label: 'Re:MAS', value: 4 },
    { label: '宴', value: -1 },
]

const activeDifficulty = computed<FilterDifficulty | null | undefined>(() => {
    const list = props.filter.difficulties
    if (list.length === 0)
        return null
    return list.length === 1 ? list[0] : undefined
})

function setDifficulty(value: FilterDifficulty | null) {
    emit('update:filter', { ...cloneFilter(props.filter), difficulties: value === null ? [] : [value] })
}

function isSameRange(a: [number, number], b: [number, number]) {
    return Math.abs(a[0] - b[0]) < 1e-9 && Math.abs(a[1] - b[1]) < 1e-9
}

const levelLabel = computed(() => {
    const range = props.filter.levelRange
    if (isSameRange(range, LEVEL_RANGE_LIMIT))
        return '定数：全部'
    const preset = LEVEL_PRESETS.find(item => isSameRange(item.range, range))
    return preset ? `定数：${preset.label}` : `定数：${range[0].toFixed(1)}-${range[1].toFixed(1)}`
})

function setLevelRange(range: [number, number]) {
    emit('update:filter', { ...cloneFilter(props.filter), levelRange: [...range] })
    ;(document.activeElement as HTMLElement | null)?.blur()
}

const advancedCount = computed(() => activeFilterCount(props.filter))
const sortLabel = computed(() => SORT_FIELD_OPTIONS.find(option => option.value === props.sort.primary)?.label ?? '排序')

function toggleDirection() {
    emit('update:sort', { ...props.sort, primaryDir: props.sort.primaryDir === 'desc' ? 'asc' : 'desc' })
}
</script>

<template>
    <section class="sticky top-0 z-20 -mx-2 bg-base-100/90 px-2 py-2 backdrop-blur sm:-mx-3 sm:px-3">
        <div class="flex flex-col gap-2 rounded-lg border border-base-300 bg-base-100 p-2.5 shadow-xs lg:flex-row lg:items-center lg:justify-between">
            <div class="flex flex-wrap items-center gap-2">
                <label class="input input-sm w-full sm:w-60">
                    <Icon name="mdi:magnify" class="h-4 w-4 text-base-content/45" />
                    <input
                        v-model="keyword"
                        type="search"
                        class="grow"
                        placeholder="搜索曲名 / 别名 / 曲师 / 谱师 / ID"
                        aria-label="搜索谱面"
                    >
                    <button v-if="keyword" class="btn btn-ghost btn-xs btn-circle" type="button" aria-label="清空搜索" @click="keyword = ''">
                        <Icon name="mdi:close" class="h-3.5 w-3.5" />
                    </button>
                </label>

                <div class="flex flex-wrap gap-1" role="group" aria-label="难度">
                    <button
                        v-for="chip in difficultyChips"
                        :key="chip.label"
                        class="rounded border px-2 py-1 text-[11px] font-bold transition-colors"
                        :class="activeDifficulty === chip.value
                            ? (chip.value === null ? 'border-base-content bg-base-content text-base-100' : 'text-white')
                            : 'border-base-300 bg-base-200/60 text-base-content/70 hover:bg-base-200'"
                        :style="activeDifficulty === chip.value && chip.value !== null
                            ? { backgroundColor: DifficultyColors[chip.value], borderColor: DifficultyColors[chip.value] }
                            : undefined"
                        :aria-pressed="activeDifficulty === chip.value"
                        type="button"
                        @click="setDifficulty(chip.value)"
                    >
                        {{ chip.label }}
                    </button>
                </div>

                <div class="dropdown">
                    <div tabindex="0" role="button" class="btn btn-sm btn-ghost border border-base-300 font-mono text-xs">
                        {{ levelLabel }}
                        <Icon name="mdi:chevron-down" class="h-4 w-4" />
                    </div>
                    <ul tabindex="0" class="menu dropdown-content z-30 mt-1 w-44 rounded-box border border-base-300 bg-base-100 p-1 shadow-lg">
                        <li>
                            <button type="button" :class="levelLabel === '定数：全部' ? 'menu-active' : ''" @click="setLevelRange(LEVEL_RANGE_LIMIT)">
                                全部
                            </button>
                        </li>
                        <li v-for="preset in LEVEL_PRESETS" :key="preset.label">
                            <button
                                type="button"
                                class="justify-between font-mono"
                                :class="isSameRange(preset.range, filter.levelRange) ? 'menu-active' : ''"
                                @click="setLevelRange(preset.range)"
                            >
                                <span>{{ preset.label }}</span>
                                <span class="text-[10px] opacity-60">{{ preset.range[0].toFixed(1) }}–{{ preset.range[1].toFixed(1) }}</span>
                            </button>
                        </li>
                    </ul>
                </div>

                <button class="btn btn-sm btn-soft btn-primary" type="button" @click="emit('openAdvanced')">
                    <Icon name="mdi:lightning-bolt-outline" class="h-4 w-4" />
                    高级筛选
                    <span v-if="advancedCount" class="badge badge-primary badge-xs">{{ advancedCount }}</span>
                </button>
            </div>

            <div class="flex items-center gap-1.5">
                <button class="btn btn-sm btn-ghost border border-base-300 text-xs" type="button" @click="emit('openSort')">
                    <Icon name="mdi:sort" class="h-4 w-4" />
                    {{ sortLabel }}
                    <span v-if="sort.limit" class="badge badge-ghost badge-xs">前 {{ sort.limit }}</span>
                </button>
                <button
                    class="btn btn-sm btn-soft btn-primary text-xs"
                    type="button"
                    :aria-label="sort.primaryDir === 'desc' ? '当前降序，切换为升序' : '当前升序，切换为降序'"
                    @click="toggleDirection"
                >
                    <Icon :name="sort.primaryDir === 'desc' ? 'mdi:arrow-down' : 'mdi:arrow-up'" class="h-4 w-4" />
                    {{ sort.primaryDir === 'desc' ? '降序' : '升序' }}
                </button>
            </div>
        </div>
    </section>
</template>
