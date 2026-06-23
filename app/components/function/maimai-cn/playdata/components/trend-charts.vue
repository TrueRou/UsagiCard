<script setup lang="ts">
import type { LineSeriesOption } from 'echarts/charts'
import type {
    DataZoomComponentOption,
    GridComponentOption,
    LegendComponentOption,
    TooltipComponentOption,
} from 'echarts/components'
import type { ComposeOption } from 'echarts/core'
import type { StoreCurvesResponse, UserRegionSnapshot } from '~/composables/function/MaimaiCN/useMaimaiUserData'
import { LineChart } from 'echarts/charts'
import {
    DataZoomComponent,
    GridComponent,
    LegendComponent,
    TooltipComponent,
} from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import {
    fetchUserDataCurves,
    fetchUserRegionCurves,
} from '~/composables/function/MaimaiCN/useMaimaiUserData'
import RegionChart from './region-chart.vue'

const props = defineProps<{
    artifactId: string
    regionSnapshot: UserRegionSnapshot
}>()

use([CanvasRenderer, LineChart, TooltipComponent, GridComponent, DataZoomComponent, LegendComponent])

type ChartOption = ComposeOption<
    LineSeriesOption | TooltipComponentOption | GridComponentOption | DataZoomComponentOption | LegendComponentOption
>

type RangeKey = '7d' | '30d' | '90d' | 'all'
type RegionViewKey = 'map' | 'line'

const CURVE_FIELDS = [
    'player_rating',
    'player_rating_b35',
    'player_rating_b15',
    'play_count',
    'total_deluxscore',
    'total_achievement',
    'total_sync',
]

const rangeOptions: { key: RangeKey, label: string }[] = [
    { key: '7d', label: '7 天' },
    { key: '30d', label: '30 天' },
    { key: '90d', label: '90 天' },
    { key: 'all', label: '全部' },
]

const regionViewOptions: { key: RegionViewKey, label: string }[] = [
    { key: 'map', label: '地图' },
    { key: 'line', label: '折线' },
]

const activeRange = ref<RangeKey>('30d')
const activeRegionView = ref<RegionViewKey>('map')

const loading = ref(false)
const curvesData = ref<StoreCurvesResponse | null>(null)
const regionCurvesData = ref<StoreCurvesResponse | null>(null)

function getStartTime(range: RangeKey): string | undefined {
    if (range === 'all')
        return undefined
    const days = { '7d': 7, '30d': 30, '90d': 90 }[range]
    const d = new Date()
    d.setDate(d.getDate() - days)
    return d.toISOString()
}

function toSeriesData(points: Record<string, unknown> | undefined): [number, number][] {
    if (!points)
        return []
    return Object.entries(points)
        .map(([ts, val]) => [new Date(ts).getTime(), Number(val)] as [number, number])
        .filter((item): item is [number, number] => Number.isFinite(item[0]) && Number.isFinite(item[1]))
        .sort((a, b) => a[0] - b[0])
}

function makeLineOption(series: { name: string, data: [number, number][], color?: string, areaStyle?: boolean }[]): ChartOption {
    return {
        tooltip: { trigger: 'axis' },
        legend: series.length > 1 ? { data: series.map(s => s.name) } : undefined,
        grid: { left: 50, right: 20, top: 30, bottom: 60 },
        xAxis: { type: 'time' },
        yAxis: { type: 'value' },
        series: series.map(s => ({
            name: s.name,
            type: 'line' as const,
            step: 'end' as const,
            data: s.data,
            smooth: false,
            showSymbol: s.data.length < 50,
            itemStyle: s.color ? { color: s.color } : undefined,
            areaStyle: s.areaStyle ? { opacity: 0.15 } : undefined,
        })),
    }
}

const regionCurveFields = computed(() => {
    const points = regionCurvesData.value?.points ?? {}
    const timestamps = Object.values(points)
    if (timestamps.length === 0)
        return []
    const firstEntry = timestamps[0] as Record<string, unknown> | undefined
    if (!firstEntry)
        return []
    return Object.keys(firstEntry)
        .filter(field => !['play_count', 'created_at', 'region_id'].includes(field))
        .slice(0, 8)
})

