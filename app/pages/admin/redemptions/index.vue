<script setup lang="ts">
const searchParams = reactive({
    claimed: undefined as boolean | undefined,
    platform: undefined as string | undefined,
    page_number: 1,
    page_size: 20,
})

const { data: redemptions, refresh } = await useAdminRedemptions(toRef(() => searchParams))

function handleSearch() {
    searchParams.page_number = 1
    refresh()
}

function handlePageChange(page: number) {
    searchParams.page_number = page
    refresh()
}

function formatDateTime(iso: string | null) {
    return iso ? new Date(iso).toLocaleString() : '-'
}

useHead({ title: '兑换码管理' })

definePageMeta({
    layout: 'admin',
    middleware: ['require-admin'],
})
</script>

<template>
    <div>
        <h1 class="text-2xl font-bold mb-6">
            兑换码管理
        </h1>

        <div class="flex flex-col sm:flex-row gap-3 w-full mb-4">
            <select
                v-model="searchParams.claimed"
                class="select select-bordered select-sm w-full sm:w-36"
                @change="handleSearch"
            >
                <option :value="undefined">
                    全部状态
                </option>
                <option :value="true">
                    已领取
                </option>
                <option :value="false">
                    未领取
                </option>
            </select>
            <input
                v-model="searchParams.platform"
                type="text"
                placeholder="平台标识"
                class="input input-bordered input-sm w-full sm:w-40"
                @keyup.enter="handleSearch"
            >
            <button class="btn btn-primary btn-sm" @click="handleSearch">
                筛选
            </button>
        </div>

        <div class="overflow-x-auto">
            <table class="table table-sm">
                <thead>
                    <tr>
                        <th>兑换码</th>
                        <th>平台</th>
                        <th>状态</th>
                        <th>预设商品</th>
                        <th>收件人</th>
                        <th>领取时间</th>
                        <th>创建时间</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="r in redemptions?.records" :key="r.id">
                        <td class="font-mono text-xs">
                            {{ r.code }}
                        </td>
                        <td class="text-sm">
                            {{ r.platform }}
                        </td>
                        <td>
                            <span v-if="r.claimed_at" class="badge badge-sm badge-success">已领取</span>
                            <span v-else class="badge badge-sm badge-warning">未领取</span>
                        </td>
                        <td class="text-sm max-w-32 truncate">
                            {{ r.preset?.product_name || '-' }}
                        </td>
                        <td class="text-sm">
                            {{ r.shipping_name || '-' }}
                        </td>
                        <td class="text-xs text-base-content/60">
                            {{ formatDateTime(r.claimed_at) }}
                        </td>
                        <td class="text-xs text-base-content/60">
                            {{ formatDateTime(r.created_at) }}
                        </td>
                    </tr>
                </tbody>
            </table>

            <div v-if="!redemptions?.records?.length" class="text-center py-12 text-base-content/50">
                暂无兑换码数据
            </div>
        </div>

        <AdminPagination
            v-if="redemptions"
            :total-pages="redemptions.total_page"
            :current-page="searchParams.page_number"
            @update:current-page="handlePageChange"
        />
    </div>
</template>
