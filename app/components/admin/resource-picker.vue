<script setup lang="ts">
type ResourceType = 'product' | 'artifact' | 'preset' | 'sku' | 'user' | 'material' | 'type'

interface ResourceConfig {
    url: string
    label: string
    displayFn: (item: any) => string
    subtitleFn: (item: any) => string
}

const props = withDefaults(defineProps<{
    resourceType: ResourceType
    multiple?: boolean
    title?: string
}>(), {
    multiple: false,
})

const emit = defineEmits<{
    confirm: [items: any[]]
}>()

const show = ref(false)
const isLoading = ref(false)
const records = ref<any[]>([])
const totalPages = ref(1)
const currentPage = ref(1)
const keyword = ref('')
const selected = ref(new Map<string, any>())

// Artifact-specific status filter
const artifactStatusFilter = ref<number | ''>('')
const artifactStatusOptions = [
    { value: -1, label: '失败' },
    { value: 0, label: '待定' },
    { value: 1, label: '制作中' },
    { value: 2, label: '已完成' },
    { value: 3, label: '已激活' },
]

function artifactStatusText(status: number): string {
    const m: Record<string, string> = { '-1': '失败', '0': '待定', '1': '制作中', '2': '已完成', '3': '已激活' }
    return m[String(status)] ?? String(status)
}

const resourceConfigs: Record<ResourceType, ResourceConfig> = {
    product: {
        url: '/api/admin/orders/products',
        label: '商品',
        displayFn: item => item.name,
        subtitleFn: item => `¥${Number.parseFloat(item.price).toFixed(2)}  ·  ${item.id.slice(-8)}`,
    },
    artifact: {
        url: '/api/artifacts',
        label: '工件',
        displayFn: item => item.id.slice(-8),
        subtitleFn: item => `${item.product?.name || item.product_id?.slice(-8) || ''}  ·  ${artifactStatusText(item.status)}`,
    },
    preset: {
        url: '/api/admin/platform/presets',
        label: '平台预设',
        displayFn: item => item.product_name,
        subtitleFn: item => item.product_description || item.id.slice(-8),
    },
    sku: {
        url: '/api/admin/platform/skus',
        label: 'SKU',
        displayFn: item => `${item.platform}  ·  ${item.plan_id}`,
        subtitleFn: item => item.preset?.product_name || item.preset_id?.slice(-8) || '',
    },
    user: {
        url: '/api/admin/users',
        label: '用户',
        displayFn: item => item.username,
        subtitleFn: item => item.email,
    },
    material: {
        url: '/api/admin/platform/product-materials',
        label: '材料',
        displayFn: item => item.name,
        subtitleFn: item => `${item.description}  ·  +¥${item.price_modifier}`,
    },
    type: {
        url: '/api/admin/platform/product-types',
        label: '商品类型',
        displayFn: item => item.name,
        subtitleFn: item => item.description,
    },
}

const config = computed(() => resourceConfigs[props.resourceType])
const modalTitle = computed(() => props.title ?? `选择${config.value.label}`)

async function fetchData() {
    isLoading.value = true
    try {
        const params: Record<string, any> = { page_number: currentPage.value, page_size: 10 }
        if (keyword.value.trim())
            params.keyword = keyword.value.trim()
        if (props.resourceType === 'artifact' && artifactStatusFilter.value !== '')
            params.status = artifactStatusFilter.value
        const result = await useNuxtApp().$leporid<any>(config.value.url, { params })
        records.value = result.records ?? []
        totalPages.value = result.total_page ?? 1
    }
    finally {
        isLoading.value = false
    }
}

function open(preSelected?: any[]) {
    selected.value = new Map((preSelected ?? []).map((item: any) => [item.id, item]))
    show.value = true
    keyword.value = ''
    artifactStatusFilter.value = ''
    currentPage.value = 1
    fetchData()
}

function handleSearch() {
    currentPage.value = 1
    fetchData()
}

function handlePageChange(page: number) {
    currentPage.value = page
    fetchData()
}

