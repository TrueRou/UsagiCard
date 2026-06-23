<script setup lang="ts">
import type { PieSeriesOption } from 'echarts/charts'
import type { LegendComponentOption, TooltipComponentOption } from 'echarts/components'
import type { ComposeOption } from 'echarts/core'
import type { UserDataSnapshot, UserRegionSnapshot } from '~/composables/function/MaimaiCN/useMaimaiUserData'
import { PieChart } from 'echarts/charts'
import { LegendComponent, TooltipComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { useMaimaiUtils } from '~/composables/function/MaimaiCN/useMaimaiUtils'

const props = defineProps<{
    snapshot: UserDataSnapshot
    regionSnapshot: UserRegionSnapshot
}>()

use([CanvasRenderer, PieChart, TooltipComponent, LegendComponent])

type ChartOption = ComposeOption<PieSeriesOption | TooltipComponentOption | LegendComponentOption>

const { getDifficultyColor } = useMaimaiUtils()

const difficultyLabels = [
    { key: 'basic', label: 'Basic', index: 0 },
    { key: 'advanced', label: 'Advanced', index: 1 },
    { key: 'expert', label: 'Expert', index: 2 },
    { key: 'master', label: 'Master', index: 3 },
    { key: 're_master', label: 'Re:Master', index: 4 },
] as const

interface PieDataItem {
    name: string
    value: number
    itemStyle?: { color: string }
}

function getDifficultyPieData(prefix: string): PieDataItem[] {
    return difficultyLabels
        .map(d => ({
            name: d.label,
            value: (props.snapshot as Record<string, number | undefined>)[`total_${d.key}_${prefix}`] ?? 0,
            itemStyle: { color: getDifficultyColor(d.index) },
        }))
        .filter(item => item.value > 0)
}

const regionPieData = computed<PieDataItem[]>(() => {
    return Object.entries(props.regionSnapshot)
        .map(([name, entry]) => ({ name, value: entry.play_count }))
        .filter(item => item.value > 0)
        .sort((a, b) => b.value - a.value)
})

const dxScorePieData = computed(() => getDifficultyPieData('deluxscore'))
const achievementPieData = computed(() => getDifficultyPieData('achievement'))
const syncPieData = computed(() => getDifficultyPieData('sync'))

function makePieOption(data: PieDataItem[]): ChartOption {
    return {
        tooltip: {
            trigger: 'item',
            formatter: '{b}<br/>{c} ({d}%)',
        },
        legend: {
            bottom: 0,
            left: 'center',
            type: 'scroll',
        },
        series: [{
            type: 'pie',
            radius: ['40%', '68%'],
            center: ['50%', '44%'],
            avoidLabelOverlap: true,
            minAngle: 3,
            itemStyle: {
                borderRadius: 6,
                borderColor: 'rgba(255,255,255,0.08)',
                borderWidth: 2,
            },
            label: {
                formatter: '{b|{b}}\n{c|{d}%}',
                rich: {
                    b: { fontSize: 12, fontWeight: 600 },
                    c: { fontSize: 11, color: '#868e96' },
                },
            },
            labelLine: { length: 12, length2: 10 },
            data,
        }],
    }
}

const charts = computed(() => [
    { title: '游玩区域', option: makePieOption(regionPieData.value), hasData: regionPieData.value.length > 0 },
    { title: '总 DX 分', option: makePieOption(dxScorePieData.value), hasData: dxScorePieData.value.length > 0 },
    { title: '总 达成度', option: makePieOption(achievementPieData.value), hasData: achievementPieData.value.length > 0 },
    { title: '总 Sync', option: makePieOption(syncPieData.value), hasData: syncPieData.value.length > 0 },
])
</script>

<template>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div
            v-for="chart in charts"
            :key="chart.title"
            class="rounded-xl border border-gray-200 dark:border-gray-800 p-4"
        >
            <h4 class="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase">
                {{ chart.title }}
            </h4>
            <VChart
                v-if="chart.hasData"
                :option="chart.option"
                autoresize
                style="width: 100%; height: 280px"
            />
            <div v-else class="flex items-center justify-center h-70 text-sm text-gray-400">
                暂无图表数据
            </div>
        </div>
    </div>
</template>
