<script setup lang="ts">
import type { ChartEntry } from '~/composables/function/MaimaiCN/useMaimaiTypes'
import type { PlateCompletionMode, PlateRouteState } from '~/composables/function/MaimaiCN/usePlateProgress'
import {
    buildPlateQuery,
    computeOverview,
    computePlate,
    groupTableRows,
    normalizeCompletionMode,
    parsePlateId,
    parsePlateQuery,
} from '~/composables/function/MaimaiCN/usePlateProgress'
import { useScoreLibrary } from '~/composables/function/MaimaiCN/useScoreLibrary.client'
import ChartDetailModal from '../shared/chart-detail-modal.vue'
import PageHeaderActions from '../shared/page-header-actions.vue'
import PlateOverview from './plate-overview.vue'
import PlatePicker from './plate-picker.vue'
import PlateSummary from './plate-summary.vue'
import PlateTable from './plate-table.vue'
import PlateToolbar from './plate-toolbar.vue'

/**
 * 牌子进度：基于全量成绩在前端实时计算。
 * 状态放在 URL（?plate=桃将&diff=3），支持前进后退与收藏。
 * 默认展示最高要求难度（MASTER，舞/霸有 Re:MASTER 时为 Re:MASTER），点击难度卡片切换。
 */
const props = defineProps<{
    artifactId: string
}>()

const { artifact } = await useArtifact(props.artifactId)
const { entries, loading, error, refresh } = useScoreLibrary(props.artifactId)

const route = useRoute()
const router = useRouter()

const prefs = useLocalStorage('maicn:plates:prefs', { hideCompleted: false, mode: 'all' as PlateCompletionMode }, {
    mergeDefaults: true,
    initOnMounted: true,
})
const hideCompleted = computed({
    get: () => prefs.value.hideCompleted,
    set: value => prefs.value = { ...prefs.value, hideCompleted: value },
})
/** 仅总览使用的完成度口径，详情固定要求所有难度达成 */
const mode = computed<PlateCompletionMode>({
    get: () => normalizeCompletionMode(prefs.value.mode),
    set: value => prefs.value = { ...prefs.value, mode: value },
})

const state = computed(() => parsePlateQuery(route.query))
const plate = computed(() => state.value.plate)

// ===== 计算 =====

const ready = computed(() => entries.value.length > 0)
const overview = computed(() => computeOverview(entries.value))
const progress = computed(() => plate.value ? computePlate(entries.value, plate.value) : null)
const tableGroups = computed(() => progress.value
    ? groupTableRows(progress.value, { diff: state.value.diff, hideCompleted: hideCompleted.value })
    : [])

// ===== 导航 =====

const recent = ref<string | null>(null)
const invalidName = ref<string | null>(null)

function scrollTop() {
    document.querySelector('main')?.scrollTo({ top: 0 })
}

function navigate(next: Pick<PlateRouteState, 'plate' | 'diff'>, mode: 'push' | 'replace') {
    const location = { path: route.path, query: buildPlateQuery(next) }
    return mode === 'push' ? router.push(location) : router.replace(location)
}

function openPlate(id: string) {
    const next = parsePlateId(id)
    if (!next || next.id === plate.value?.id)
        return
    recent.value = next.id
    // 切换种类时保留当前难度（目标牌子没有该难度时会被丢弃）
    void navigate({ plate: next, diff: plate.value ? state.value.diff : null }, 'push').then(scrollTop)
}

function backToOverview() {
    if (plate.value)
        recent.value = plate.value.id
    if (import.meta.client && window.history.state?.back === route.path)
        router.back()
    else
        void router.replace({ path: route.path, query: {} })
}

function toggleDiff(levelIndex: number) {
    const diff = state.value.diff === levelIndex ? null : levelIndex
    void navigate({ plate: plate.value, diff }, 'replace')
}

function clearDiff() {
    void navigate({ plate: plate.value, diff: null }, 'replace')
}

