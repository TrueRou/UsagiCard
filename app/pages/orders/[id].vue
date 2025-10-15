<template>
    <div class="container mx-auto px-4 py-8">
        <!-- 返回按钮 -->
        <div class="mb-6">
            <NuxtLink to="/orders" class="btn btn-ghost btn-sm">
                <Icon name="mdi:arrow-left" class="w-4 h-4 mr-2" />
                {{ t('back-to-orders') }}
            </NuxtLink>
        </div>

        <div v-if="order" class="space-y-6">
            <!-- 订单基本信息 -->
            <div class="card bg-base-100 shadow-sm">
                <div class="card-body">
                    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center">
                        <div>
                            <h1 class="text-2xl font-bold mb-2">
                                {{ t('order-detail') }} #{{ order.sn }}
                            </h1>
                            <div class="flex flex-wrap gap-4 text-sm text-base-content/70">
                                <span>{{ t('created-at') }}: {{ formatDateTime(order.created_at) }}</span>
                                <span v-if="order.paid_at">
                                    {{ t('paid-at') }}: {{ formatDateTime(order.paid_at) }}
                                </span>
                                <span v-if="order.shipped_at">
                                    {{ t('shipped-at') }}: {{ formatDateTime(order.shipped_at) }}
                                </span>
                            </div>
                        </div>
                        <div class="flex flex-col items-end gap-2 mt-4 lg:mt-0">
                            <OrderStatusBadge :status="order.status" />
                            <div class="text-right">
                                <div class="text-2xl font-bold text-primary">
                                    ¥{{ order.payment_money.toFixed(2) }}
                                </div>
                                <div class="text-sm text-base-content/70">
                                    {{ t('payment-method') }}: {{ t(`payment.${order.payment_method.toLowerCase()}`) }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 订单项目 -->
            <div class="card bg-base-100 shadow-sm">
                <div class="card-body">
                    <h2 class="card-title mb-4">{{ t('order-items') }}</h2>
                    <div class="space-y-4">
                        <div v-for="item in order.items" :key="item.id"
                            class="flex items-center gap-4 p-4 border rounded-lg">
                            <div class="flex-1">
                                <h3 class="font-semibold">{{ item.product.name }}</h3>
                                <p class="text-sm text-base-content/70">{{ item.product.description }}</p>
                                <div class="flex gap-4 mt-2 text-sm">
                                    <span>{{ t('unit-price') }}: ¥{{ item.unit_price.toFixed(2) }}</span>
                                    <span>{{ t('quantity') }}: {{ item.quantity }}</span>
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="font-semibold">¥{{ item.total_price.toFixed(2) }}</div>
                            </div>
                        </div>
                    </div>

                    <!-- 价格汇总 -->
                    <div class="divider"></div>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span>{{ t('product-money') }}</span>
                            <span>¥{{ order.product_money.toFixed(2) }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>{{ t('shipping-money') }}</span>
                            <span>¥{{ order.shipping_money.toFixed(2) }}</span>
                        </div>
                        <div class="divider my-2"></div>
                        <div class="flex justify-between text-lg font-bold">
                            <span>{{ t('total-payment') }}</span>
                            <span class="text-primary">¥{{ order.payment_money.toFixed(2) }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 收货信息 -->
            <div class="card bg-base-100 shadow-sm">
                <div class="card-body">
                    <h2 class="card-title mb-4">{{ t('shipping-info') }}</h2>
                    <div class="space-y-2">
                        <div><strong>{{ t('recipient') }}:</strong> {{ order.shipping_name }}</div>
                        <div><strong>{{ t('phone') }}:</strong> {{ order.shipping_phone }}</div>
                        <div><strong>{{ t('address') }}:</strong> {{ order.shipping_address }}</div>
                        <div v-if="order.shipping_sn">
                            <strong>{{ t('tracking-number') }}:</strong> {{ order.shipping_sn }}
                        </div>
                    </div>
                </div>
            </div>

            <!-- 操作按钮 -->
            <div v-if="canCancelOrder || canPayOrder" class="card bg-base-100 shadow-sm">
                <div class="card-body">
                    <h2 class="card-title mb-4">{{ t('actions') }}</h2>
                    <div class="flex gap-3">
                        <button v-if="canPayOrder" @click="handlePayOrder" class="btn btn-primary"
                            :disabled="isProcessing">
                            <span v-if="isProcessing" class="loading loading-spinner loading-sm"></span>
                            {{ t('pay-now') }}
                        </button>
                        <button v-if="canCancelOrder" @click="handleCancelOrder" class="btn btn-error btn-outline"
                            :disabled="isProcessing">
                            <span v-if="isProcessing" class="loading loading-spinner loading-sm"></span>
                            {{ t('cancel-order') }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { OrderResponse } from '~~/shared/types/order'

const { t } = useI18n()
const route = useRoute()

const orderId = parseInt(route.params.id as string)

const isProcessing = ref(false)

const { data: order, refresh } = await useLeporid<OrderResponse>(`/api/orders/${orderId}`)

// 格式化日期时间
const formatDateTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString()
}

// 判断是否可以取消订单
const canCancelOrder = computed(() => {
    return order.value && [0, 1].includes(order.value.status) // UNPAID 状态可以取消
})

// 判断是否可以支付订单
const canPayOrder = computed(() => {
    return order.value && order.value.status === 1 // UNPAID 状态可以支付
})

// 支付订单
const handlePayOrder = async () => {
    if (!order.value) return

    isProcessing.value = true
    try {
        await useNuxtApp().$leporid('/api/orders/pay', {
            method: 'POST',
            query: { orderSn: order.value.sn },
            showSuccessToast: true,
            successMessage: t('payment-initiated')
        })
        await refresh()
    } finally {
        isProcessing.value = false
    }
}

// 取消订单
const handleCancelOrder = async () => {
    if (!order.value) return

    if (!confirm(t('confirm-cancel-order'))) return

    isProcessing.value = true
    try {
        await useNuxtApp().$leporid(`/api/orders/${order.value.id}/cancel`, {
            method: 'POST',
            showSuccessToast: true,
            successMessage: t('order-canceled')
        })
        await refresh()
    } finally {
        isProcessing.value = false
    }
}

useHead({
    title: computed(() => order.value ? t('order-detail') + ' #' + order.value.sn : t('order-detail'))
})

definePageMeta({
    middleware: ['auth']
})
</script>

<i18n lang="yaml">
en-GB:
  back-to-orders: Back to Orders
  order-detail: Order Detail
  order-not-found: Order not found
  created-at: Created
  paid-at: Paid
  shipped-at: Shipped
  payment-method: Payment Method
  order-items: Order Items
  unit-price: Unit Price
  quantity: Quantity
  product-money: Product Total
  shipping-money: Shipping Fee
  total-payment: Total Payment
  shipping-info: Shipping Information
  recipient: Recipient
  phone: Phone
  address: Address
  tracking-number: Tracking Number
  actions: Actions
  pay-now: Pay Now
  cancel-order: Cancel Order
  payment-initiated: Payment initiated
  order-canceled: Order canceled
  confirm-cancel-order: Are you sure you want to cancel this order?
  payment:
    afdian: Afdian

zh-CN:
  back-to-orders: 返回订单列表
  order-detail: 订单详情
  order-not-found: 订单未找到
  created-at: 创建时间
  paid-at: 支付时间
  shipped-at: 发货时间
  payment-method: 支付方式
  order-items: 订单商品
  unit-price: 单价
  quantity: 数量
  product-money: 商品总额
  shipping-money: 运费
  total-payment: 总计
  shipping-info: 收货信息
  recipient: 收货人
  phone: 联系电话
  address: 收货地址
  tracking-number: 快递单号
  actions: 操作
  pay-now: 立即支付
  cancel-order: 取消订单
  payment-initiated: 支付已发起
  order-canceled: 订单已取消
  confirm-cancel-order: 确定要取消这个订单吗？
  payment:
    afdian: 爱发电
</i18n>