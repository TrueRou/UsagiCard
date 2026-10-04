<script setup lang="ts">
import type { NoteCounts } from '~/composables/function/MaimaiCN/useAchievementMath'
import type { ChartEntry, SongDifficultyUtage } from '~/composables/function/MaimaiCN/useMaimaiTypes'
import { sssPlusTolerance, totalNotes } from '~/composables/function/MaimaiCN/useAchievementMath'
import { useClipboardToast } from '~/composables/function/MaimaiCN/useClipboardToast'
import { DifficultyNames, SongType, useMaimaiUtils } from '~/composables/function/MaimaiCN/useMaimaiUtils'
import { entryDxStar, entryLevelValue, resolveVersionGroup } from '~/composables/function/MaimaiCN/useScoreView'
import AchievementCalculatorModal from './achievement-calculator-modal.vue'
import BaseModal from './base-modal.vue'

const props = defineProps<{
    entry: ChartEntry | null
    /** 用于切换同曲其它谱面的谱面库 */
    library: ChartEntry[]
}>()

const open = defineModel<boolean>('open', { default: false })

const {
    formatAchievement,
    getAchievementIconSrc,
    getDifficultyColor,
    getDifficultyTextClass,
    getDxStarIconSrc,
    getFCIconSrc,
    getFCText,
    getFSIconSrc,
    getFSText,
    getMaimaiVersionLabel,
    getSongJacketUrl,
    handleImageError,
} = useMaimaiUtils()
const { copy } = useClipboardToast()

const current = ref<ChartEntry | null>(null)
watch(() => props.entry, entry => current.value = entry, { immediate: true })

const siblings = computed(() => {
    const entry = current.value
    if (!entry)
        return []
    const list = props.library.filter(item => item.song.id === entry.song.id)
    return list.length ? list : [entry]
})

const TYPE_ORDER = [SongType.DX, SongType.STANDARD, SongType.UTAGE]
const TYPE_LABELS: Record<SongType, string> = {
    [SongType.DX]: 'DX',
    [SongType.STANDARD]: '标准',
    [SongType.UTAGE]: '宴',
}

const availableTypes = computed(() => TYPE_ORDER.filter(type => siblings.value.some(item => item.type === type)))
const tabs = computed(() => siblings.value
    .filter(item => item.type === current.value?.type)
    .sort((a, b) => a.levelIndex - b.levelIndex || a.key.localeCompare(b.key)))

function switchType(type: SongType) {
    const candidates = siblings.value.filter(item => item.type === type)
    current.value = candidates.find(item => item.levelIndex === current.value?.levelIndex)
        ?? candidates.find(item => item.score)
        ?? candidates.at(-1)
        ?? current.value
}

function activeTabStyle(entry: ChartEntry) {
    const color = getDifficultyColor(entry.levelIndex, entry.type)
    return {
        'background-color': color,
        'border-color': color,
        '--tw-ring-color': `${color}66`,
    }
}

function tabLabel(entry: ChartEntry) {
    if (entry.type === SongType.UTAGE)
        return `宴 [${(entry.difficulty as SongDifficultyUtage).kanji ?? '?'}]`
    return DifficultyNames[entry.levelIndex] ?? ''
}

const accentColor = computed(() => current.value ? getDifficultyColor(current.value.levelIndex, current.value.type) : undefined)
const score = computed(() => current.value?.score ?? null)
const difficulty = computed(() => current.value?.difficulty)

const notes = computed<NoteCounts>(() => ({
    tap: difficulty.value?.tap_num ?? 0,
    hold: difficulty.value?.hold_num ?? 0,
    slide: difficulty.value?.slide_num ?? 0,
    touch: difficulty.value?.touch_num ?? 0,
    break: difficulty.value?.break_num ?? 0,
}))
const noteTotal = computed(() => totalNotes(notes.value))
const noteRows = computed(() => [
    { key: 'tap', label: 'TAP', color: '#3B82F6', count: notes.value.tap },
    { key: 'hold', label: 'HOLD', color: '#EAB308', count: notes.value.hold },
    { key: 'slide', label: 'SLIDE', color: '#EC4899', count: notes.value.slide },
    { key: 'touch', label: 'TOUCH', color: '#14B8A6', count: notes.value.touch },
    { key: 'break', label: 'BREAK', color: '#F97316', count: notes.value.break },
])
const tolerances = computed(() => [
    { label: '绝赞全大', value: sssPlusTolerance(notes.value, 1) },
    { label: '绝赞 80% 大', value: sssPlusTolerance(notes.value, 0.8) },
    { label: '绝赞 50% 大', value: sssPlusTolerance(notes.value, 0.5) },
])

