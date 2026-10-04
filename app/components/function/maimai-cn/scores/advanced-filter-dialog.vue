<script setup lang="ts">
import type { ChartEntry, FilterDifficulty, FilterFC, FilterFS, ScoreFilterState } from '~/composables/function/MaimaiCN/useMaimaiTypes'
import { DifficultyColors, DifficultyNames, FCType, FSType, MaimaiVersionAliasMap, MaimaiVersionOptions, SongType, useMaimaiUtils } from '~/composables/function/MaimaiCN/useMaimaiUtils'
import {
    activeFilterCount,
    cloneFilter,
    createEntryPredicate,
    DEFAULT_FILTER,
    GENRE_OPTIONS,
    LEVEL_PRESETS,
    LEVEL_RANGE_LIMIT,
    RATE_FILTER_OPTIONS,
} from '~/composables/function/MaimaiCN/useScoreView'
import BaseModal from '../shared/base-modal.vue'
import LevelRange from '../shared/level-range.vue'

const props = defineProps<{
    filter: ScoreFilterState
    entries: ChartEntry[]
    matchedSongIds: Set<number> | null
}>()

const emit = defineEmits<{
    (e: 'apply', value: ScoreFilterState): void
}>()

const open = defineModel<boolean>('open', { default: false })
const { getDifficultyTextClass } = useMaimaiUtils()
const draft = ref<ScoreFilterState>(cloneFilter(props.filter))

watch(open, (value) => {
    if (value)
        draft.value = cloneFilter(props.filter)
})

const previewCount = computed(() => {
    if (!open.value)
        return 0
    const predicate = createEntryPredicate(draft.value, props.matchedSongIds)
    return props.entries.reduce((count, entry) => count + (predicate(entry) ? 1 : 0), 0)
})
const draftCount = computed(() => activeFilterCount(draft.value))

function toggle<T>(list: T[], value: T): T[] {
    return list.includes(value) ? list.filter(item => item !== value) : [...list, value]
}

const difficultyOptions: FilterDifficulty[] = [0, 1, 2, 3, 4, -1]

function isSameRange(a: [number, number], b: [number, number]) {
    return Math.abs(a[0] - b[0]) < 1e-9 && Math.abs(a[1] - b[1]) < 1e-9
}

function togglePreset(range: [number, number]) {
    draft.value.levelRange = isSameRange(draft.value.levelRange, range) ? [...LEVEL_RANGE_LIMIT] : [...range]
}

const versionOptions = MaimaiVersionOptions.map(option => ({
    ...option,
    alias: MaimaiVersionAliasMap[option.value]?.join(' ') ?? '',
}))
const classicVersions = versionOptions.filter(option => option.value < 20000)
const dxVersions = versionOptions.filter(option => option.value >= 20000)

function allSelected(group: { value: number }[]) {
    return group.every(option => draft.value.versions.includes(option.value))
}

function toggleGroup(group: { value: number }[]) {
    const values = group.map(option => option.value)
    draft.value.versions = allSelected(group)
        ? draft.value.versions.filter(value => !values.includes(value))
        : [...new Set([...draft.value.versions, ...values])]
}

const typeOptions = [
    { value: SongType.DX, label: 'DX 谱面' },
    { value: SongType.STANDARD, label: '标准谱面' },
    { value: SongType.UTAGE, label: '宴会场' },
]

const fcOptions: { value: FilterFC, label: string }[] = [
    { value: FCType.APP, label: 'AP+' },
    { value: FCType.AP, label: 'AP' },
    { value: FCType.FCP, label: 'FC+' },
    { value: FCType.FC, label: 'FC' },
    { value: 'none', label: '无' },
]

const fsOptions: { value: FilterFS, label: string }[] = [
    { value: FSType.FSDP, label: 'FDX+' },
    { value: FSType.FSD, label: 'FDX' },
    { value: FSType.FSP, label: 'FS+' },
    { value: FSType.FS, label: 'FS' },
    { value: FSType.SYNC, label: 'SYNC' },
    { value: 'none', label: '无' },
]

const starOptions = [0, 1, 2, 3, 4, 5]

