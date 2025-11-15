<script setup lang="ts">
// 搜索表单
const searchForm = reactive<OrderSearchRequest>({
    keyword: '123',
    status: undefined,
    page_number: 1,
    page_size: 10,
})

// 获取订单数据
const { data: orders, refresh: refreshOrders } = await useLeporid<OrderPageResponse>('/api/orders')

// 搜索处理
function handleSearch() {
    searchForm.page_number = 1
    refreshOrders()
}

// 翻页处理
function goToPage(page: number) {
    searchForm.page_number = page
    refreshOrders()
}

// 生成页码数组
function getPageNumbers() {
    const totalPages = orders.value?.totalPage || 0
    const current = searchForm.page_number
    const pages: (number | string)[] = []

    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i)
        }
    }
    else {
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
    title: '我的订单',
})

definePageMeta({
    middleware: ['require-login'],
})
</script>

<template>
    <div class="container mx-auto px-4 py-8">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 class="text-3xl font-bold mb-4 md:mb-0">
                我的订单
            </h1>

            <!-- 搜索和筛选 -->
            <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <input
                    v-model="searchForm.keyword" type="text" placeholder="搜索订单..."
                    class="input input-bordered w-full sm:w-64" @keyup.enter="handleSearch"
                >
                <select
                    v-model="searchForm.status" class="select select-bordered w-full sm:w-40"
                    @change="handleSearch"
                >
                    <option value="">
                        全部状态
                    </option>
                    <option value="UNPAID">
                        待付款
                    </option>
                    <option value="PAID">
                        已付款
                    </option>
                    <option value="SHIPPED">
                        已发货
                    </option>
                    <option value="SUCCESS">
                        已完成
                    </option>
                    <option value="CANCELED">
                        已取消
                    </option>
                    <option value="CLOSED">
                        已关闭
                    </option>
                </select>
                <button class="btn btn-primary" @click="handleSearch">
                    搜索
                </button>
            </div>
        </div>

        <div v-if="orders?.records && orders?.records.length === 0" class="text-center py-16">
            <p class="text-base-content/60 text-lg">
                暂无订单
            </p>
        </div>

        <div v-else class="space-y-4">
            <OrderCard v-for="order in orders?.records" :key="order.id" :order="order" @refresh="refreshOrders" />
        </div>

        <!-- 分页 -->
        <div v-if="orders && orders.totalPage > 1" class="flex justify-center mt-8">
            <div class="join">
                <button
                    class="join-item btn btn-sm" :disabled="searchForm.page_number <= 1"
                    @click="goToPage(searchForm.page_number - 1)"
                >
                    上一页
                </button>

                <template v-for="page in getPageNumbers()" :key="page">
                    <button
                        v-if="page !== '...'" class="join-item btn btn-sm"
                        :class="{ 'btn-active': page === searchForm.page_number }" @click="goToPage(page as number)"
                    >
                        {{ page }}
                    </button>
                    <span v-else class="join-item btn btn-sm btn-disabled">...</span>
                </template>

                <button
                    class="join-item btn btn-sm" :disabled="searchForm.page_number >= (orders?.totalPage || 0)"
                    @click="goToPage(searchForm.page_number + 1)"
                >
                    下一页
                </button>
            </div>
        </div>
    </div>
</template>
