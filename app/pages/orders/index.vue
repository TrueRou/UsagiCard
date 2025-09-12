<template>
    <div class="container mx-auto px-4 py-8">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 class="text-3xl font-bold mb-4 md:mb-0">{{ t('my-orders') }}</h1>

            <!-- 搜索和筛选 -->
            <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <input v-model="searchForm.keyword" type="text" :placeholder="t('search-placeholder')"
                    class="input input-bordered w-full sm:w-64" @keyup.enter="handleSearch" />
                <select v-model="searchForm.status" class="select select-bordered w-full sm:w-40"
                    @change="handleSearch">
                    <option value="">{{ t('all-status') }}</option>
                    <option value="UNPAID">{{ t('status.unpaid') }}</option>
                    <option value="PAID">{{ t('status.paid') }}</option>
                    <option value="SHIPPED">{{ t('status.shipped') }}</option>
                    <option value="SUCCESS">{{ t('status.success') }}</option>
                    <option value="CANCELED">{{ t('status.canceled') }}</option>
                    <option value="CLOSED">{{ t('status.closed') }}</option>
                </select>
                <button @click="handleSearch" class="btn btn-primary">
                    {{ t('search') }}
                </button>
            </div>
        </div>

        <div v-if="orders?.records.length === 0" class="text-center py-16">
            <p class="text-base-content/60 text-lg">{{ t('no-orders') }}</p>
        </div>

        <div v-else class="space-y-4">
            <OrderCard v-for="order in orders?.records" :key="order.id" :order="order" @refresh="refreshOrders" />
        </div>

        <!-- 分页 -->
        <div v-if="orders && orders.totalPage > 1" class="flex justify-center mt-8">
            <div class="join">
                <button class="join-item btn btn-sm" :disabled="searchForm.page_number <= 1"
                    @click="goToPage(searchForm.page_number - 1)">
                    {{ t('prev') }}
                </button>

                <template v-for="page in getPageNumbers()" :key="page">
                    <button v-if="page !== '...'" class="join-item btn btn-sm"
                        :class="{ 'btn-active': page === searchForm.page_number }" @click="goToPage(page as number)">
                        {{ page }}
                    </button>
                    <span v-else class="join-item btn btn-sm btn-disabled">...</span>
                </template>

                <button class="join-item btn btn-sm" :disabled="searchForm.page_number >= (orders?.totalPage || 0)"
                    @click="goToPage(searchForm.page_number + 1)">
                    {{ t('next') }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { OrderPageResponse, OrderSearchRequest } from '~/def'

const { t } = useI18n()

// 搜索表单
const searchForm = reactive<OrderSearchRequest>({
    keyword: "123",
    status: undefined,
    page_number: 1,
    page_size: 10
})

// 获取订单数据
const { data: orders, refresh: refreshOrders } = useLeporid<OrderPageResponse>("/api/orders")

// 搜索处理
const handleSearch = () => {
    searchForm.page_number = 1
    refreshOrders()
}

// 翻页处理
const goToPage = (page: number) => {
    searchForm.page_number = page
    refreshOrders()
}

// 生成页码数组
const getPageNumbers = () => {
    const totalPages = orders.value.totalPage || 0
    const current = searchForm.page_number
    const pages: (number | string)[] = []

    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i)
        }
    } else {
        pages.push(1)

        if (current > 3) {
            pages.push('...')
        }

        const start = Math.max(2, current - 1)
        const end = Math.min(totalPages - 1, current + 1)

        for (let i = start; i <= end; i++) {
            pages.push(i)
        }

        if (current < totalPages - 2) {
            pages.push('...')
        }

        pages.push(totalPages)
    }

    return pages
}

useHead({
    title: t('my-orders')
})
</script>

<i18n lang="yaml">
en-GB:
  my-orders: My Orders
  search-placeholder: Search orders...
  all-status: All Status
  search: Search
  no-orders: No orders found
  prev: Previous
  next: Next
  status:
    unpaid: Unpaid
    paid: Paid
    shipped: Shipped
    success: Completed
    canceled: Canceled
    closed: Closed

zh-CN:
  my-orders: 我的订单
  search-placeholder: 搜索订单...
  all-status: 全部状态
  search: 搜索
  no-orders: 暂无订单
  prev: 上一页
  next: 下一页
  status:
    unpaid: 待付款
    paid: 已付款
    shipped: 已发货
    success: 已完成
    canceled: 已取消
    closed: 已关闭
</i18n>