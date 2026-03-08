<script setup lang="ts">
const { data: stats, refresh } = await useAdminStats()

function formatMoney(val: string | number) {
    return Number.parseFloat(String(val)).toFixed(2)
}

useHead({ title: '管理面板' })

definePageMeta({
    layout: 'admin',
    middleware: ['require-admin'],
})
</script>

<template>
    <div>
        <div class="flex items-center justify-between mb-6">
            <h1 class="text-2xl font-bold">
                仪表盘
            </h1>
            <button class="btn btn-ghost btn-sm" @click="refresh()">
                <Icon name="mdi:refresh" class="w-4 h-4" />
                刷新
            </button>
        </div>

        <div v-if="stats" class="space-y-6">
            <!-- 核心数据 -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                <AdminStatsCard
                    title="用户总数" :value="stats.total_users"
                    icon="mdi:account-group-outline" color="primary"
                />
                <AdminStatsCard
                    title="订单总数" :value="stats.total_orders"
                    icon="mdi:receipt-text-outline" color="info"
                />
                <AdminStatsCard
                    title="总收入" :value="`¥${formatMoney(stats.total_revenue)}`"
                    icon="mdi:currency-cny" color="success"
                />
                <AdminStatsCard
                    title="工件总数" :value="stats.total_artifacts"
                    icon="mdi:cube-outline" color="accent"
                />
            </div>

            <!-- 订单状态分布 -->
            <div class="bg-base-100 rounded-lg shadow-sm p-4 lg:p-5">
                <h2 class="text-lg font-semibold mb-4">
                    订单状态分布
                </h2>
                <div class="grid grid-cols-3 lg:grid-cols-6 gap-3">
                    <div class="text-center">
                        <div class="text-xl font-bold text-warning">
                            {{ stats.order_breakdown.unpaid }}
                        </div>
                        <div class="text-xs text-base-content/60">
                            待付款
                        </div>
                    </div>
                    <div class="text-center">
                        <div class="text-xl font-bold text-info">
                            {{ stats.order_breakdown.paid }}
                        </div>
                        <div class="text-xs text-base-content/60">
                            已付款
                        </div>
                    </div>
                    <div class="text-center">
                        <div class="text-xl font-bold text-primary">
                            {{ stats.order_breakdown.shipped }}
                        </div>
                        <div class="text-xs text-base-content/60">
                            已发货
                        </div>
                    </div>
                    <div class="text-center">
                        <div class="text-xl font-bold text-success">
                            {{ stats.order_breakdown.success }}
                        </div>
                        <div class="text-xs text-base-content/60">
                            已完成
                        </div>
                    </div>
                    <div class="text-center">
                        <div class="text-xl font-bold text-base-content/40">
                            {{ stats.order_breakdown.canceled }}
                        </div>
                        <div class="text-xs text-base-content/60">
                            已取消
                        </div>
                    </div>
                    <div class="text-center">
                        <div class="text-xl font-bold text-base-content/40">
                            {{ stats.order_breakdown.closed }}
                        </div>
                        <div class="text-xs text-base-content/60">
                            已关闭
                        </div>
                    </div>
                </div>
            </div>

            <!-- 工件状态分布 -->
            <div class="bg-base-100 rounded-lg shadow-sm p-4 lg:p-5">
                <h2 class="text-lg font-semibold mb-4">
                    工件状态分布
                </h2>
                <div class="grid grid-cols-3 lg:grid-cols-6 gap-3">
                    <div class="text-center">
                        <div class="text-xl font-bold text-warning">
                            {{ stats.artifact_breakdown.pending }}
                        </div>
                        <div class="text-xs text-base-content/60">
                            待定
                        </div>
                    </div>
                    <div class="text-center">
                        <div class="text-xl font-bold text-info">
                            {{ stats.artifact_breakdown.in_production }}
                        </div>
                        <div class="text-xs text-base-content/60">
                            制作中
                        </div>
                    </div>
                    <div class="text-center">
                        <div class="text-xl font-bold text-success">
                            {{ stats.artifact_breakdown.completed }}
                        </div>
                        <div class="text-xs text-base-content/60">
                            已完成
                        </div>
                    </div>
                    <div class="text-center">
                        <div class="text-xl font-bold text-primary">
                            {{ stats.artifact_breakdown.activated }}
                        </div>
                        <div class="text-xs text-base-content/60">
                            已激活
                        </div>
                    </div>
                    <div class="text-center">
                        <div class="text-xl font-bold text-error">
                            {{ stats.artifact_breakdown.failed }}
                        </div>
                        <div class="text-xs text-base-content/60">
                            失败
                        </div>
                    </div>
                    <div class="text-center">
                        <div class="text-xl font-bold text-accent">
                            {{ stats.artifact_breakdown.unassigned }}
                        </div>
                        <div class="text-xs text-base-content/60">
                            未分配
                        </div>
                    </div>
                </div>
            </div>

            <!-- 兑换码统计 -->
            <div class="grid grid-cols-2 gap-3 lg:gap-4">
                <AdminStatsCard
                    title="兑换码总数" :value="stats.total_redemptions"
                    icon="mdi:ticket-confirmation-outline" color="info"
                />
                <AdminStatsCard
                    title="未领取兑换码" :value="stats.unclaimed_redemptions"
                    icon="mdi:ticket-outline" color="warning"
                />
            </div>
        </div>
    </div>
</template>
