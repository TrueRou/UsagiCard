<script setup lang="ts">
import type { BreakSplitResult, JudgeMatrix, JudgeRow, NoteCounts, NoteKind, WeightMode } from '~/composables/function/MaimaiCN/useAchievementMath'
import {
    achievementBounds,
    createPerfectMatrix,
    enumerateBreakSplits,
    judgeRowTotal,
    NOTE_KINDS,
    remainingSssPlusTolerance,
    totalNotes,
    truncateAchievement,
    verifyAchievement,
    weightMatrix,
} from '~/composables/function/MaimaiCN/useAchievementMath'
import BaseModal from './base-modal.vue'

const props = defineProps<{
    notes: NoteCounts
    title: string
    difficultyLabel: string
    accentColor?: string
}>()

const open = defineModel<boolean>('open', { default: false })

const KIND_LABELS: Record<NoteKind, string> = { tap: 'TAP', hold: 'HOLD', slide: 'SLIDE', touch: 'TOUCH', break: 'BREAK' }
const JUDGE_KEYS: (keyof JudgeRow)[] = ['critical', 'perfect', 'great', 'good', 'miss']
const JUDGE_LABELS: Record<keyof JudgeRow, string> = { critical: 'CP', perfect: 'P', great: 'GR', good: 'GD', miss: 'MS' }
const MODE_OPTIONS: { value: WeightMode, label: string }[] = [
    { value: '101-', label: '101- 理论倒扣' },
    { value: '100-', label: '100- 满分倒扣' },
    { value: '0+', label: '0+ 累加得分' },
]

const noteTotal = computed(() => totalNotes(props.notes))

// ===== 权重矩阵 =====
const mode = ref<WeightMode>('101-')
const rows = computed(() => weightMatrix(props.notes, mode.value))

function formatWeight(value: number) {
    if (Math.abs(value) < 1e-9)
        return mode.value === '0+' ? '0.0000' : '0'
    const text = value.toFixed(4)
    return value > 0 && mode.value !== '0+' ? `+${text}` : text
}

// ===== 合法性验证 =====
const verifyInput = ref(101)
const verifyResult = ref<{ value: number, valid: boolean } | null>(null)

function runVerify() {
    const value = Number(verifyInput.value)
    verifyResult.value = { value, valid: verifyAchievement(props.notes, value) }
}

// ===== 绝赞分布 =====
const matrix = ref<JudgeMatrix>(createPerfectMatrix(props.notes))
const target = ref(100.5)
const splitResults = ref<BreakSplitResult[] | null>(null)
const page = ref(0)
const PAGE_SIZE = 10

watch(() => props.notes, (notes) => {
    matrix.value = createPerfectMatrix(notes)
    splitResults.value = null
    verifyResult.value = null
})

const rowErrors = computed(() => NOTE_KINDS.filter(kind => judgeRowTotal(matrix.value[kind]) !== props.notes[kind]))
const matrixValid = computed(() => rowErrors.value.length === 0)

const bounds = computed(() => {
    if (!matrixValid.value)
        return null
    const { best, worst } = achievementBounds(matrix.value)
    return {
        best: truncateAchievement(best),
        worst: truncateAchievement(worst),
        tolerance: remainingSssPlusTolerance(truncateAchievement(worst), props.notes),
    }
})

function updateCell(kind: NoteKind, key: keyof JudgeRow, raw: string) {
    const value = Math.max(0, Math.floor(Number(raw) || 0))
    matrix.value = { ...matrix.value, [kind]: { ...matrix.value[kind], [key]: value } }
    splitResults.value = null
}

function resetMatrix() {
    matrix.value = createPerfectMatrix(props.notes)
    splitResults.value = null
}

function runSplits() {
    if (!matrixValid.value)
        return
    splitResults.value = enumerateBreakSplits(matrix.value, Number(target.value))
    page.value = 0
}

const pageCount = computed(() => Math.max(1, Math.ceil((splitResults.value?.length ?? 0) / PAGE_SIZE)))
const pagedResults = computed(() => (splitResults.value ?? []).slice(page.value * PAGE_SIZE, (page.value + 1) * PAGE_SIZE))
</script>

