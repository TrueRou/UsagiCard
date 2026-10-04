<script setup lang="ts">
import type { ChartEntry, DistributionBucket } from '~/composables/function/MaimaiCN/useMaimaiTypes'
import { computeAnalytics } from '~/composables/function/MaimaiCN/useScoreView'
import BaseModal from '../shared/base-modal.vue'

const props = defineProps<{
    entries: ChartEntry[]
}>()

const open = defineModel<boolean>('open', { default: false })

const analytics = computed(() => open.value ? computeAnalytics(props.entries) : null)

const columns = computed<{ title: string, icon: string, buckets: DistributionBucket[] }[]>(() => analytics.value
    ? [
            { title: 'AP / FC 全连统计', icon: 'mdi:fire', buckets: analytics.value.fc },
            { title: 'FS / FDX 同步统计', icon: 'mdi:account-multiple-outline', buckets: analytics.value.fs },
            { title: 'DX 分星级分布', icon: 'mdi:star-outline', buckets: analytics.value.dxStars },
        ]
    : [])
</script>

<template>
    <BaseModal v-model:open="open" box-class="max-w-3xl">
        <template #header>
            <div>
                <h3 class="text-base font-bold">
                    成绩深度统计看板
                </h3>
                <p v-if="analytics" class="text-xs text-base-content/55">
                    共统计 {{ analytics.metrics.total }} 张谱面 · 已游玩 {{ analytics.metrics.played }} 张
                </p>
            </div>
        </template>

        <div v-if="analytics" class="space-y-4">
            <div class="grid grid-cols-2 gap-3">
                <div class="rounded-lg border border-info/30 bg-info/10 p-3">
                    <div class="text-xs text-base-content/60">
                        平均达成率
                    </div>
                    <div class="font-mono text-xl font-bold text-info">
                        {{ analytics.metrics.played ? `${analytics.metrics.avgAchievement.toFixed(4)}%` : '--' }}
                    </div>
                </div>
                <div class="rounded-lg border border-success/30 bg-success/10 p-3">
                    <div class="text-xs text-base-content/60">
                        总累计游玩次数
                    </div>
                    <div class="font-mono text-xl font-bold text-success">
                        {{ analytics.metrics.playCount }} 次
                    </div>
                </div>
            </div>

            <section>
                <h4 class="mb-2 flex items-center gap-1.5 text-sm font-bold">
                    <Icon name="mdi:trophy-outline" class="h-4 w-4 text-amber-500" />
                    达成率评级阶梯分布
                </h4>
                <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div v-for="bucket in analytics.ranks" :key="bucket.key" class="rounded-lg border border-base-200 bg-base-100 p-2.5">
                        <div class="mb-1.5 flex items-center justify-between gap-2 text-xs">
                            <span class="font-medium">{{ bucket.label }}</span>
                            <span class="font-mono text-base-content/60">{{ bucket.count }} 张（{{ bucket.pct }}%）</span>
                        </div>
                        <div class="h-1.5 overflow-hidden rounded-full bg-base-200">
                            <div class="h-full rounded-full" :class="bucket.color" :style="{ width: `${bucket.pct}%` }" />
                        </div>
                    </div>
                </div>
            </section>

            <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
                <section v-for="column in columns" :key="column.title" class="rounded-lg border border-base-200 bg-base-100 p-3">
                    <h4 class="mb-2 flex items-center gap-1.5 text-xs font-bold">
                        <Icon :name="column.icon" class="h-4 w-4 text-base-content/60" />
                        {{ column.title }}
                    </h4>
                    <ul class="space-y-2">
                        <li v-for="bucket in column.buckets" :key="bucket.key">
                            <div class="mb-1 flex justify-between gap-2 text-[11px]">
                                <span>{{ bucket.label }}</span>
                                <span class="font-mono text-base-content/60">{{ bucket.count }}（{{ bucket.pct }}%）</span>
                            </div>
                            <div class="h-1 overflow-hidden rounded-full bg-base-200">
                                <div class="h-full rounded-full" :class="bucket.color" :style="{ width: `${bucket.pct}%` }" />
                            </div>
                        </li>
                    </ul>
                </section>
            </div>
        </div>
    </BaseModal>
</template>
