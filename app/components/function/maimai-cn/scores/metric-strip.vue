<script setup lang="ts">
import type { ScoreMetrics } from '~/composables/function/MaimaiCN/useMaimaiTypes'

const props = defineProps<{
    metrics: ScoreMetrics
}>()

function pct(count: number) {
    return props.metrics.total ? `${(count / props.metrics.total * 100).toFixed(1)}%` : '0.0%'
}

const cells = computed(() => {
    const m = props.metrics
    return [
        {
            label: '平均达成率',
            value: m.played ? `${m.avgAchievement.toFixed(4)}%` : '--',
            sub: `超均值 ${m.aboveAvg}/${m.played}`,
            hero: true,
        },
        { label: 'SSS+', value: `${m.sssp}`, unit: `/${m.total}`, sub: pct(m.sssp) },
        { label: 'SSS 及以上', value: `${m.sss}`, unit: `/${m.total}`, sub: pct(m.sss) },
        { label: 'AP / AP+', value: `${m.ap}`, unit: `/${m.total}`, sub: `FC 及以上 ${m.fc}` },
        { label: '总游玩次数', value: `${m.playCount}`, unit: ' 次', sub: `已游玩 ${m.played}/${m.total}` },
    ]
})
</script>

<template>
    <!-- gap-px + 底色形成分隔线，任意断点下都整齐 -->
    <dl class="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-base-300 bg-base-300 sm:grid-cols-3 lg:grid-cols-5">
        <div
            v-for="cell in cells"
            :key="cell.label"
            class="bg-base-100 px-3 py-2"
            :class="cell.hero ? 'col-span-2 sm:col-span-1' : ''"
        >
            <dt class="text-[11px] font-medium text-base-content/55">
                {{ cell.label }}
            </dt>
            <dd class="mt-0.5 flex flex-wrap items-baseline gap-x-1.5 tabular-nums">
                <span class="font-mono font-bold text-base-content" :class="cell.hero ? 'text-lg sm:text-[15px]' : 'text-[15px]'">
                    {{ cell.value }}<span v-if="cell.unit" class="text-xs font-medium text-base-content/45">{{ cell.unit }}</span>
                </span>
                <span class="text-[10px] text-base-content/45">{{ cell.sub }}</span>
            </dd>
        </div>
    </dl>
</template>
