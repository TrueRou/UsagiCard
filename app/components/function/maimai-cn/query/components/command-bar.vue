<script setup lang="ts">
import type { QueryHint, QueryScoreFilter, ScoreFilterKey } from '~/composables/function/MaimaiCN/useMaimaiTypes'
import { MaimaiVersionAliasOptions, MaimaiVersionOptions } from '~/composables/function/MaimaiCN/useMaimaiUtils'

const props = defineProps<{
    modelValue?: string
    hint?: QueryHint
    previewCount?: number
    scoreFilter?: QueryScoreFilter | null
}>()

const emit = defineEmits<{
    (e: 'execute', command: string): void
    (e: 'update:modelValue', value: string): void
    (e: 'applyScoreFilter', payload: { key: ScoreFilterKey, value: string }): void
    (e: 'resetScoreFilter'): void
}>()

const RANGE_MIN = 12
const RANGE_MAX = 15

const isFocused = ref(false)

const examples = [
    { label: '最佳成绩', value: 'b50', hint: 'b50 pc50 fc50 ap50' },
    { label: '完成表', value: '桃将' },
    { label: '分数列表', value: '13+ 桃 fc' },
    { label: '单曲查询', value: '牛奶' },
]

const levelOptions = ['15', '14+', '14', '13+', '13', '12+']
const fcOptions = [
    { label: 'FC', value: 'fc' },
    { label: 'FC+', value: 'fc+' },
    { label: 'AP', value: 'ap' },
    { label: 'AP+', value: 'ap+' },
]
const fsOptions = [
    { label: 'SYNC', value: 'sync' },
    { label: 'FS', value: 'fs' },
    { label: 'FS+', value: 'fs+' },
    { label: 'FSD', value: 'fsd' },
    { label: 'FSD+', value: 'fsd+' },
]
const rateOptions = [
    { label: 'SSS+', value: 'sss+', rate: 0 },
    { label: 'SSS', value: 'sss', rate: 1 },
    { label: 'SS+', value: 'ss+', rate: 2 },
    { label: 'SS', value: 'ss', rate: 3 },
    { label: 'S+', value: 's+', rate: 4 },
    { label: 'S', value: 's', rate: 5 },
    { label: 'AAA', value: 'aaa', rate: 6 },
]

const versionOptions = MaimaiVersionOptions.map((option) => {
    const alias = MaimaiVersionAliasOptions.find(item => item.value === option.value)?.token || ''
    return {
        ...option,
        alias,
        label: alias ? `${alias} · ${option.label}` : option.label,
    }
})

const input = computed({
    get: () => props.modelValue || '',
    set: value => emit('update:modelValue', value),
})

const levelValueMin = computed(() => props.scoreFilter?.levelValueMin ?? RANGE_MIN)
const levelValueMax = computed(() => props.scoreFilter?.levelValueMax ?? RANGE_MAX)
const levelRangeTrackStyle = computed(() => {
    const start = ((levelValueMin.value - RANGE_MIN) / (RANGE_MAX - RANGE_MIN)) * 100
    const end = ((levelValueMax.value - RANGE_MIN) / (RANGE_MAX - RANGE_MIN)) * 100
    return {
        left: `${start}%`,
        width: `${Math.max(end - start, 0)}%`,
    }
})

const currentHintText = computed(() => {
    switch (props.hint) {
        case 'b50':
            return 'B50'
        case 'plate':
            return '牌子进度'
        case 'score-filter':
            return '成绩筛选'
        case 'score-top':
            return '特殊B50'
        case 'song':
            return props.previewCount ? `单曲候选 ${props.previewCount}` : '单曲查询'
        default:
            return '输入即查询'
    }
})

function clickExample(command: string) {
    emit('update:modelValue', command)
}

function clearInput() {
    emit('update:modelValue', '')
}

function applyScoreFilter(key: ScoreFilterKey, value: string) {
    emit('applyScoreFilter', { key, value })
}

function isFCActive(value: string) {
    return (props.scoreFilter?.fc === 3 && value === 'fc')
        || (props.scoreFilter?.fc === 2 && value === 'fc+')
        || (props.scoreFilter?.fc === 1 && value === 'ap')
        || (props.scoreFilter?.fc === 0 && value === 'ap+')
}

function isFSActive(value: string) {
    return (props.scoreFilter?.fs === 0 && value === 'sync')
        || (props.scoreFilter?.fs === 1 && value === 'fs')
        || (props.scoreFilter?.fs === 2 && value === 'fs+')
        || (props.scoreFilter?.fs === 3 && value === 'fsd')
        || (props.scoreFilter?.fs === 4 && value === 'fsd+')
}

