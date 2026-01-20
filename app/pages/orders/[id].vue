<script setup lang="ts">
const route = useRoute()

const orderId = route.params.id as string // UUID string

const isProcessing = ref(false)

const { data: order, refresh } = await useLeporid<OrderPublic>(`/api/orders/${orderId}`)

// 格式化日期时间 (ISO string to local datetime)
function formatDateTime(isoString: string) {
    return new Date(isoString).toLocaleString()
}

// 判断是否可以取消订单
const canCancelOrder = computed(() => {
    return order.value && [OrderStatus.UNPAID, OrderStatus.PAID].includes(order.value.status)
})

// 判断是否可以支付订单
const canPayOrder = computed(() => {
    return order.value && order.value.status === OrderStatus.UNPAID
})

// 支付订单
async function handlePayOrder() {
    if (!order.value)
        return

    isProcessing.value = true
    try {
        await useNuxtApp().$leporid(`/api/orders/${order.value.id}/pay`, {
            method: 'POST',
            showSuccessToast: true,
            successMessage: '支付已发起',
        })
        await refresh()
    }
    finally {
        isProcessing.value = false
    }
}

// 取消订单
async function handleCancelOrder() {
    if (!order.value)
        return

    isProcessing.value = true
    try {
        await useNuxtApp().$leporid(`/api/orders/${order.value.id}/cancel`, {
            method: 'POST',
            showSuccessToast: true,
            successMessage: '订单已取消',
        })
        await refresh()
    }
    finally {
        isProcessing.value = false
    }
}

useHead({
    title: computed(() => (order.value ? `订单详情 #${order.value.id.slice(-8)}` : '订单详情')),
})

definePageMeta({
    middleware: ['require-login'],
})
</script>

<template>
    <div class="container mx-auto px-4 py-8">
        <!-- 返回按钮 -->
        <div class="mb-6">
            <NuxtLink to="/orders" class="btn btn-ghost btn-sm">
                <Icon name="mdi:arrow-left" class="w-4 h-4 mr-2" />
                返回订单列表
            </NuxtLink>
        </div>

        <div v-if="order" class="space-y-6">
            <!-- 订单基本信息 -->
            <div class="card bg-base-100 shadow-sm">
                <div class="card-body">
                    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center">
                        <div>
                            <h1 class="text-2xl font-bold mb-2">
                                订单详情 #{{ order.id.slice(-8) }}
                            </h1>
                            <div class="flex flex-wrap gap-4 text-sm text-base-content/70">
                                <span>创建时间: {{ formatDateTime(order.created_at) }}</span>
                                <span v-if="order.paid_at">
                                    支付时间: {{ formatDateTime(order.paid_at) }}
                                </span>
                                <span v-if="order.shipped_at">
                                    发货时间: {{ formatDateTime(order.shipped_at) }}
                                </span>
                            </div>
                        </div>
                        <div class="flex flex-col items-end gap-2 mt-4 lg:mt-0">
                            <OrderStatusBadge :status="order.status" />
                            <div class="text-right">
                                <div class="text-2xl font-bold text-primary">
                                    ¥{{ Number.parseFloat(order.payment_money).toFixed(2) }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 订单项目 -->
            <div class="card bg-base-100 shadow-sm">
                <div class="card-body">
                    <h2 class="card-title mb-4">
                        订单商品
                    </h2>
                    <div class="space-y-4">
                        <div
                            v-for="item in order.items" :key="item.id"
                            class="flex items-center gap-4 p-4 border rounded-lg"
                        >
                            <div class="flex-1">
                                <h3 class="font-semibold">
                                    {{ item.product?.name || '商品' }}
                                </h3>
                                <p class="text-sm text-base-content/70">
                                    {{ item.product?.description || '' }}
                                </p>
                                <div class="flex gap-4 mt-2 text-sm">
                                    <span>单价: ¥{{ Number.parseFloat(item.unit_price).toFixed(2) }}</span>
                                    <span>数量: {{ item.quantity }}</span>
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="font-semibold">
                                    ¥{{ Number.parseFloat(item.total_price).toFixed(2) }}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 价格汇总 -->
                    <div class="divider" />
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span>商品总额</span>
                            <span>¥{{ Number.parseFloat(order.product_money).toFixed(2) }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>运费</span>
                            <span>¥{{ Number.parseFloat(order.shipping_money).toFixed(2) }}</span>
                        </div>
                        <div class="divider my-2" />
                        <div class="flex justify-between text-lg font-bold">
                            <span>总计</span>
                            <span class="text-primary">¥{{ Number.parseFloat(order.payment_money).toFixed(2) }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 收货信息 -->
            <div class="card bg-base-100 shadow-sm">
                <div class="card-body">
                    <h2 class="card-title mb-4">
                        收货信息
                    </h2>
                    <div class="space-y-2">
                        <div><strong>收货人:</strong> {{ order.shipping_name }}</div>
                        <div><strong>联系电话:</strong> {{ order.shipping_phone }}</div>
                        <div><strong>收货地址:</strong> {{ order.shipping_address }}</div>
                        <div v-if="order.shipping_sn">
                            <strong>快递单号:</strong> {{ order.shipping_sn }}
                        </div>
                    </div>
                </div>
            </div>

            <!-- 操作按钮 -->
            <div v-if="canCancelOrder || canPayOrder" class="card bg-base-100 shadow-sm">
                <div class="card-body">
                    <h2 class="card-title mb-4">
                        操作
                    </h2>
                    <div class="flex gap-3">
                        <button
                            v-if="canPayOrder" class="btn btn-primary" :disabled="isProcessing"
                            @click="handlePayOrder"
                        >
                            <span v-if="isProcessing" class="loading loading-spinner loading-sm" />
                            立即支付
                        </button>
                        <button
                            v-if="canCancelOrder" class="btn btn-error btn-outline" :disabled="isProcessing"
                            @click="handleCancelOrder"
                        >
                            <span v-if="isProcessing" class="loading loading-spinner loading-sm" />
                            取消订单
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