const dxStar = computed(() => current.value ? entryDxStar(current.value) : 0)
const levelText = computed(() => {
    const value = current.value ? entryLevelValue(current.value) : 0
    return difficulty.value && difficulty.value.level_value > 0 ? value.toFixed(1) : (difficulty.value?.level ?? '-')
})
const versionLabel = computed(() => difficulty.value ? getMaimaiVersionLabel(resolveVersionGroup(difficulty.value.version)) : '-')
const noteDesigner = computed(() => {
    const designer = difficulty.value?.note_designer
    return designer && designer !== '-' ? designer : '-'
})
const aliases = computed(() => (current.value?.song.aliases ?? []).filter(alias => alias.trim()))
const infoRows = computed(() => {
    const song = current.value?.song
    if (!song)
        return []
    return [
        { label: '类别', value: song.genre },
        { label: 'BPM', value: song.bpm },
        { label: '版本', value: versionLabel.value },
        { label: '曲师', value: song.artist },
    ]
})

const calculatorOpen = ref(false)
</script>

<template>
    <BaseModal v-model:open="open" box-class="max-w-4xl">
        <template #header>
            <span class="text-sm font-semibold text-base-content/60">谱面详情</span>
        </template>

        <div v-if="current" class="space-y-4">
            <!-- 头部 -->
            <section class="panel p-3 sm:p-4" :style="{ borderLeft: `4px solid ${accentColor}` }">
                <div class="flex gap-3 sm:gap-4">
                    <div class="shrink-0 text-center">
                        <img
                            :src="getSongJacketUrl(current.song.id)"
                            :alt="current.song.title"
                            class="h-16 w-16 rounded-xl object-cover shadow-md sm:h-28 sm:w-28"
                            @error="handleImageError"
                        >
                        <button class="mt-1 font-mono text-[11px] text-base-content/50 hover:text-primary" type="button" @click="copy(current.song.id, '歌曲 ID')">
                            #{{ current.song.id }}
                        </button>
                    </div>
                    <div class="min-w-0 flex-1 space-y-2">
                        <button class="block max-w-full text-left text-lg font-bold leading-tight hover:text-primary sm:text-xl" type="button" @click="copy(current.song.title, '曲名')">
                            {{ current.song.title }}
                        </button>
                        <div class="join">
                            <button
                                v-for="type in availableTypes"
                                :key="type"
                                class="btn join-item btn-sm lg:btn-xs"
                                :class="current.type === type ? 'btn-primary' : 'btn-ghost bg-base-200'"
                                type="button"
                                @click="switchType(type)"
                            >
                                {{ TYPE_LABELS[type] }}
                            </button>
                        </div>
                        <dl
                            class="grid grid-cols-1 gap-x-4 gap-y-1 rounded-lg px-3 py-2 text-xs sm:grid-cols-2"
                            :style="{ background: `linear-gradient(135deg, ${accentColor}14, ${accentColor}26)` }"
                        >
                            <div v-for="row in infoRows" :key="row.label" class="flex min-w-0 items-center gap-2">
                                <span class="h-3.5 w-1 shrink-0 rounded-full" :style="{ backgroundColor: accentColor }" />
                                <dt class="shrink-0 text-base-content/55">
                                    {{ row.label }}
                                </dt>
                                <dd class="truncate font-medium">
                                    {{ row.value }}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
                <div class="mt-3 flex justify-end">
                    <button class="btn btn-sm btn-outline" type="button" @click="calculatorOpen = true">
                        <Icon name="mdi:calculator-variant-outline" class="h-4 w-4" />
                        达成率计算器
                    </button>
                </div>
            </section>

            <!-- 难度 Tab -->
            <nav class="scrollbar-none -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 pt-1 sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0" aria-label="难度">
                <button
                    v-for="tab in tabs"
                    :key="tab.key"
                    class="min-w-16 flex-1 shrink-0 rounded-xl border px-1.5 py-1.5 text-center transition-all active:scale-95 sm:min-w-0"
                    :class="tab.key === current.key ? ['ring-2 ring-offset-1 ring-offset-base-100', getDifficultyTextClass(tab.levelIndex, tab.type)] : 'border-base-300 bg-base-100 hover:bg-base-200'"
                    :style="tab.key === current.key ? activeTabStyle(tab) : undefined"
                    type="button"
                    @click="current = tab"
                >
                    <div class="truncate text-[10px] font-bold" :style="tab.key === current.key ? undefined : { color: getDifficultyColor(tab.levelIndex, tab.type) }">
                        {{ tabLabel(tab) }}
                    </div>
                    <div class="font-mono text-[15px] font-bold leading-tight">
                        {{ tab.difficulty.level_value > 0 ? tab.difficulty.level_value.toFixed(1) : tab.difficulty.level }}
                    </div>
                    <div class="truncate font-mono text-[10px]" :class="tab.key === current.key ? 'opacity-90' : 'text-base-content/55'">
                        {{ tab.score ? formatAchievement(tab.score.achievements) : '未游玩' }}
                    </div>
                </button>
            </nav>

            <div class="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <!-- 成绩详情 -->
                <section class="panel p-3 sm:p-4">
                    <h4 class="mb-3 text-sm font-bold" :style="{ color: accentColor }">
                        成绩详情（{{ tabLabel(current) }} {{ levelText }}）
                    </h4>
                    <div
                        class="mb-3 flex items-center justify-between gap-2 rounded-lg border px-3 py-3"
                        :style="{ backgroundColor: `${accentColor}1F`, borderColor: `${accentColor}59` }"
                    >
                        <template v-if="score">
                            <div>
                                <div class="text-[11px] text-base-content/55">
                                    当前最佳达成率
                                </div>
                                <div class="font-mono text-2xl font-extrabold" :style="{ color: accentColor }">
                                    {{ formatAchievement(score.achievements) }}
                                </div>
                            </div>
                            <div class="flex items-center gap-1">
                                <img v-if="getAchievementIconSrc(score.achievements)" :src="getAchievementIconSrc(score.achievements)" alt="评级" class="h-9 w-auto">
                                <img v-if="getFCIconSrc(score.fc)" :src="getFCIconSrc(score.fc)" :alt="getFCText(score.fc)" class="h-8 w-8">
                                <img v-if="getFSIconSrc(score.fs)" :src="getFSIconSrc(score.fs)" :alt="getFSText(score.fs)" class="h-8 w-8">
                            </div>
                        </template>
                        <div v-else class="py-2 text-sm text-base-content/60">
                            该难度暂无游玩记录
                        </div>
                    </div>
                    <dl class="divide-y divide-base-200 text-sm">
                        <div class="flex justify-between gap-3 py-1.5">
                            <dt class="text-base-content/55">
                                DX Rating 贡献
                            </dt>
                            <dd class="font-mono font-semibold">
                                {{ score ? `+${score.dx_rating}` : '-' }}
                                <span class="text-xs font-normal text-base-content/50">（定数 {{ levelText }}）</span>
                            </dd>
                        </div>
                        <div class="flex justify-between gap-3 py-1.5">
                            <dt class="text-base-content/55">
                                DX Score / 星级
                            </dt>
                            <dd class="flex items-center gap-1.5 font-mono font-semibold">
                                <template v-if="score && current.maxDxScore">
                                    {{ score.dx_score }} / {{ current.maxDxScore }}
                                    <span class="text-xs font-normal text-base-content/50">({{ (score.dx_score / current.maxDxScore * 100).toFixed(2) }}%)</span>
                                    <img v-if="getDxStarIconSrc(dxStar)" :src="getDxStarIconSrc(dxStar)" alt="DX 星级" class="h-5 w-auto">
                                </template>
                                <template v-else>
                                    - / {{ current.maxDxScore || '-' }}
                                </template>
                            </dd>
                        </div>
                        <div class="flex justify-between gap-3 py-1.5">
                            <dt class="text-base-content/55">
                                游玩次数
                            </dt>
                            <dd class="font-mono font-semibold">
                                {{ score?.play_count ? `${score.play_count} 次` : '-' }}
                            </dd>
                        </div>
                        <div class="flex justify-between gap-3 py-1.5">
                            <dt class="text-base-content/55">
                                谱面谱师
                            </dt>
                            <dd class="min-w-0 truncate font-semibold">
                                <button v-if="noteDesigner !== '-'" class="hover:text-primary" type="button" @click="copy(noteDesigner, '谱师')">
                                    {{ noteDesigner }}
                                </button>
                                <span v-else>-</span>
                            </dd>
                        </div>
                    </dl>
                </section>

                <!-- 物量分布 -->
                <section class="panel p-3 sm:p-4">
                    <h4 class="mb-3 text-sm font-bold">
                        物量分布与权重（总物量 {{ noteTotal }}）
                    </h4>
                    <ul class="space-y-1.5">
                        <li v-for="row in noteRows" :key="row.key" class="flex items-center gap-2 text-xs">
                            <span class="w-14 shrink-0 rounded px-1.5 py-0.5 text-center text-[10px] font-bold text-white" :style="{ backgroundColor: row.color }">
                                {{ row.label }}
                            </span>
                            <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-base-200">
                                <div class="h-full rounded-full" :style="{ width: `${noteTotal ? row.count / noteTotal * 100 : 0}%`, backgroundColor: row.color }" />
                            </div>
                            <span class="w-24 shrink-0 text-right font-mono text-base-content/70">
                                {{ row.count }} 个 ({{ noteTotal ? (row.count / noteTotal * 100).toFixed(1) : '0.0' }}%)
                            </span>
                        </li>
                    </ul>
                    <div class="mt-4 rounded-lg border border-pink-300/50 bg-pink-500/5 p-3">
                        <div class="mb-2 flex items-center justify-between gap-2">
                            <span class="text-xs font-bold">绝赞鸟加容错（达成率 ≥ 100.5%）</span>
                            <span class="text-[10px] text-base-content/50">单位：TAP GREAT（粉）</span>
                        </div>
                        <div class="grid grid-cols-3 gap-2 text-center">
                            <div v-for="item in tolerances" :key="item.label" class="rounded-md bg-base-100 px-1 py-2">
                                <div class="text-[10px] text-base-content/55">
                                    {{ item.label }}
                                </div>
                                <div class="font-mono text-sm font-bold" :class="item.value === null ? 'text-base-content/40' : 'text-pink-500'">
                                    {{ item.value === null ? '不可达成' : `${item.value} 个粉` }}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <!-- 别名 -->
            <section v-if="aliases.length" class="rounded-lg border border-base-300 bg-base-100 p-3">
                <div class="mb-2 text-xs text-base-content/55">
                    曲目别名（点击复制）
                </div>
                <div class="flex max-h-24 flex-wrap gap-1.5 overflow-y-auto">
                    <button
                        v-for="alias in aliases"
                        :key="alias"
                        class="badge badge-outline badge-sm cursor-pointer hover:badge-primary"
                        type="button"
                        @click="copy(alias, '别名')"
                    >
                        {{ alias }}
                    </button>
                </div>
            </section>
        </div>

        <AchievementCalculatorModal
            v-if="current"
            v-model:open="calculatorOpen"
            :notes="notes"
            :title="current.song.title"
            :difficulty-label="`${tabLabel(current)} ${levelText}`"
            :accent-color="accentColor"
            :accent-text-class="current ? getDifficultyTextClass(current.levelIndex, current.type) : undefined"
        />
    </BaseModal>
</template>
