<script setup lang="ts">
const route = useRoute()
const orderId = route.params.id as string

const dialogStore = useDialogStore()
const { data: order, refresh } = await useLeporid<OrderPublic>(`/api/admin/orders/${orderId}`)
const isProcessing = ref(false)

const editForm = reactive({
    shipping_name: '',
    shipping_phone: '',
    shipping_address: '',
})

watch(() => order.value, (o) => {
    if (o) {
        editForm.shipping_name = o.shipping_name
        editForm.shipping_phone = o.shipping_phone
        editForm.shipping_address = o.shipping_address
    }
}, { immediate: true })

const isEditing = ref(false)

async function handleSave() {
    isProcessing.value = true
    try {
        await useNuxtApp().$leporid(`/api/admin/orders/${orderId}`, {
            method: 'PATCH',
            body: editForm,
            showSuccessToast: true,
            successMessage: '订单已更新',
        })
        isEditing.value = false
        await refresh()
    }
    finally {
        isProcessing.value = false
    }
}

async function handleShip() {
    const sn = await dialogStore.prompt('请输入快递单号：')
    if (!sn)
        return
    isProcessing.value = true
    try {
        await useNuxtApp().$leporid(`/api/admin/orders/${orderId}/ship`, {
            method: 'POST',
            body: { shipping_sn: sn },
            showSuccessToast: true,
            successMessage: '订单已发货',
        })
        await refresh()
    }
    finally {
        isProcessing.value = false
    }
}

async function handleCancel() {
    if (!await dialogStore.confirm('确定取消此订单？此操作不可逆。'))
        return
    isProcessing.value = true
    try {
        await useNuxtApp().$leporid(`/api/admin/orders/${orderId}/cancel`, {
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

function formatDateTime(iso: string | null) {
    return iso ? new Date(iso).toLocaleString() : '-'
}

function formatMoney(val: string | number) {
    return Number.parseFloat(String(val)).toFixed(2)
}

useHead({ title: `订单详情` })

definePageMeta({
    layout: 'admin',
    middleware: ['require-admin'],
})
</script>

<template>
    <div v-if="order">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
                <NuxtLink to="/admin/orders" class="text-sm text-base-content/50 hover:text-base-content">
                    ← 返回订单列表
                </NuxtLink>
                <h1 class="text-2xl font-bold mt-1">
                    订单详情
                </h1>
                <p class="text-xs text-base-content/50 font-mono mt-0.5">
                    {{ order.id }}
                </p>
            </div>
            <div class="flex gap-2">
                <button
                    v-if="order.status === OrderStatus.PAID"
                    class="btn btn-primary btn-sm"
                    :disabled="isProcessing"
                    @click="handleShip"
                >
                    发货
                </button>
                <button
                    v-if="[OrderStatus.UNPAID, OrderStatus.PAID].includes(order.status)"
                    class="btn btn-error btn-sm btn-outline"
                    :disabled="isProcessing"
                    @click="handleCancel"
                >
                    取消订单
                </button>
            </div>
        </div>

        <div class="space-y-4">
            <!-- 订单状态与金额 -->
            <div class="bg-base-100 rounded-lg shadow-sm p-4">
                <h2 class="text-lg font-semibold mb-3">
                    基本信息
                </h2>
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                        <span class="text-base-content/50">状态</span>
                        <div class="mt-1">
                            <AdminStatusBadge :status="order.status" type="order" />
                        </div>
                    </div>
                    <div>
                        <span class="text-base-content/50">支付金额</span>
                        <p class="font-semibold text-lg">
                            ¥{{ formatMoney(order.payment_money) }}
                        </p>
                    </div>
                    <div>
                        <span class="text-base-content/50">商品金额</span>
                        <p>¥{{ formatMoney(order.product_money) }}</p>
                    </div>
                    <div>
                        <span class="text-base-content/50">运费</span>
                        <p>¥{{ formatMoney(order.shipping_money) }}</p>
                    </div>
                </div>

                <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm mt-4">
                    <div>
                        <span class="text-base-content/50">创建时间</span>
                        <p class="text-xs">
                            {{ formatDateTime(order.created_at) }}
                        </p>
                    </div>
                    <div>
                        <span class="text-base-content/50">支付时间</span>
                        <p class="text-xs">
                            {{ formatDateTime(order.paid_at) }}
                        </p>
                    </div>
                    <div>
                        <span class="text-base-content/50">发货时间</span>
                        <p class="text-xs">
                            {{ formatDateTime(order.shipped_at) }}
                        </p>
                    </div>
                    <div>
                        <span class="text-base-content/50">用户ID</span>
                        <p class="text-xs font-mono">
                            {{ order.user_id.slice(-8) }}
                        </p>
                    </div>
                </div>
            </div>

            <!-- 收货信息 -->
            <div class="bg-base-100 rounded-lg shadow-sm p-4">
                <div class="flex items-center justify-between mb-3">
                    <h2 class="text-lg font-semibold">
                        收货信息
                    </h2>
                    <button
                        v-if="!isEditing"
                        class="btn btn-ghost btn-xs"
                        @click="isEditing = true"
                    >
                        编辑
                    </button>
                </div>

                <template v-if="!isEditing">
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div>
                            <span class="text-base-content/50">收件人</span>
                            <p>{{ order.shipping_name }}</p>
                        </div>
                        <div>
                            <span class="text-base-content/50">电话</span>
                            <p>{{ order.shipping_phone }}</p>
                        </div>
                        <div>
                            <span class="text-base-content/50">快递单号</span>
                            <p>{{ order.shipping_sn || '-' }}</p>
                        </div>
                    </div>
                    <div class="mt-3 text-sm">
                        <span class="text-base-content/50">地址</span>
                        <p>{{ order.shipping_address }}</p>
                    </div>
                </template>

                <template v-else>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label class="form-control">
                            <span class="label-text text-sm">收件人</span>
                            <input v-model="editForm.shipping_name" class="input input-bordered input-sm">
                        </label>
                        <label class="form-control">
                            <span class="label-text text-sm">电话</span>
                            <input v-model="editForm.shipping_phone" class="input input-bordered input-sm">
                        </label>
                    </div>
                    <label class="form-control mt-3">
                        <span class="label-text text-sm">地址</span>
                        <input v-model="editForm.shipping_address" class="input input-bordered input-sm">
                    </label>
                    <div class="flex gap-2 mt-3">
                        <button class="btn btn-primary btn-sm" :disabled="isProcessing" @click="handleSave">
                            保存
                        </button>
                        <button class="btn btn-ghost btn-sm" @click="isEditing = false">
                            取消
                        </button>
                    </div>
                </template>
            </div>

            <!-- 订单商品 -->
            <div class="bg-base-100 rounded-lg shadow-sm p-4">
                <h2 class="text-lg font-semibold mb-3">
                    订单商品
                </h2>
                <div class="overflow-x-auto">
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>商品ID</th>
                                <th>数量</th>
                                <th>单价</th>
                                <th>小计</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in order.items" :key="item.id">
                                <td class="font-mono text-xs">
                                    {{ item.product?.name || item.product_id }}
                                </td>
                                <td>{{ item.quantity }}</td>
                                <td>¥{{ formatMoney(item.unit_price) }}</td>
                                <td class="font-semibold">
                                    ¥{{ formatMoney(item.total_price) }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>
