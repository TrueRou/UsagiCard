<script setup lang="ts">
const route = useRoute()

const orderId = route.params.id as string // UUID string

const isProcessing = ref(false)

const { data: order, refresh } = await useLeporid<OrderPublic>(`/api/orders/${orderId}`)

// 格式化日期时间
function formatDateTime(isoString: string) {
    return new Date(isoString).toLocaleString()
}

// 根据下单时间计算预计设计锁定日期（距下单最近的 10/20/30 号）
function getNextLockDate(orderCreatedAt: string): Date {
    const created = new Date(orderCreatedAt)
    const year = created.getFullYear()
    const month = created.getMonth()
    const day = created.getDate()

    let lockDay: number
    let lockMonth = month
    let lockYear = year

    if (day < 10) {
        lockDay = 10
    }
    else if (day < 20) {
        lockDay = 20
    }
    else if (day < 30) {
        lockDay = 30
    }
    else {
        lockDay = 10
        lockMonth = month + 1
        if (lockMonth > 11) {
            lockMonth = 0
            lockYear = year + 1
        }
    }
    return new Date(lockYear, lockMonth, lockDay)
}

// 预计锁定日期
const lockDate = computed(() => order.value ? getNextLockDate(order.value.created_at) : null)
// 预计发货日期 = 锁定日 + 5 天
const estimatedShipDate = computed(() => {
    if (!lockDate.value)
        return null
    const d = new Date(lockDate.value)
    d.setDate(d.getDate() + 5)
    return d
})

// 是否展示设计锁定提示：有 PENDING 工件时展示
const hasPendingArtifacts = computed(() => {
    if (!order.value)
        return false
    return order.value.items.some(item => item.artifacts?.some(a => a.status === ArtifactStatus.PENDING))
})

// 判断是否可以取消订单
const canCancelOrder = computed(() => {
    return order.value && [OrderStatus.UNPAID, OrderStatus.PAID].includes(order.value.status)
})

// 判断是否可以支付订单
const canPayOrder = computed(() => {
    return order.value && order.value.status === OrderStatus.UNPAID
})

// 判断是否可以确认收货
const canConfirmOrder = computed(() => {
    return order.value && order.value.status === OrderStatus.SHIPPED
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

// 确认收货
async function handleConfirmOrder() {
    if (!order.value)
        return
    isProcessing.value = true
    try {
        await useNuxtApp().$leporid(`/api/orders/${order.value.id}/confirm`, {
            method: 'POST',
            showSuccessToast: true,
            successMessage: '已确认收货，感谢您的支持！',
        })
        await refresh()
    }
    finally {
        isProcessing.value = false
    }
}

// 工件状态标签
function artifactStatusLabel(status: number): string {
    switch (status) {
        case ArtifactStatus.PENDING: return '等待设计'
        case ArtifactStatus.IN_PRODUCTION: return '生产中'
        case ArtifactStatus.COMPLETED: return '已完成'
        case ArtifactStatus.ACTIVATED: return '已激活'
        default: return '未知'
    }
}

function artifactStatusClass(status: number): string {
    switch (status) {
        case ArtifactStatus.PENDING: return 'badge-warning'
        case ArtifactStatus.IN_PRODUCTION: return 'badge-info'
        case ArtifactStatus.COMPLETED: return 'badge-success'
        case ArtifactStatus.ACTIVATED: return 'badge-success'
        default: return 'badge-ghost'
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
            <!-- 设计引导横幅（有待设计工件时展示） -->
            <div v-if="hasPendingArtifacts && order.status === OrderStatus.PAID" role="alert" class="alert alert-info">
                <Icon name="mdi:pencil-box-outline" class="w-5 h-5 shrink-0" />
                <div>
                    <p class="font-semibold">
                        您的卡片等待设计！
                    </p>
                    <p class="text-sm">
                        请在 <strong>{{ lockDate?.toLocaleDateString() }}</strong> 前完成设计，逾期将按默认模板锁定。
                        预计发货时间：{{ estimatedShipDate?.toLocaleDateString() }}
                    </p>
                </div>
            </div>

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
                                <span v-if="order.paid_at">支付时间: {{ formatDateTime(order.paid_at) }}</span>
                                <span v-if="order.shipped_at">发货时间: {{ formatDateTime(order.shipped_at) }}</span>
                            </div>
                        </div>
                        <div class="flex flex-col items-end gap-2 mt-4 lg:mt-0">
                            <OrderStatusBadge :status="order.status" />
                            <div class="text-2xl font-bold text-primary">
                                ¥{{ Number.parseFloat(order.payment_money).toFixed(2) }}
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
                            class="flex items-start gap-4 p-4 border rounded-lg"
                        >
                            <div class="flex-1 min-w-0">
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
                                <!-- 工件列表 -->
                                <div v-if="item.artifacts?.length" class="mt-3 space-y-2">
                                    <div
                                        v-for="artifact in item.artifacts" :key="artifact.id"
                                        class="flex items-center gap-2"
                                    >
                                        <span class="badge badge-sm" :class="artifactStatusClass(artifact.status)">
                                            {{ artifactStatusLabel(artifact.status) }}
                                        </span>
                                        <NuxtLink
                                            v-if="artifact.status <= ArtifactStatus.IN_PRODUCTION"
                                            :to="`/artifacts/${artifact.id}/designer`"
                                            class="btn btn-xs btn-primary"
                                        >
                                            <Icon name="mdi:pencil" class="w-3 h-3 mr-1" />
                                            {{ artifact.status === ArtifactStatus.PENDING ? '开始设计' : '查看设计' }}
                                        </NuxtLink>
                                        <NuxtLink
                                            v-else
                                            :to="`/artifacts/${artifact.id}`"
                                            class="btn btn-xs btn-ghost"
                                        >
                                            查看
                                        </NuxtLink>
                                    </div>
                                </div>
                            </div>
                            <div class="text-right shrink-0">
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
            <div v-if="canCancelOrder || canPayOrder || canConfirmOrder" class="card bg-base-100 shadow-sm">
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
                            v-if="canConfirmOrder" class="btn btn-success" :disabled="isProcessing"
                            @click="handleConfirmOrder"
                        >
                            <span v-if="isProcessing" class="loading loading-spinner loading-sm" />
                            确认收货
                        </button>
                        <button
                            v-if="canCancelOrder" class="btn btn-error btn-outline" :disabled="isProcessing"
                            @click="handleCancelOrder"
                        >
                            <span v-if="isProcessing" class="loading loading-spinner loading-sm" />
                            取消订单
                        </button>
                    </div>
                    <p v-if="canConfirmOrder" class="text-xs text-base-content/50 mt-2">
                        若您未确认收货，系统将在发货 7 天后自动完成订单。
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>