function reset() {
    draft.value = cloneFilter(DEFAULT_FILTER)
}

function apply() {
    emit('apply', cloneFilter(draft.value))
    open.value = false
}

const chipBase = 'chip'
const chipIdle = 'chip-idle'
const chipOn = {
    primary: 'chip-on',
    soft: 'border-primary/50 bg-primary/10 text-primary',
    secondary: 'border-secondary bg-secondary text-secondary-content',
    success: 'border-success bg-success text-success-content',
    info: 'border-info bg-info text-info-content',
    warning: 'border-warning bg-warning text-warning-content',
}
/** 每行左侧固定标签列，芯片换行时与芯片对齐 */
const rowClass = 'grid grid-cols-[3.5rem_1fr] items-start gap-2'
const rowLabelClass = 'pt-2 text-xs text-base-content/55'
</script>

<template>
    <BaseModal v-model:open="open" box-class="max-w-3xl">
        <template #header>
            <div class="flex items-center gap-2">
                <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon name="mdi:lightning-bolt-outline" class="h-5 w-5" />
                </span>
                <div>
                    <h3 class="text-base font-bold">
                        高级筛选与多维检索
                    </h3>
                    <span class="text-xs text-base-content/55">已选 {{ draftCount }} 项条件</span>
                </div>
            </div>
        </template>

        <div class="space-y-3 text-sm">
            <!-- 难度与定数 -->
            <section class="panel-muted space-y-3 p-3">
                <h4 class="text-xs font-bold">
                    难度等级与谱面定数
                </h4>
                <div class="flex flex-wrap gap-1.5">
                    <button
                        v-for="value in difficultyOptions"
                        :key="value"
                        :class="[chipBase, draft.difficulties.includes(value) ? getDifficultyTextClass(value) : chipIdle]"
                        :style="draft.difficulties.includes(value) ? { backgroundColor: DifficultyColors[value], borderColor: DifficultyColors[value] } : undefined"
                        :aria-pressed="draft.difficulties.includes(value)"
                        type="button"
                        @click="draft.difficulties = toggle(draft.difficulties, value)"
                    >
                        {{ DifficultyNames[value] }}
                    </button>
                </div>
                <div :class="rowClass">
                    <span :class="rowLabelClass">定数预设</span>
                    <div class="flex flex-wrap gap-1.5">
                        <button
                            v-for="preset in LEVEL_PRESETS"
                            :key="preset.label"
                            class="font-mono"
                            :class="[chipBase, isSameRange(draft.levelRange, preset.range) ? chipOn.primary : chipIdle]"
                            type="button"
                            @click="togglePreset(preset.range)"
                        >
                            {{ preset.label }}
                        </button>
                    </div>
                </div>
                <LevelRange v-model="draft.levelRange" />
            </section>

            <!-- 版本与分类 -->
            <section class="panel-muted space-y-3 p-3">
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <h4 class="text-xs font-bold">
                        所属版本
                    </h4>
                    <div class="flex flex-wrap gap-1">
                        <button class="btn btn-ghost btn-sm lg:btn-xs" type="button" @click="toggleGroup(classicVersions)">
                            {{ allSelected(classicVersions) ? '✓ 旧框已全选' : '旧框全选' }}
                        </button>
                        <button class="btn btn-ghost btn-sm lg:btn-xs" type="button" @click="toggleGroup(dxVersions)">
                            {{ allSelected(dxVersions) ? '✓ DX 已全选' : 'DX 全选' }}
                        </button>
                        <button class="btn btn-ghost btn-sm lg:btn-xs" type="button" @click="draft.versions = []">
                            取消全部
                        </button>
                    </div>
                </div>
                <div v-for="group in [classicVersions, dxVersions]" :key="group[0]?.value" class="flex flex-wrap gap-1.5">
                    <button
                        v-for="option in group"
                        :key="option.value"
                        :class="[chipBase, draft.versions.includes(option.value) ? chipOn.soft : chipIdle]"
                        :aria-pressed="draft.versions.includes(option.value)"
                        type="button"
                        @click="draft.versions = toggle(draft.versions, option.value)"
                    >
                        <span v-if="option.alias" class="opacity-60">{{ option.alias }}</span>
                        {{ option.label }}
                    </button>
                </div>

                <h4 class="pt-1 text-xs font-bold">
                    乐曲分类
                </h4>
                <div class="flex flex-wrap gap-1.5">
                    <button
                        v-for="genre in GENRE_OPTIONS"
                        :key="genre.value"
                        :class="[chipBase, draft.genres.includes(genre.value) ? chipOn.secondary : chipIdle]"
                        :aria-pressed="draft.genres.includes(genre.value)"
                        type="button"
                        @click="draft.genres = toggle(draft.genres, genre.value)"
                    >
                        {{ genre.label }}
                    </button>
                </div>
            </section>

            <!-- 成绩 -->
            <section class="panel-muted space-y-2.5 p-3">
                <h4 class="text-xs font-bold">
                    成绩评级、DX Score 与连击同步
                </h4>
                <div :class="rowClass">
                    <span :class="rowLabelClass">评级</span>
                    <div class="flex flex-wrap gap-1.5">
                        <button
                            v-for="option in RATE_FILTER_OPTIONS"
                            :key="option.value"
                            :class="[chipBase, draft.rates.includes(option.value) ? chipOn.primary : chipIdle]"
                            type="button"
                            @click="draft.rates = toggle(draft.rates, option.value)"
                        >
                            {{ option.label }}
                        </button>
                    </div>
                </div>
                <div :class="rowClass">
                    <span :class="rowLabelClass">DX 星级</span>
                    <div class="flex flex-wrap gap-1.5">
                        <button
                            v-for="star in starOptions"
                            :key="star"
                            :class="[chipBase, draft.dxStars.includes(star) ? chipOn.warning : chipIdle]"
                            type="button"
                            @click="draft.dxStars = toggle(draft.dxStars, star)"
                        >
                            {{ star }} 星
                        </button>
                    </div>
                </div>
                <div :class="rowClass">
                    <span :class="rowLabelClass">连击</span>
                    <div class="flex flex-wrap gap-1.5">
                        <button
                            v-for="option in fcOptions"
                            :key="String(option.value)"
                            :class="[chipBase, draft.fc.includes(option.value) ? chipOn.success : chipIdle]"
                            type="button"
                            @click="draft.fc = toggle(draft.fc, option.value)"
                        >
                            {{ option.label }}
                        </button>
                    </div>
                </div>
                <div :class="rowClass">
                    <span :class="rowLabelClass">同步</span>
                    <div class="flex flex-wrap gap-1.5">
                        <button
                            v-for="option in fsOptions"
                            :key="String(option.value)"
                            :class="[chipBase, draft.fs.includes(option.value) ? chipOn.info : chipIdle]"
                            type="button"
                            @click="draft.fs = toggle(draft.fs, option.value)"
                        >
                            {{ option.label }}
                        </button>
                    </div>
                </div>
            </section>

            <!-- 类型 -->
            <section class="panel-muted flex flex-wrap items-center gap-1.5 p-3">
                <span class="text-xs font-bold">谱面类型</span>
                <button
                    v-for="option in typeOptions"
                    :key="option.value"
                    :class="[chipBase, draft.types.includes(option.value) ? chipOn.primary : chipIdle]"
                    type="button"
                    @click="draft.types = toggle(draft.types, option.value)"
                >
                    {{ option.label }}
                </button>
            </section>
        </div>

        <template #footer>
            <button class="btn btn-primary order-first w-full sm:order-last sm:w-auto sm:btn-sm" type="button" @click="apply">
                应用筛选（{{ previewCount }} 条结果）
            </button>
            <label class="order-2 flex w-full cursor-pointer items-center justify-end gap-2 text-xs sm:order-none sm:w-auto sm:mr-auto">
                <input v-model="draft.showUnplayed" type="checkbox" class="checkbox checkbox-sm checkbox-primary">
                包含未游玩谱面
            </label>
            <button class="btn btn-ghost btn-sm mr-auto" type="button" @click="reset">
                <Icon name="mdi:restore" class="h-4 w-4" />
                重置所有条件
            </button>
        </template>
    </BaseModal>
</template>
