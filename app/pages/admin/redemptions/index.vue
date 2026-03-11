<script setup lang="ts">
const searchParams = reactive({
    claimed: undefined as boolean | undefined,
    platform: undefined as string | undefined,
    page_number: 1,
    page_size: 20,
})

const { data: redemptions, refresh } = await useLeporid<PageAdminRedemptionPublic>('/api/admin/platform/redemptions', {
    params: searchParams,
})

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

// Create redemptions modal
const showCreateModal = ref(false)
const skuPickerRef = ref<any>()
const selectedSku = ref<any | null>(null)
const redemptionCount = ref(1)
const isCreating = ref(false)
const createdCodes = ref<string[]>([])
const shippingName = ref<string>('')
const shippingPhone = ref<string>('')
const shippingAddress = ref<string>('')

function openCreateModal() {
    selectedSku.value = null
    redemptionCount.value = 1
    createdCodes.value = []
    showCreateModal.value = true
}

async function handleCreateRedemptions() {
    if (!selectedSku.value)
        return
    isCreating.value = true
    try {
        const result = await useNuxtApp().$leporid<{ codes: string[], count: number }>('/api/admin/platform/redemptions', {
            method: 'POST',
            body: {
                sku_id: selectedSku.value.id,
                count: redemptionCount.value,
                shipping_name: shippingName.value,
                shipping_phone: shippingPhone.value,
                shipping_address: shippingAddress.value,
            },
        })
        createdCodes.value = result.codes ?? []
        await refresh()
    }
    finally {
        isCreating.value = false
    }
}

function copyAllCodes() {
    navigator.clipboard.writeText(createdCodes.value.join('\n'))
}

// Detail & Delete
const dialogStore = useDialogStore()
const redemptionDetailDialogRef = ref<any>()
const isDeleting = ref(false)

async function handleDelete(id: string) {
    if (!await dialogStore.confirm('确定删除此兑换码？同时会取消关联订单，此操作不可逆。'))
        return
    isDeleting.value = true
    try {
        await useNuxtApp().$leporid(`/api/admin/platform/redemptions/${id}`, {
            method: 'DELETE',
            showSuccessToast: true,
            successMessage: '兑换码已删除',
        })
        await refresh()
    }
    finally {
        isDeleting.value = false
    }
}

useHead({ title: '兑换码管理' })

definePageMeta({
    layout: 'admin',
    middleware: ['require-admin'],
})
</script>

<template>
    <div>
        <div class="flex items-center justify-between mb-6">
            <h1 class="text-2xl font-bold">
                兑换码管理
            </h1>
            <button class="btn btn-primary btn-sm" @click="openCreateModal">
                <Icon name="mdi:plus" class="w-4 h-4" />
                创建兑换码
            </button>
        </div>

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
                        <th>领取时间</th>
                        <th>创建时间</th>
                        <th />
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
                        <td class="text-xs text-base-content/60">
                            {{ formatDateTime(r.claimed_at) }}
                        </td>
                        <td class="text-xs text-base-content/60">
                            {{ formatDateTime(r.created_at) }}
                        </td>
                        <td class="whitespace-nowrap">
                            <button
                                class="btn btn-ghost btn-xs"
                                @click="redemptionDetailDialogRef?.open(r.id)"
                            >
                                详情
                            </button>
                            <button
                                class="btn btn-ghost btn-xs text-error"
                                :disabled="!!r.claimed_at || isDeleting"
                                @click="handleDelete(r.id)"
                            >
                                删除
                            </button>
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

        <!-- Create redemptions modal -->
        <dialog class="modal" :class="{ 'modal-open': showCreateModal }">
            <div class="modal-box max-w-lg">
                <h3 class="text-lg font-bold">
                    创建兑换码
                </h3>

                <!-- Result state -->
                <div v-if="createdCodes.length" class="mt-4 space-y-3">
                    <div class="flex items-center justify-between">
                        <span class="text-sm font-medium text-success">
                            成功生成 {{ createdCodes.length }} 个兑换码
                        </span>
                        <button class="btn btn-ghost btn-xs" @click="copyAllCodes">
                            <Icon name="mdi:content-copy" class="w-3.5 h-3.5" />
                            复制全部
                        </button>
                    </div>
                    <div class="bg-base-200 rounded-lg p-3 max-h-52 overflow-y-auto">
                        <p v-for="code in createdCodes" :key="code" class="font-mono text-xs py-0.5">
                            {{ code }}
                        </p>
                    </div>
                    <div class="modal-action pt-0">
                        <button class="btn btn-primary btn-sm" @click="showCreateModal = false">
                            关闭
                        </button>
                    </div>
                </div>

                <!-- Create form -->
                <div v-else class="mt-4 space-y-4">
                    <p class="text-sm text-base-content/70">
                        选择关联的 SKU 并指定生成数量，系统将自动随机生成兑换码。
                    </p>
                    <div>
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend">
                                关联 SKU
                            </legend>
                            <div class="flex items-center gap-3">
                                <button
                                    class="btn btn-outline btn-sm"
                                    type="button"
                                    @click="skuPickerRef?.open(selectedSku ? [selectedSku] : [])"
                                >
                                    <Icon name="mdi:package-variant" class="w-4 h-4" />
                                    选择 SKU
                                </button>
                                <span v-if="selectedSku" class="text-sm">
                                    {{ selectedSku.plan_id }}
                                    <span class="text-base-content/50 text-xs ml-1">{{ selectedSku.platform }}</span>
                                </span>
                                <span v-else class="text-sm text-base-content/40">未选择</span>
                            </div>
                        </fieldset>
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend">
                                生成数量
                            </legend>
                            <input v-model.number="redemptionCount" type="text" class="input">
                        </fieldset>
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend">
                                收件人信息（选填）
                            </legend>
                            <input v-model="shippingName" type="text" placeholder="收件人姓名" class="input mb-2">
                            <input v-model="shippingPhone" type="text" placeholder="收件人电话" class="input mb-2">
                            <textarea v-model="shippingAddress" placeholder="收件人地址" class="textarea" />
                        </fieldset>
                    </div>

                    <div class="modal-action pt-0">
                        <button class="btn btn-outline btn-sm" @click="showCreateModal = false">
                            取消
                        </button>
                        <button
                            class="btn btn-primary btn-sm"
                            :disabled="isCreating || !selectedSku"
                            @click="handleCreateRedemptions"
                        >
                            <span v-if="isCreating" class="loading loading-spinner loading-xs" />
                            生成兑换码
                        </button>
                    </div>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop">
                <button @click="showCreateModal = false">
                    close
                </button>
            </form>
        </dialog>

        <!-- SKU picker -->
        <AdminResourcePicker
            ref="skuPickerRef"
            resource-type="sku"
            :multiple="false"
            title="选择 SKU"
            @confirm="items => { if (items[0]) selectedSku = items[0] }"
        />

        <AdminRedemptionDetail ref="redemptionDetailDialogRef" @saved="refresh" />
    </div>
</template>