function updateLevelRange(boundary: 'levelValueMin' | 'levelValueMax', event: Event) {
    const rawValue = Number((event.target as HTMLInputElement).value)
    const nextMin = boundary === 'levelValueMin'
        ? Math.min(rawValue, levelValueMax.value)
        : levelValueMin.value
    const nextMax = boundary === 'levelValueMax'
        ? Math.max(rawValue, levelValueMin.value)
        : levelValueMax.value

    applyScoreFilter('levelValueMin', nextMin <= RANGE_MIN ? '' : nextMin.toFixed(1))
    applyScoreFilter('levelValueMax', nextMax >= RANGE_MAX ? '' : nextMax.toFixed(1))
}
</script>

<template>
    <section class="space-y-3">
        <div class="border border-base-300/70 bg-base-100 transition-all duration-200" :class="isFocused ? 'border-primary/35' : ''">
            <label class="flex items-center gap-3 px-3 py-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-base-content/45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    v-model="input"
                    type="text"
                    class="grow bg-transparent outline-none"
                    placeholder="输入命令或筛选条件"
                    @focus="isFocused = true"
                    @blur="isFocused = false"
                >
                <div class="text-xs text-base-content/45">
                    {{ currentHintText }}
                </div>
                <button v-if="input" class="btn btn-ghost btn-sm btn-circle" type="button" aria-label="清空查询" @click="clearInput">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </label>
        </div>

        <details class="group border border-base-300/70 bg-base-100/80">
            <summary class="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-3 marker:hidden transition-colors duration-200 hover:bg-base-200/45">
                <div>
                    <div class="text-sm font-medium text-base-content">
                        常用命令与筛选器
                    </div>
                    <div class="mt-0.5 text-xs text-base-content/55">
                        点击展开查看示例与完整筛选器
                    </div>
                </div>
                <div class="flex items-center gap-2 text-xs text-base-content/55">
                    <span>点击展开</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform duration-200 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </summary>
            <div class="space-y-5 border-t border-base-300/70 px-3 py-3">
                <div>
                    <p class="mb-3 text-xs text-base-content/50">
                        常用查询
                    </p>
                    <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <button
                            v-for="example in examples" :key="example.value"
                            class="border border-base-300 bg-base-100 px-3 py-2 text-left text-sm transition-colors duration-200 hover:border-primary/30 hover:bg-base-50"
                            type="button"
                            @click="clickExample(example.value)"
                        >
                            <div class="font-medium text-base-content">
                                {{ example.label }}
                            </div>
                            <div class="text-xs text-base-content/55">
                                {{ example.hint || example.value }}
                            </div>
                        </button>
                    </div>
                </div>

                <div class="space-y-4 border-t border-base-300/70 pt-4">
                    <div class="flex items-center justify-between gap-3">
                        <div>
                            <div class="text-sm font-medium text-base-content">
                                成绩筛选器
                            </div>
                            <div class="mt-0.5 text-xs text-base-content/55">
                                所有筛选项都会同步到搜索框
                            </div>
                        </div>
                        <button class="btn btn-ghost" type="button" @click="emit('resetScoreFilter')">
                            重置
                        </button>
                    </div>

                    <div class="space-y-2">
                        <div class="text-xs text-base-content/50">
                            等级
                        </div>
                        <div class="grid grid-cols-3 gap-2 sm:grid-cols-6">
                            <button
                                v-for="level in levelOptions" :key="level"
                                class="border px-2 py-1.5 text-sm"
                                :class="scoreFilter?.level === level ? 'border-primary bg-primary/8 text-primary' : 'border-base-300 bg-base-100 text-base-content'"
                                type="button"
                                @click="applyScoreFilter('level', scoreFilter?.level === level ? '' : level)"
                            >
                                {{ level }}
                            </button>
                        </div>
                    </div>

                    <div class="space-y-3">
                        <div class="flex items-center justify-between gap-3">
                            <div class="text-xs text-base-content/50">
                                定数区间
                            </div>
                            <div class="text-xs text-base-content/60">
                                {{ levelValueMin.toFixed(1) }} - {{ levelValueMax.toFixed(1) }}
                            </div>
                        </div>
                        <div class="rounded border border-base-300/70 bg-base-50 px-3 py-4">
                            <div class="relative h-8">
                                <div class="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-base-300/80" />
                                <div class="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary" :style="levelRangeTrackStyle" />
                                <div
                                    class="absolute top-1/2 z-30 flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-base-100 bg-primary shadow-sm pointer-events-none"
                                    :style="{ left: `${((levelValueMin - RANGE_MIN) / (RANGE_MAX - RANGE_MIN)) * 100}%` }"
                                >
                                    <div class="h-1.5 w-1.5 rounded-full bg-base-100" />
                                </div>
                                <div
                                    class="absolute top-1/2 z-30 flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-base-100 bg-primary shadow-sm pointer-events-none"
                                    :style="{ left: `${((levelValueMax - RANGE_MIN) / (RANGE_MAX - RANGE_MIN)) * 100}%` }"
                                >
                                    <div class="h-1.5 w-1.5 rounded-full bg-base-100" />
                                </div>
                                <input
                                    class="range-thumb pointer-events-none absolute left-0 top-1/2 z-40 h-8 w-full -translate-y-1/2 appearance-none bg-transparent"
                                    type="range"
                                    min="12"
                                    max="15"
                                    step="0.1"
                                    :value="levelValueMin"
                                    @input="updateLevelRange('levelValueMin', $event)"
                                >
                                <input
                                    class="range-thumb pointer-events-none absolute left-0 top-1/2 z-40 h-8 w-full -translate-y-1/2 appearance-none bg-transparent"
                                    type="range"
                                    min="12"
                                    max="15"
                                    step="0.1"
                                    :value="levelValueMax"
                                    @input="updateLevelRange('levelValueMax', $event)"
                                >
                            </div>
                            <div class="mt-2 flex justify-between text-[11px] text-base-content/50">
                                <span>12.0</span>
                                <span>13.0</span>
                                <span>14.0</span>
                                <span>15.0</span>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-2">
                        <div class="text-xs text-base-content/50">
                            版本
                        </div>
                        <select
                            class="select select-bordered w-full bg-base-100"
                            :value="scoreFilter?.version ?? ''"
                            @change="applyScoreFilter('version', String(($event.target as HTMLSelectElement).value))"
                        >
                            <option value="">
                                全部版本
                            </option>
                            <option v-for="option in versionOptions" :key="option.value" :value="option.value">
                                {{ option.label }}
                            </option>
                        </select>
                    </div>

                    <div class="space-y-2">
                        <div class="text-xs text-base-content/50">
                            连击
                        </div>
                        <div class="grid grid-cols-4 gap-2">
                            <button
                                v-for="option in fcOptions" :key="option.value"
                                class="border px-2 py-1.5 text-sm"
                                :class="isFCActive(option.value) ? 'border-primary bg-primary/8 text-primary' : 'border-base-300 bg-base-100 text-base-content'"
                                type="button"
                                @click="applyScoreFilter('fc', isFCActive(option.value) ? '' : option.value)"
                            >
                                {{ option.label }}
                            </button>
                        </div>
                    </div>

                    <div class="space-y-2">
                        <div class="text-xs text-base-content/50">
                            同步
                        </div>
                        <div class="grid grid-cols-3 gap-2 sm:grid-cols-5">
                            <button
                                v-for="option in fsOptions" :key="option.value"
                                class="border px-2 py-1.5 text-sm"
                                :class="isFSActive(option.value) ? 'border-primary bg-primary/8 text-primary' : 'border-base-300 bg-base-100 text-base-content'"
                                type="button"
                                @click="applyScoreFilter('fs', isFSActive(option.value) ? '' : option.value)"
                            >
                                {{ option.label }}
                            </button>
                        </div>
                    </div>

                    <div class="space-y-2">
                        <div class="text-xs text-base-content/50">
                            评级
                        </div>
                        <div class="grid grid-cols-3 gap-2 sm:grid-cols-7">
                            <button
                                v-for="option in rateOptions" :key="option.value"
                                class="border px-2 py-1.5 text-sm"
                                :class="scoreFilter?.rate === option.rate ? 'border-primary bg-primary/8 text-primary' : 'border-base-300 bg-base-100 text-base-content'"
                                type="button"
                                @click="applyScoreFilter('rate', scoreFilter?.rate === option.rate ? '' : option.value)"
                            >
                                {{ option.label }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </details>
    </section>
</template>

<style scoped>
.range-thumb::-webkit-slider-thumb {
    appearance: none;
    pointer-events: auto;
    height: 1.25rem;
    width: 1.25rem;
    border-radius: 9999px;
    background: transparent;
    cursor: pointer;
}

.range-thumb::-moz-range-thumb {
    pointer-events: auto;
    height: 1.25rem;
    width: 1.25rem;
    border-radius: 9999px;
    background: transparent;
    border: none;
    cursor: pointer;
}
</style>
