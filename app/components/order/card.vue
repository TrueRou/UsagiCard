<script setup lang="ts">
interface Props {
    order: OrderResponse
}

interface Emits {
    (e: 'refresh'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()

const isProcessing = ref(false)

// 格式化日期时间
function formatDateTime(timestamp: number) {
    return new Date(timestamp * 1000).toLocaleDateString()
}

// 判断是否可以取消订单
const canCancelOrder = computed(() => {
    return [0, 1].includes(props.order.status) // UNPAID 状态可以取消
})

// 判断是否可以支付订单
const canPayOrder = computed(() => {
    return props.order.status === 1 // UNPAID 状态可以支付
})

// 支付订单
async function handlePayOrder() {
    isProcessing.value = true
    try {
        await useLeporid('/orders/pay', {
            method: 'POST',
            query: { orderSn: props.order.sn },
            showSuccessToast: true,
            successMessage: t('payment-initiated'),
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
            successMessage: t('order-canceled'),
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
                            {{ t('order') }} #{{ order.sn }}
                        </h3>
                        <OrderStatusBadge :status="order.status" />
                    </div>

                    <div class="text-sm text-base-content/70 mb-3">
                        {{ t('created-at') }}: {{ formatDateTime(order.created_at) }}
                    </div>

                    <!-- 订单商品摘要 -->
                    <div class="space-y-1">
                        <div v-for="item in order.items.slice(0, 2)" :key="item.id" class="text-sm">
                            {{ item.product.name }} × {{ item.quantity }}
                        </div>
                        <div v-if="order.items.length > 2" class="text-sm text-base-content/60">
                            {{ t('and-more-items', { count: order.items.length - 2 }) }}
                        </div>
                    </div>
                </div>

                <!-- 价格和操作 -->
                <div class="flex flex-col items-end gap-3 mt-4 lg:mt-0">
                    <div class="text-right">
                        <div class="text-xl font-bold text-primary">
                            ¥{{ order.payment_money.toFixed(2) }}
                        </div>
                        <div class="text-sm text-base-content/70">
                            {{ t('payment-method') }}: {{ t(`payment.${order.payment_method.toLowerCase()}`) }}
                        </div>
                    </div>

                    <div class="flex gap-2">
                        <NuxtLink :to="`/orders/${order.id}`" class="btn btn-sm btn-outline">
                            {{ t('view-detail') }}
                        </NuxtLink>

                        <button
                            v-if="canPayOrder" class="btn btn-sm btn-primary" :disabled="isProcessing"
                            @click="handlePayOrder"
                        >
                            <span v-if="isProcessing" class="loading loading-spinner loading-xs" />
                            {{ t('pay-now') }}
                        </button>

                        <button
                            v-if="canCancelOrder" class="btn btn-sm btn-error btn-outline"
                            :disabled="isProcessing" @click="handleCancelOrder"
                        >
                            <span v-if="isProcessing" class="loading loading-spinner loading-xs" />
                            {{ t('cancel') }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<i18n lang="yaml">
en-GB:
  order: Order
  created-at: Created
  and-more-items: and {count} more item(s)
  payment-method: Payment Method
  view-detail: View Detail
  pay-now: Pay Now
  cancel: Cancel
  payment-initiated: Payment initiated
  order-canceled: Order canceled
  confirm-cancel-order: Are you sure you want to cancel this order?
  payment:
    afdian: Afdian

zh-CN:
  order: 订单
  created-at: 创建时间
  and-more-items: 还有{count}件商品
  payment-method: 支付方式
  view-detail: 查看详情
  pay-now: 立即支付
  cancel: 取消
  payment-initiated: 支付已发起
  order-canceled: 订单已取消
  confirm-cancel-order: 确定要取消这个订单吗？
  payment:
    afdian: 爱发电
</i18n>
