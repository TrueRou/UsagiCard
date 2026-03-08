<script setup lang="ts">
const dialogStore = useDialogStore()

const searchParams = reactive({
    keyword: '',
    status: undefined as number | undefined,
    user_id: undefined as string | undefined,
    page_number: 1,
    page_size: 20,
})

const { data: orders, refresh } = await useLeporid<PageOrderPublic>('/api/admin/orders', {
    params: searchParams,
})

const isProcessing = ref(false)

function handleSearch() {
    searchParams.page_number = 1
    refresh()
}

function handlePageChange(page: number) {
    searchParams.page_number = page
    refresh()
}

function formatDateTime(iso: string) {
    return new Date(iso).toLocaleString()
}

async function handleShip(orderId: string) {
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

async function handleCancel(orderId: string) {
    if (!await dialogStore.confirm('确定取消此订单？', { danger: true }))
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

useHead({ title: '订单管理' })

definePageMeta({
    layout: 'admin',
    middleware: ['require-admin'],
})
</script>

<template>
    <div>
        <h1 class="text-2xl font-bold mb-6">
            订单管理
        </h1>

        <!-- Filter bar -->
        <AdminFilterBar
            :keyword="searchParams.keyword"
            placeholder="搜索收件人/电话/地址/快递单号"
            @update:keyword="searchParams.keyword = $event"
            @search="handleSearch"
        >
            <select
                v-model.number="searchParams.status"
                class="select select-bordered select-sm w-full sm:w-36"
                @change="handleSearch"
            >
                <option :value="undefined">
                    全部状态
                </option>
                <option :value="OrderStatus.UNPAID">
                    待付款
                </option>
                <option :value="OrderStatus.PAID">
                    已付款
                </option>
                <option :value="OrderStatus.SHIPPED">
                    已发货
                </option>
                <option :value="OrderStatus.SUCCESS">
                    已完成
                </option>
                <option :value="OrderStatus.CANCELED">
                    已取消
                </option>
                <option :value="OrderStatus.CLOSED">
                    已关闭
                </option>
            </select>
        </AdminFilterBar>

        <!-- Table -->
        <div class="overflow-x-auto mt-4">
            <table class="table table-sm">
                <thead>
                    <tr>
                        <th>订单号</th>
                        <th>状态</th>
                        <th>收件人</th>
                        <th>电话</th>
                        <th>金额</th>
                        <th>快递单号</th>
                        <th>创建时间</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="order in orders?.records" :key="order.id">
                        <td>
                            <NuxtLink :to="`/admin/orders/${order.id}`" class="link link-primary text-xs font-mono">
                                {{ order.id.slice(-8) }}
                            </NuxtLink>
                        </td>
                        <td>
                            <AdminStatusBadge :status="order.status" type="order" />
                        </td>
                        <td class="max-w-24 truncate">
                            {{ order.shipping_name }}
                        </td>
                        <td class="text-xs">
                            {{ order.shipping_phone }}
                        </td>
                        <td class="font-semibold">
                            ¥{{ Number.parseFloat(order.payment_money).toFixed(2) }}
                        </td>
                        <td class="text-xs text-base-content/60">
                            {{ order.shipping_sn || '-' }}
                        </td>
                        <td class="text-xs text-base-content/60">
                            {{ formatDateTime(order.created_at) }}
                        </td>
                        <td>
                            <div class="flex gap-1">
                                <NuxtLink :to="`/admin/orders/${order.id}`" class="btn btn-ghost btn-xs">
                                    详情
                                </NuxtLink>
                                <button
                                    v-if="order.status === OrderStatus.PAID"
                                    class="btn btn-primary btn-xs"
                                    :disabled="isProcessing"
                                    @click="handleShip(order.id)"
                                >
                                    发货
                                </button>
                                <button
                                    v-if="[OrderStatus.UNPAID, OrderStatus.PAID].includes(order.status)"
                                    class="btn btn-error btn-xs btn-outline"
                                    :disabled="isProcessing"
                                    @click="handleCancel(order.id)"
                                >
                                    取消
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div v-if="!orders?.records?.length" class="text-center py-12 text-base-content/50">
                暂无订单数据
            </div>
        </div>

        <AdminPagination
            v-if="orders"
            :total-pages="orders.total_page"
            :current-page="searchParams.page_number"
            @update:current-page="handlePageChange"
        />
    </div>
</template>
