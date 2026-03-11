<script setup lang="ts">
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

// ── Create / Derive order modal ──────────────────────────────
const showOrderModal = ref(false)
const isDeriving = ref(false)

const orderForm = reactive({
    owner_id: '',
    owner_name: '',
    shipping_name: '',
    shipping_phone: '',
    shipping_address: '',
    override_amount: '',
})

const userPickerRef = ref<{ open: () => void } | null>(null)

function openCreateOrder() {
    isDeriving.value = false
    Object.assign(orderForm, {
        owner_id: '',
        owner_name: '',
        shipping_name: '',
        shipping_phone: '',
        shipping_address: '',
        override_amount: '',
    })
    showOrderModal.value = true
}

function openDeriveOrder(order: any) {
    isDeriving.value = true
    Object.assign(orderForm, {
        owner_id: order.user_id,
        owner_name: order.rel_user?.username || `用户 ${order.user_id.slice(-8)}`,
        shipping_name: order.shipping_name,
        shipping_phone: order.shipping_phone,
        shipping_address: order.shipping_address,
        override_amount: '',
    })
    showOrderModal.value = true
}

function onUserSelected(items: any[]) {
    if (items[0]) {
        orderForm.owner_id = items[0].id
        orderForm.owner_name = items[0].username
    }
}

async function handleSubmitOrder() {
    isProcessing.value = true
    try {
        const body: Record<string, any> = {
            owner_id: orderForm.owner_id,
            shipping_name: orderForm.shipping_name,
            shipping_phone: orderForm.shipping_phone,
            shipping_address: orderForm.shipping_address,
        }
        if (orderForm.override_amount !== '') {
            body.override_amount = Number.parseFloat(orderForm.override_amount)
        }
        await useNuxtApp().$leporid('/api/admin/orders', {
            method: 'POST',
            body,
            showSuccessToast: true,
            successMessage: '订单已创建',
        })
        showOrderModal.value = false
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
        <div class="flex items-center justify-between mb-6">
            <h1 class="text-2xl font-bold">
                订单管理
            </h1>
            <button class="btn btn-primary btn-sm" @click="openCreateOrder">
                <Icon name="mdi:plus" class="w-4 h-4" />
                新建订单
            </button>
        </div>

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
                <option :value="OrderStatus.CANCELED">
                    已取消
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
                                <NuxtLink :to="`/admin/orders/${order.id}`" class="btn btn-accent btn-xs">
                                    详情
                                </NuxtLink>
                                <button class="btn btn-outline btn-xs" @click="openDeriveOrder(order)">
                                    派生
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

        <!-- Create / Derive order modal -->
        <dialog class="modal" :class="{ 'modal-open': showOrderModal }">
            <div class="modal-box max-w-lg max-h-[85dvh] flex flex-col">
                <h3 class="text-lg font-bold shrink-0">
                    {{ isDeriving ? '派生订单' : '新建订单' }}
                </h3>

                <div class="mt-4 space-y-2 overflow-y-auto flex-1 pr-1">
                    <!-- Owner -->
                    <div class="form-control">
                        <div class="label">
                            <span class="label-text">归属用户</span>
                        </div>
                        <div class="flex gap-2">
                            <input
                                :value="orderForm.owner_name || orderForm.owner_id"
                                readonly
                                class="input input-bordered input-sm flex-1 text-xs"
                                :placeholder="orderForm.owner_id ? '' : '点击右侧选择用户'"
                            >
                            <button class="btn btn-accent btn-sm" @click="userPickerRef?.open()">
                                选择
                            </button>
                        </div>
                    </div>

                    <!-- Shipping -->
                    <div class="grid grid-cols-2 gap-2">
                        <label class="form-control">
                            <div class="label">
                                <span class="label-text">收件人</span>
                            </div>
                            <input v-model="orderForm.shipping_name" class="input input-bordered input-sm w-full">
                        </label>
                        <label class="form-control">
                            <div class="label">
                                <span class="label-text">电话</span>
                            </div>
                            <input v-model="orderForm.shipping_phone" class="input input-bordered input-sm w-full">
                        </label>
                    </div>
                    <label class="form-control">
                        <div class="label">
                            <span class="label-text">收件地址</span>
                        </div>
                        <input v-model="orderForm.shipping_address" class="input input-bordered input-sm w-full">
                    </label>

                    <!-- Amount override -->
                    <label class="form-control">
                        <div class="label">
                            <span class="label-text">自定义金额</span>
                            <span class="label-text-alt text-base-content/50">可选，留空则为 ¥0.00</span>
                        </div>
                        <input
                            v-model="orderForm.override_amount"
                            type="number"
                            min="0"
                            step="0.01"
                            class="input input-bordered input-sm w-full"
                            placeholder="留空则金额为 ¥0.00"
                        >
                    </label>
                </div>

                <div class="modal-action shrink-0">
                    <button class="btn btn-ghost btn-sm" @click="showOrderModal = false">
                        取消
                    </button>
                    <button
                        class="btn btn-primary btn-sm"
                        :disabled="isProcessing || !orderForm.owner_id"
                        @click="handleSubmitOrder"
                    >
                        创建
                    </button>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop">
                <button @click="showOrderModal = false">
                    close
                </button>
            </form>
        </dialog>

        <!-- Resource pickers (teleported outside modal stack) -->
        <AdminResourcePicker
            ref="userPickerRef"
            resource-type="user"
            title="选择归属用户"
            @confirm="onUserSelected"
        />
    </div>
</template>
