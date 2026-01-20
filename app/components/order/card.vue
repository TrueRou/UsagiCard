<script setup lang="ts">
interface Props {
    order: OrderPublic
}

interface Emits {
    (e: 'refresh'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isProcessing = ref(false)

// 格式化日期时间 (ISO string to local date)
function formatDateTime(isoString: string) {
    return new Date(isoString).toLocaleDateString()
}

// 判断是否可以取消订单
const canCancelOrder = computed(() => {
    return [OrderStatus.UNPAID, OrderStatus.PAID].includes(props.order.status)
})

// 判断是否可以支付订单
const canPayOrder = computed(() => {
    return props.order.status === OrderStatus.UNPAID
})

// 支付订单
async function handlePayOrder() {
    isProcessing.value = true
    try {
        await useLeporid(`/orders/${props.order.id}/pay`, {
            method: 'POST',
            showSuccessToast: true,
            successMessage: '支付已发起',
        })
        emit('refresh')
    }
    finally {
        isProcessing.value = false
    }
}

// 取消订单
async function handleCancelOrder() {
    isProcessing.value = true
    try {
        await useLeporid(`/orders/${props.order.id}/cancel`, {
            method: 'POST',
            showSuccessToast: true,
            successMessage: '订单已取消',
        })
        emit('refresh')
    }
    finally {
        isProcessing.value = false
    }
}
</script>

<template>
    <div class="card bg-base-100 shadow-sm border">
        <div class="card-body">
            <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center">
                <!-- 订单基本信息 -->
                <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                        <h3 class="font-semibold text-lg">
                            订单 #{{ order.id.slice(-8) }}
                        </h3>
                        <OrderStatusBadge :status="order.status" />
                    </div>

                    <div class="text-sm text-base-content/70 mb-3">
                        创建时间: {{ formatDateTime(order.created_at) }}
                    </div>

                    <!-- 订单商品摘要 -->
                    <div class="space-y-1">
                        <div v-for="item in order.items.slice(0, 2)" :key="item.id" class="text-sm">
                            {{ item.product?.name || '商品' }} × {{ item.quantity }}
                        </div>
                        <div v-if="order.items.length > 2" class="text-sm text-base-content/60">
                            还有{{ order.items.length - 2 }}件商品
                        </div>
                    </div>
                </div>

                <!-- 价格和操作 -->
                <div class="flex flex-col items-end gap-3 mt-4 lg:mt-0">
                    <div class="text-right">
                        <div class="text-xl font-bold text-primary">
                            ¥{{ Number.parseFloat(order.payment_money).toFixed(2) }}
                        </div>
                    </div>

                    <div class="flex gap-2">
                        <NuxtLink :to="`/orders/${order.id}`" class="btn btn-sm btn-outline">
                            查看详情
                        </NuxtLink>

                        <button
                            v-if="canPayOrder" class="btn btn-sm btn-primary" :disabled="isProcessing"
                            @click="handlePayOrder"
                        >
                            <span v-if="isProcessing" class="loading loading-spinner loading-xs" />
                            立即支付
                        </button>

                        <button
                            v-if="canCancelOrder" class="btn btn-sm btn-error btn-outline"
                            :disabled="isProcessing" @click="handleCancelOrder"
                        >
                            <span v-if="isProcessing" class="loading loading-spinner loading-xs" />
                            取消
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
