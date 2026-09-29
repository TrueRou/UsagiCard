<script setup lang="ts">
import type { MapSeriesOption } from 'echarts/charts'
import type {
    GeoComponentOption,
    TooltipComponentOption,
    VisualMapComponentOption,
} from 'echarts/components'
import type { ComposeOption } from 'echarts/core'
import type { UserRegionSnapshot } from '~/composables/function/MaimaiCN/useMaimaiTypes'
import { MapChart } from 'echarts/charts'
import {
    GeoComponent,
    TooltipComponent,
    VisualMapComponent,
} from 'echarts/components'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'

const props = withDefaults(defineProps<{
    regionSnapshot: UserRegionSnapshot
    showTitle?: boolean
}>(), {
    showTitle: true,
})

echarts.use([CanvasRenderer, MapChart, TooltipComponent, VisualMapComponent, GeoComponent])

type ChartOption = ComposeOption<
    MapSeriesOption | TooltipComponentOption | VisualMapComponentOption | GeoComponentOption
>

const mapReady = ref(false)

const CHINA_GEOJSON_URL = 'https://eo.assets.turou.fun/static/china_geo.json'

const mapData = computed(() => {
    return Object.entries(props.regionSnapshot)
        .filter(([, entry]) => entry && typeof entry === 'object' && 'play_count' in entry && entry.play_count > 0)
        .map(([name, entry]) => ({
            name,
            value: entry.play_count,
        }))
})

const maxValue = computed(() => {
    const values = mapData.value.map(d => d.value)
    return values.length > 0 ? Math.max(...values) : 100
})

const chartOption = computed<ChartOption>(() => ({
    tooltip: {
        trigger: 'item',
        formatter: '{b}<br/>游玩次数: {c}',
    },
    visualMap: {
        min: mapData.value.length > 0 ? 1 : 0,
        max: maxValue.value || 100,
        text: ['多', '少'],
        inRange: {
            color: ['#d0ebff', '#74c0fc', '#228be6', '#1864ab'],
        },
        calculable: true,
    },
    series: [{
        type: 'map',
        map: 'china',
        roam: true,
        scaleLimit: {
            min: 1,
            max: 2.8,
        },
        itemStyle: {
            areaColor: '#f1f3f5',
            borderColor: '#ced4da',
        },
        emphasis: {
            label: { show: true },
            itemStyle: {
                areaColor: '#4dabf7',
            },
        },
        data: mapData.value,
    }],
}))

onMounted(async () => {
    try {
        const resp = await fetch(CHINA_GEOJSON_URL)
        const geoJson = await resp.json()
        echarts.registerMap('china', geoJson)
        mapReady.value = true
    }
    catch {
        console.warn('Failed to load China GeoJSON')
    }
})
</script>

<template>
    <div>
        <h4 v-if="showTitle" class="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase">
            地区分布
        </h4>
        <div v-if="!mapReady" class="flex justify-center py-12">
            <span class="loading loading-spinner loading-md" />
        </div>
        <VChart v-else :option="chartOption" autoresize style="width: 100%; height: 384px" />
    </div>
</template>
