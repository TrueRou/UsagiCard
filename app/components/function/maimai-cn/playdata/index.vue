<script setup lang="ts">
import type { UserDataSnapshot, UserRegionSnapshot } from '~/composables/function/MaimaiCN/useMaimaiTypes'
import { useMaimaiUserData, useMaimaiUserRegion } from '~/composables/function/MaimaiCN/useMaimaiUserData'
import OverviewStats from './components/overview-stats.vue'

const props = defineProps<{
    artifactId: string
}>()
const TrendCharts = defineAsyncComponent(() => import('./components/trend-charts.vue'))

const { userData } = await useMaimaiUserData(props.artifactId)
const { regionData } = await useMaimaiUserRegion(props.artifactId)

const snapshot = computed<UserDataSnapshot>(() => (userData.value?.snapshot as UserDataSnapshot) ?? {})
const regionSnapshot = computed<UserRegionSnapshot>(() => (regionData.value?.snapshot as UserRegionSnapshot) ?? {})
const hasData = computed(() => userData.value?.version != null)
</script>

<template>
    <div>
        <template v-if="hasData">
            <ClientOnly>
                <OverviewStats :snapshot="snapshot" :region-snapshot="regionSnapshot" />
                <template #fallback>
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                        <div class="skeleton h-72 w-full rounded-xl" />
                        <div class="skeleton h-72 w-full rounded-xl" />
                        <div class="skeleton h-72 w-full rounded-xl" />
                        <div class="skeleton h-72 w-full rounded-xl" />
                    </div>
                </template>
            </ClientOnly>

            <ClientOnly>
                <TrendCharts :artifact-id="artifactId" :region-snapshot="regionSnapshot" />
                <template #fallback>
                    <div class="skeleton h-64 w-full rounded-xl mb-6" />
                </template>
            </ClientOnly>
        </template>

        <div v-else class="text-center py-12">
            <p class="text-gray-500 dark:text-gray-400 mb-2">
                暂无游玩数据
            </p>
            <p class="text-sm text-gray-400 dark:text-gray-500">
                请先前往「数据更新」同步您的游玩数据
            </p>
        </div>
    </div>
</template>