function toggleItem(item: any) {
    if (props.multiple) {
        if (selected.value.has(item.id)) {
            selected.value.delete(item.id)
        }
        else {
            selected.value.set(item.id, item)
        }
        // trigger reactivity
        selected.value = new Map(selected.value)
    }
    else {
        if (selected.value.has(item.id)) {
            selected.value = new Map()
        }
        else {
            selected.value = new Map([[item.id, item]])
        }
    }
}

function isSelected(item: any) {
    return selected.value.has(item.id)
}

function handleConfirm() {
    emit('confirm', Array.from(selected.value.values()))
    show.value = false
}

const selectedList = computed(() => Array.from(selected.value.values()))

defineExpose({ open })
</script>

<template>
    <dialog class="modal" :class="{ 'modal-open': show }">
        <div class="modal-box max-w-lg flex flex-col max-h-[80dvh]">
            <!-- Header -->
            <div class="flex items-center justify-between mb-4 shrink-0">
                <h3 class="text-lg font-bold">
                    {{ modalTitle }}
                </h3>
                <button class="btn btn-ghost btn-sm btn-circle" @click="show = false">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M18 6 6 18M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <!-- Search -->
            <div class="flex gap-2 mb-3 shrink-0">
                <select
                    v-if="resourceType === 'artifact'"
                    v-model="artifactStatusFilter"
                    class="select select-bordered select-sm w-24 shrink-0"
                    @change="handleSearch"
                >
                    <option value="">
                        全部
                    </option>
                    <option v-for="opt in artifactStatusOptions" :key="opt.value" :value="opt.value">
                        {{ opt.label }}
                    </option>
                </select>
                <input
                    v-model="keyword"
                    type="text"
                    class="input input-bordered input-sm flex-1"
                    placeholder="搜索..."
                    @keyup.enter="handleSearch"
                >
                <button class="btn btn-accent btn-sm" @click="handleSearch">
                    搜索
                </button>
            </div>

            <!-- List -->
            <div class="flex-1 overflow-y-auto min-h-0">
                <div v-if="isLoading" class="flex justify-center py-8">
                    <span class="loading loading-spinner loading-sm" />
                </div>
                <div v-else-if="!records.length" class="text-center py-8 text-base-content/50 text-sm">
                    暂无数据
                </div>
                <div v-else class="space-y-1">
                    <button
                        v-for="item in records"
                        :key="item.id"
                        class="w-full text-left px-3 py-2 rounded-lg transition-colors border"
                        :class="isSelected(item)
                            ? 'border-accent bg-accent/10 text-accent'
                            : 'border-transparent hover:bg-base-200'"
                        @click="toggleItem(item)"
                    >
                        <div class="flex items-center gap-2">
                            <div v-if="multiple" class="shrink-0">
                                <div
                                    class="w-4 h-4 rounded border-2 flex items-center justify-center"
                                    :class="isSelected(item) ? 'border-accent bg-accent' : 'border-base-content/30'"
                                >
                                    <svg v-if="isSelected(item)" xmlns="http://www.w3.org/2000/svg" class="w-2.5 h-2.5 text-accent-content" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="m5 13 4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
                            <div class="min-w-0 flex-1">
                                <p class="text-sm font-medium truncate">
                                    {{ config.displayFn(item) }}
                                </p>
                                <p class="text-xs truncate" :class="isSelected(item) ? 'text-accent/70' : 'text-base-content/50'">
                                    {{ config.subtitleFn(item) }}
                                </p>
                            </div>
                            <div v-if="!multiple && isSelected(item)" class="shrink-0 text-accent">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="m5 13 4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="mt-3 shrink-0">
                <AdminPagination
                    :total-pages="totalPages"
                    :current-page="currentPage"
                    @update:current-page="handlePageChange"
                />
            </div>

            <!-- Footer -->
            <div class="flex justify-end gap-2 mt-4 shrink-0">
                <button class="btn btn-ghost btn-sm" @click="show = false">
                    取消
                </button>
                <button class="btn btn-accent btn-sm" @click="handleConfirm">
                    确认选择
                    <span v-if="selectedList.length" class="badge badge-sm">{{ selectedList.length }}</span>
                </button>
            </div>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button @click="show = false">
                close
            </button>
        </form>
    </dialog>
</template>