// 别名（华将 → 熊将）规范化；无法识别的牌子回到总览并提示
watch(() => route.query, (query) => {
    const current = parsePlateQuery(query)
    if (current.invalid) {
        invalidName.value = current.invalid
        void router.replace({ path: route.path, query: {} })
        return
    }
    const canonical = buildPlateQuery(current)
    const keys = Object.keys(query)
    const same = keys.length === Object.keys(canonical).length && keys.every(key => query[key] === canonical[key])
    if (current.plate && !same)
        void router.replace({ path: route.path, query: canonical })
}, { immediate: true })

// ===== 详情 =====

const pickerOpen = ref(false)
const detailOpen = ref(false)
const selected = ref<ChartEntry | null>(null)

function openDetail(entry: ChartEntry) {
    selected.value = entry
    detailOpen.value = true
}

onMounted(refresh)
</script>

<template>
    <div class="space-y-3 p-2 sm:p-3 lg:p-4">
        <PageHeaderActions :artifact="artifact" :loading="loading" @refresh="refresh" @updated="refresh" />

        <div v-if="invalidName" class="alert alert-warning alert-soft text-sm" role="alert">
            <Icon name="mdi:help-circle-outline" class="h-5 w-5" />
            <span>未知牌子「{{ invalidName }}」，已返回总览。</span>
            <button class="btn btn-ghost btn-sm" type="button" aria-label="关闭提示" @click="invalidName = null">
                <Icon name="mdi:close" class="h-4 w-4" />
            </button>
        </div>

        <div v-if="error" class="alert alert-error alert-soft text-sm" role="alert">
            <Icon name="mdi:alert-circle-outline" class="h-5 w-5" />
            <span>{{ error }}</span>
            <button class="btn btn-sm" type="button" @click="refresh">
                重试
            </button>
        </div>

        <PlateOverview
            v-if="!plate"
            v-model:mode="mode"
            :overview="overview"
            :loading="!ready && loading"
            :recent="recent"
            @select="openPlate"
        />

        <template v-else>
            <PlateToolbar
                v-model:hide-completed="hideCompleted"
                :plate="plate"
                :diff="state.diff"
                @back="backToOverview"
                @open-picker="pickerOpen = true"
                @select-plate="openPlate"
                @clear-diff="clearDiff"
            />

            <div v-if="!ready" class="space-y-3" aria-busy="true" aria-label="正在加载成绩">
                <div class="skeleton h-40 rounded-xl" />
                <div class="grid grid-cols-5 gap-1 sm:grid-cols-9">
                    <div v-for="index in 18" :key="index" class="skeleton aspect-square rounded-md" />
                </div>
            </div>

            <template v-else-if="progress">
                <PlateSummary :progress="progress" :active-diff="state.diff" @select-diff="toggleDiff" />

                <div v-if="progress.songCount.total === 0" class="panel px-4 py-12 text-center text-sm text-base-content/60">
                    该版本暂无谱面数据
                </div>

                <template v-else>
                    <PlateTable
                        v-if="tableGroups.length"
                        :groups="tableGroups"
                        :kind="plate.kind"
                        :filtered="state.diff !== null"
                        @select="openDetail"
                    />
                    <div v-else class="panel px-4 py-12 text-center">
                        <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-success">
                            <Icon name="mdi:party-popper" class="h-6 w-6" />
                        </div>
                        <p class="text-sm font-medium">
                            {{ state.diff === null ? '已全部完成' : '该难度已全部达成' }}，恭喜！
                        </p>
                        <button class="btn btn-ghost btn-sm mt-2" type="button" @click="hideCompleted = false">
                            显示已完成
                        </button>
                    </div>
                    <p class="px-1 text-[11px] leading-relaxed text-base-content/45">
                        <template v-if="state.diff === null">
                            底部色块依次为各难度，实心为已达成，描边为未达成。
                        </template>
                        <template v-else>
                            图标显示该难度的当前成绩，右上角对勾表示当前难度已达成。
                        </template>
                        点击封面查看谱面详情。
                    </p>
                </template>
            </template>

            <PlatePicker v-model:open="pickerOpen" :current="plate.id" :overview="overview" mode="all" @select="openPlate" />
        </template>

        <ChartDetailModal v-model:open="detailOpen" :entry="selected" :library="entries" />
    </div>
</template>