async function loadCurves() {
    loading.value = true
    try {
        const startTime = getStartTime(activeRange.value)
        const [userCurves, regionCurves] = await Promise.all([
            fetchUserDataCurves(props.artifactId, CURVE_FIELDS, startTime),
            fetchUserRegionCurves(props.artifactId, startTime).catch(() => null),
        ])
        curvesData.value = userCurves
        regionCurvesData.value = regionCurves
    }
    catch {
        curvesData.value = null
        regionCurvesData.value = null
    }
    finally {
        loading.value = false
    }
}

const ratingChartOption = computed<ChartOption>(() => {
    const points = curvesData.value?.points
    return makeLineOption([
        { name: '总 Rating', data: toSeriesData(points?.player_rating), color: '#228be6' },
        { name: 'B35', data: toSeriesData(points?.player_rating_b35), color: '#40c057' },
        { name: 'B15', data: toSeriesData(points?.player_rating_b15), color: '#fd7e14' },
    ])
})

const playCountChartOption = computed<ChartOption>(() => {
    const points = curvesData.value?.points
    return makeLineOption([
        { name: '游玩次数', data: toSeriesData(points?.play_count), color: '#228be6', areaStyle: true },
    ])
})

const regionLineChartOption = computed<ChartOption>(() => {
    const points = regionCurvesData.value?.points ?? {}
    const fields = regionCurveFields.value
    const colors = ['#228be6', '#40c057', '#fd7e14', '#e64980', '#12b886', '#845ef7', '#fab005', '#15aabf']
    const series = fields.map((field: string, index: number) => ({
        name: field,
        color: colors[index % colors.length],
        data: Object.entries(points)
            .map(([ts, values]) => [new Date(ts).getTime(), Number((values as Record<string, unknown>)[field])] as [number, number])
            .filter((item): item is [number, number] => Number.isFinite(item[0]) && Number.isFinite(item[1]))
            .sort((a, b) => a[0] - b[0]),
    })).filter((item: { data: [number, number][] }) => item.data.length > 0)

    return makeLineOption(series)
})

const hasRegionLineData = computed(() => {
    return regionLineChartOption.value.series != null
        && Array.isArray(regionLineChartOption.value.series)
        && regionLineChartOption.value.series.length > 0
})

watch(activeRange, () => loadCurves())
onMounted(() => loadCurves())
</script>

<template>
    <div>
        <div class="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <h4 class="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase">
                变更趋势
            </h4>
            <div class="join self-start sm:self-auto">
                <button
                    v-for="opt in rangeOptions" :key="opt.key"
                    class="join-item btn btn-sm"
                    :class="activeRange === opt.key ? 'btn-primary' : 'btn-ghost'"
                    @click="activeRange = opt.key"
                >
                    {{ opt.label }}
                </button>
            </div>
        </div>

        <div v-if="loading" class="flex justify-center py-12">
            <span class="loading loading-spinner loading-md" />
        </div>

        <template v-else-if="curvesData">
            <div class="mb-6 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                <h5 class="text-sm font-semibold dark:text-gray-300 mb-2">
                    Rating 变化
                </h5>
                <VChart :option="ratingChartOption" autoresize style="width: 100%; height: 256px" />
            </div>

            <div class="mb-6 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                <h5 class="text-sm font-semibold dark:text-gray-300 mb-2">
                    Play Count 变化
                </h5>
                <VChart :option="playCountChartOption" autoresize style="width: 100%; height: 256px" />
            </div>

            <div class="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                <div class="flex flex-col gap-3 mb-2 sm:flex-row sm:items-center sm:justify-between">
                    <h5 class="text-sm font-semibold dark:text-gray-300">
                        地区趋势
                    </h5>
                    <div class="join self-start sm:self-auto">
                        <button
                            v-for="opt in regionViewOptions" :key="opt.key"
                            class="join-item btn btn-sm"
                            :class="activeRegionView === opt.key ? 'btn-primary' : 'btn-ghost'"
                            @click="activeRegionView = opt.key"
                        >
                            {{ opt.label }}
                        </button>
                    </div>
                </div>

                <RegionChart
                    v-if="activeRegionView === 'map'"
                    :region-snapshot="regionSnapshot"
                    :show-title="false"
                    class="min-h-96"
                />
                <VChart
                    v-else-if="hasRegionLineData"
                    :option="regionLineChartOption"
                    autoresize
                    style="width: 100%; height: 384px"
                />
                <div v-else class="flex items-center justify-center h-96 text-sm text-gray-400">
                    暂无地区趋势数据
                </div>
            </div>
        </template>

        <div v-else class="text-center text-gray-400 py-8">
            暂无变更数据
        </div>
    </div>
</template>
