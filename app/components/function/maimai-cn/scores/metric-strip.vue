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
        },
        { label: 'SSS+', value: `${m.sssp}/${m.total}`, sub: `占比 ${pct(m.sssp)}` },
        { label: 'SSS 及以上', value: `${m.sss}/${m.total}`, sub: `占比 ${pct(m.sss)}` },
        { label: 'AP / AP+', value: `${m.ap}/${m.total}`, sub: `FC 及以上 ${m.fc}/${m.total}` },
        { label: '总游玩次数', value: `${m.playCount} 次`, sub: `已游玩 ${m.played}/${m.total}` },
    ]
})
</script>

<template>
    <section class="overflow-x-auto rounded-lg border border-base-300 bg-base-100 shadow-xs scrollbar-thin">
        <dl class="grid min-w-[620px] grid-cols-5 lg:min-w-0">
            <div
                v-for="cell in cells"
                :key="cell.label"
                class="border-r border-base-200 px-3 py-2.5 last:border-r-0"
            >
                <dt class="text-[11px] font-medium text-base-content/55">
                    {{ cell.label }}
                </dt>
                <dd class="mt-0.5 flex flex-wrap items-baseline gap-x-1.5">
                    <span class="font-mono text-[15px] font-bold text-base-content">{{ cell.value }}</span>
                    <span class="text-[10px] text-base-content/45">{{ cell.sub }}</span>
                </dd>
            </div>
        </dl>
    </section>
</template>