<template>
    <BaseModal v-model:open="open" box-class="max-w-3xl">
        <template #header>
            <div class="min-w-0">
                <h3 class="text-base font-bold">
                    达成率与判定计算器
                </h3>
                <div class="mt-1 flex flex-wrap items-center gap-2 text-xs text-base-content/60">
                    <span class="truncate font-medium text-base-content">{{ title }}</span>
                    <span class="badge badge-sm border-0 text-white" :style="{ backgroundColor: accentColor }">{{ difficultyLabel }}</span>
                    <span class="badge badge-ghost badge-sm">物量 {{ noteTotal }}</span>
                </div>
            </div>
        </template>

        <div class="space-y-5">
            <!-- 判定权重矩阵 -->
            <section class="space-y-2">
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <h4 class="text-sm font-bold">
                        判定权重矩阵
                    </h4>
                    <div class="join">
                        <button
                            v-for="option in MODE_OPTIONS"
                            :key="option.value"
                            class="btn join-item btn-xs"
                            :class="mode === option.value ? 'btn-primary' : 'btn-ghost bg-base-200'"
                            type="button"
                            @click="mode = option.value"
                        >
                            {{ option.label }}
                        </button>
                    </div>
                </div>
                <div class="overflow-x-auto rounded-lg border border-base-300">
                    <table class="table table-xs whitespace-nowrap font-mono">
                        <thead>
                            <tr>
                                <th>类型</th>
                                <th class="text-right">
                                    物量
                                </th>
                                <th class="text-amber-500">
                                    PERFECT
                                </th>
                                <th class="text-pink-500">
                                    GREAT
                                </th>
                                <th class="text-emerald-500">
                                    GOOD
                                </th>
                                <th class="text-rose-500">
                                    MISS
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="row in rows" :key="row.kind">
                                <td class="font-sans font-bold">
                                    {{ KIND_LABELS[row.kind] }}
                                </td>
                                <td class="text-right">
                                    {{ row.count }}
                                </td>
                                <td>
                                    <template v-if="row.kind === 'break'">
                                        <div v-for="(value, index) in row.perfect" :key="index">
                                            <span class="text-base-content/45">{{ ['CP', 'P75', 'P50'][index] }}</span> {{ formatWeight(value) }}
                                        </div>
                                    </template>
                                    <template v-else>
                                        {{ formatWeight(row.perfect[0]!) }}
                                    </template>
                                </td>
                                <td>
                                    <template v-if="row.kind === 'break'">
                                        <div v-for="(value, index) in row.great" :key="index">
                                            <span class="text-base-content/45">{{ ['2000', '1500', '1250'][index] }}</span> {{ formatWeight(value) }}
                                        </div>
                                    </template>
                                    <template v-else>
                                        {{ formatWeight(row.great[0]!) }}
                                    </template>
                                </td>
                                <td>{{ formatWeight(row.good) }}</td>
                                <td>{{ formatWeight(row.miss) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p class="text-[11px] text-base-content/50">
                    数值为单个判定对达成率（%）的影响。
                </p>
            </section>

            <!-- 合法性验证 -->
            <section class="space-y-2">
                <h4 class="text-sm font-bold">
                    达成率合法性验证
                </h4>
                <form class="flex gap-2" @submit.prevent="runVerify">
                    <input v-model.number="verifyInput" type="number" step="0.0001" min="0" max="101" class="input input-sm flex-1 font-mono" aria-label="待验证的达成率">
                    <button class="btn btn-sm btn-primary" type="submit">
                        验证
                    </button>
                </form>
                <div
                    v-if="verifyResult"
                    class="alert alert-soft py-2 text-sm"
                    :class="verifyResult.valid ? 'alert-success' : 'alert-error'"
                    role="status"
                >
                    {{ verifyResult.valid
                        ? `合法：${verifyResult.value.toFixed(4)}% 可以由某种判定组合得到`
                        : `不合法：该谱面不存在能得到 ${verifyResult.value.toFixed(4)}% 的判定组合` }}
                </div>
            </section>

            <!-- 绝赞分布精密计算 -->
            <details class="collapse-arrow collapse rounded-lg border border-base-300">
                <summary class="collapse-title text-sm font-bold">
                    绝赞分布精密计算（Break Splits）
                </summary>
                <div class="collapse-content space-y-3">
                    <div class="overflow-x-auto rounded-lg border border-base-300">
                        <table class="table table-xs">
                            <thead>
                                <tr>
                                    <th>类型</th>
                                    <th v-for="key in JUDGE_KEYS" :key="key" class="text-center">
                                        {{ JUDGE_LABELS[key] }}
                                    </th>
                                    <th />
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="kind in NOTE_KINDS" :key="kind">
                                    <td class="font-bold">
                                        {{ KIND_LABELS[kind] }}
                                    </td>
                                    <td v-for="key in JUDGE_KEYS" :key="key">
                                        <input
                                            type="number"
                                            min="0"
                                            class="input input-xs w-16 font-mono"
                                            :class="rowErrors.includes(kind) ? 'input-error' : ''"
                                            :value="matrix[kind][key]"
                                            :aria-label="`${KIND_LABELS[kind]} ${JUDGE_LABELS[key]}`"
                                            @change="updateCell(kind, key, ($event.target as HTMLInputElement).value)"
                                        >
                                    </td>
                                    <td class="whitespace-nowrap font-mono text-[11px]" :class="rowErrors.includes(kind) ? 'text-error' : 'text-base-content/45'">
                                        {{ judgeRowTotal(matrix[kind]) }}/{{ notes[kind] }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div v-if="!matrixValid" class="text-xs text-error">
                        每一行的判定数量之和需要等于该类型的物量。
                    </div>

                    <div v-if="bounds" class="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <div class="rounded-lg bg-base-200/60 p-3 text-sm">
                            <div class="text-[11px] text-base-content/55">
                                当前判定达成率区间
                            </div>
                            <div class="font-mono font-bold">
                                {{ bounds.worst.toFixed(4) }}% ~ {{ bounds.best.toFixed(4) }}%
                            </div>
                        </div>
                        <div class="rounded-lg bg-pink-500/10 p-3 text-sm">
                            <div class="text-[11px] text-base-content/55">
                                最坏情况下的鸟加容错
                            </div>
                            <div class="font-mono font-bold text-pink-500">
                                {{ bounds.tolerance === null ? '已低于鸟加' : `+${bounds.tolerance} 粉` }}
                            </div>
                        </div>
                    </div>

                    <form class="flex flex-wrap items-center gap-2" @submit.prevent="runSplits">
                        <label class="text-xs text-base-content/60" for="break-split-target">目标达成率</label>
                        <input id="break-split-target" v-model.number="target" type="number" step="0.0001" class="input input-sm w-32 font-mono">
                        <button class="btn btn-sm btn-primary" type="submit" :disabled="!matrixValid">
                            开始计算
                        </button>
                        <button class="btn btn-sm btn-ghost" type="button" @click="resetMatrix">
                            重置判定
                        </button>
                    </form>

                    <template v-if="splitResults">
                        <div class="overflow-x-auto rounded-lg border border-base-300">
                            <table class="table table-xs whitespace-nowrap font-mono">
                                <thead>
                                    <tr>
                                        <th>达成率</th>
                                        <th>鸟加容错</th>
                                        <th>P75</th>
                                        <th>P50</th>
                                        <th>GR2000</th>
                                        <th>GR1500</th>
                                        <th>GR1250</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr
                                        v-for="(result, index) in pagedResults"
                                        :key="`${result.perfectHigh}-${result.great2000}-${result.great1500}`"
                                        :class="page === 0 && index === 0 ? 'bg-amber-500/10' : ''"
                                    >
                                        <td class="font-bold">
                                            {{ result.achievement.toFixed(4) }}%
                                            <span v-if="page === 0 && index === 0" class="badge badge-warning badge-xs ml-1 font-sans">推荐解</span>
                                        </td>
                                        <td :class="result.tolerance === null ? 'text-base-content/40' : 'text-pink-500'">
                                            {{ result.tolerance === null ? '-' : `+${result.tolerance} 粉` }}
                                        </td>
                                        <td>{{ result.perfectHigh }}</td>
                                        <td>{{ result.perfectLow }}</td>
                                        <td>{{ result.great2000 }}</td>
                                        <td>{{ result.great1500 }}</td>
                                        <td>{{ result.great1250 }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="flex items-center justify-between text-xs text-base-content/60">
                            <span>共 {{ splitResults.length }} 种组合</span>
                            <div class="join">
                                <button class="btn join-item btn-xs" type="button" :disabled="page === 0" @click="page--">
                                    上一页
                                </button>
                                <span class="btn join-item btn-xs btn-disabled font-mono">{{ page + 1 }}/{{ pageCount }}</span>
                                <button class="btn join-item btn-xs" type="button" :disabled="page >= pageCount - 1" @click="page++">
                                    下一页
                                </button>
                            </div>
                        </div>
                    </template>
                </div>
            </details>
        </div>
    </BaseModal>
</template>
