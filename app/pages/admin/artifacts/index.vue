<script setup lang="ts">
const route = useRoute()
const searchParams = reactive({
    status: undefined as number | undefined,
    product_id: route.query.product_id as string | undefined,
    batch_id: route.query.batch_id as string | undefined,
    page_number: 1,
    page_size: 20,
})

const { data: artifacts, refresh } = await useLeporid<PageArtifactManufacturerResponse>('/api/admin/artifacts', {
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

// Status update modal
const editingArtifact = ref<{ id: string, status: number } | null>(null)
const newStatus = ref<number>(0)
const showStatusModal = ref(false)

const statusOptions = [
    { value: ArtifactStatus.FAILED, label: '失败' },
    { value: ArtifactStatus.PENDING, label: '待定' },
    { value: ArtifactStatus.IN_PRODUCTION, label: '制作中' },
    { value: ArtifactStatus.COMPLETED, label: '已完成' },
    { value: ArtifactStatus.ACTIVATED, label: '已激活' },
]

function openStatusEditor(artifact: { id: string, status: number }) {
    editingArtifact.value = artifact
    newStatus.value = artifact.status
    showStatusModal.value = true
}

async function handleSaveStatus() {
    if (!editingArtifact.value)
        return
    isProcessing.value = true
    try {
        await useNuxtApp().$leporid(`/api/admin/artifacts/${editingArtifact.value.id}/status`, {
            method: 'PATCH',
            body: { status: newStatus.value },
            showSuccessToast: true,
            successMessage: '工件状态已更新',
        })
        showStatusModal.value = false
        await refresh()
    }
    finally {
        isProcessing.value = false
    }
}

// Detail modal
type DetailTab = 'info' | 'storage' | 'design'

const showDetail = ref(false)
const detailArtifact = ref<any | null>(null)
const activeDetailTab = ref<DetailTab>('info')

const storageJson = ref('')
const storageJsonError = ref('')
const isSavingStorage = ref(false)

const designJson = ref('')
const designJsonError = ref('')
const isSavingDesign = ref(false)

const isLoadingDetail = ref(false)

async function openDetail(artifact: any) {
    showDetail.value = true
    activeDetailTab.value = 'info'
    detailArtifact.value = artifact
    storageJsonError.value = ''
    designJsonError.value = ''
    isLoadingDetail.value = true
    try {
        const full = await useNuxtApp().$leporid<any>(`/api/admin/artifacts/${artifact.id}`)
        detailArtifact.value = full
        storageJson.value = JSON.stringify(full.storage ?? {}, null, 2)
        designJson.value = JSON.stringify(full.product?.design ?? {}, null, 2)
    }
    finally {
        isLoadingDetail.value = false
    }
}

function validateJson() {
    try {
        JSON.parse(storageJson.value)
        storageJsonError.value = ''
        return true
    }
    catch (e: any) {
        storageJsonError.value = e.message
        return false
    }
}

async function handleSaveStorage() {
    if (!validateJson() || !detailArtifact.value)
        return
    isSavingStorage.value = true
    try {
        await useNuxtApp().$leporid(`/api/admin/artifacts/${detailArtifact.value.id}/storage`, {
            method: 'PATCH',
            body: { storage: JSON.parse(storageJson.value) },
            showSuccessToast: true,
            successMessage: '工件存储已保存',
        })
        await refresh()
    }
    finally {
        isSavingStorage.value = false
    }
}

function validateDesignJson() {
    try {
        JSON.parse(designJson.value)
        designJsonError.value = ''
        return true
    }
    catch (e: any) {
        designJsonError.value = e.message
        return false
    }
}

async function handleSaveDesign() {
    if (!validateDesignJson() || !detailArtifact.value?.product_id)
        return
    isSavingDesign.value = true
    try {
        await useNuxtApp().$leporid(`/api/admin/products/${detailArtifact.value.product_id}`, {
            method: 'PATCH',
            body: { design: JSON.parse(designJson.value) },
            showSuccessToast: true,
            successMessage: '商品设计模板已保存',
        })
        // 刷新详情以同步最新 design
        const full = await useNuxtApp().$leporid<any>(`/api/admin/artifacts/${detailArtifact.value.id}`)
        detailArtifact.value = full
        designJson.value = JSON.stringify(full.product?.design ?? {}, null, 2)
        await refresh()
    }
    finally {
        isSavingDesign.value = false
    }
}

function formatDateTime(iso: string) {
    return new Date(iso).toLocaleString()
}

useHead({ title: '工件管理' })

definePageMeta({
    layout: 'admin',
    middleware: ['require-admin'],
})
</script>

<template>
    <div>
        <h1 class="text-2xl font-bold mb-6">
            工件管理
        </h1>

        <div class="flex flex-col sm:flex-row gap-3 w-full mb-4">
            <select
                v-model.number="searchParams.status"
                class="select select-bordered select-sm w-full sm:w-36"
                @change="handleSearch"
            >
                <option :value="undefined">
                    全部状态
                </option>
                <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                </option>
            </select>
            <button class="btn btn-primary btn-sm" @click="handleSearch">
                筛选
            </button>
        </div>

        <div class="overflow-x-auto">
            <table class="table table-sm">
                <thead>
                    <tr>
                        <th>工件ID</th>
                        <th>状态</th>
                        <th>商品</th>
                        <th>创建时间</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="artifact in artifacts?.records" :key="artifact.id">
                        <td class="font-mono text-xs">
                            {{ artifact.id.slice(-8) }}
                        </td>
                        <td>
                            <AdminStatusBadge :status="artifact.status" type="artifact" />
                        </td>
                        <td class="text-sm max-w-32 truncate">
                            {{ artifact.product?.name || artifact.product_id.slice(-8) }}
                        </td>
                        <td class="text-xs text-base-content/60">
                            {{ formatDateTime(artifact.created_at) }}
                        </td>
                        <td>
                            <div class="flex gap-1">
                                <button class="btn btn-accent btn-xs" @click="openDetail(artifact)">
                                    详情
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div v-if="!artifacts?.records?.length" class="text-center py-12 text-base-content/50">
                暂无工件数据
            </div>
        </div>

        <AdminPagination
            v-if="artifacts"
            :total-pages="artifacts.total_page"
            :current-page="searchParams.page_number"
            @update:current-page="handlePageChange"
        />

        <!-- Status edit modal -->
        <dialog class="modal z-20" :class="{ 'modal-open': showStatusModal }">
            <div class="modal-box">
                <h3 class="text-lg font-bold">
                    修改工件状态
                </h3>
                <p v-if="editingArtifact" class="text-xs text-base-content/50 font-mono mt-1">
                    {{ editingArtifact.id }}
                </p>
                <div class="mt-4">
                    <select v-model.number="newStatus" class="select select-bordered select-sm w-full">
                        <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                            {{ opt.label }}
                        </option>
                    </select>
                </div>
                <div class="modal-action">
                    <button class="btn btn-outline btn-sm" @click="showStatusModal = false">
                        取消
                    </button>
                    <button class="btn btn-primary btn-sm" :disabled="isProcessing" @click="handleSaveStatus">
                        保存
                    </button>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop">
                <button @click="showStatusModal = false">
                    close
                </button>
            </form>
        </dialog>

        <!-- Artifact detail modal -->
        <dialog class="modal z-10" :class="{ 'modal-open': showDetail }">
            <div class="modal-box max-w-4xl max-h-[85dvh] flex flex-col p-0 overflow-hidden">
                <!-- Tab nav -->
                <div class="flex items-center border-b border-base-200 px-4 pt-4 shrink-0 gap-1">
                    <div class="flex-1 flex gap-1">
                        <button
                            v-for="tab in [
                                { key: 'info', label: '基本信息' },
                                { key: 'storage', label: '工件存储' },
                                { key: 'design', label: '商品设计模板' },
                            ]"
                            :key="tab.key"
                            class="px-3 py-2 text-sm font-medium border-b-2 transition-colors -mb-px"
                            :class="activeDetailTab === tab.key
                                ? 'border-accent text-accent'
                                : 'border-transparent text-base-content/60 hover:text-base-content'"
                            @click="activeDetailTab = tab.key as DetailTab"
                        >
                            {{ tab.label }}
                        </button>
                    </div>
                    <a
                        v-if="detailArtifact"
                        :href="`/artifacts/${detailArtifact.id}/sketchpad`"
                        target="_blank"
                        class="btn btn-ghost btn-sm btn-circle mb-1"
                        title="在新标签页打开 Sketchpad"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                    <button class="btn btn-ghost btn-sm btn-circle mb-1" @click="showDetail = false">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M18 6 6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <!-- Loading -->
                <div v-if="isLoadingDetail" class="flex-1 flex items-center justify-center">
                    <span class="loading loading-spinner loading-md" />
                </div>

                <!-- Content -->
                <div v-else class="flex-1 overflow-y-auto px-4 py-4">
                    <!-- Info tab - left/right on desktop -->
                    <div v-if="activeDetailTab === 'info' && detailArtifact" class="text-sm">
                        <div class="flex flex-col md:flex-row gap-4">
                            <!-- Left: Sketchpad -->
                            <div class="shrink-0">
                                <div class="rounded-lg overflow-hidden" style="height: 480px">
                                    <iframe
                                        :src="`/artifacts/${detailArtifact.id}/sketchpad`"
                                        class="w-full h-full border-0"
                                        :title="`工件 ${detailArtifact.id} Sketchpad`"
                                    />
                                </div>
                            </div>
                            <!-- Right: Info -->
                            <div class="flex-1 space-y-3 min-w-0">
                                <div class="grid gap-3">
                                    <div>
                                        <p class="text-base-content/50 text-xs mb-0.5">
                                            状态
                                        </p>
                                        <AdminStatusBadge :status="detailArtifact.status" type="artifact" />
                                        <button class="btn btn-outline btn-xs ml-2" @click="openStatusEditor(detailArtifact)">
                                            修改状态
                                        </button>
                                    </div>
                                    <div>
                                        <p class="text-base-content/50 text-xs mb-0.5">
                                            工件 ID
                                        </p>
                                        <p class="font-mono text-xs break-all">
                                            {{ detailArtifact.id }}
                                        </p>
                                    </div>
                                    <div>
                                        <p class="text-base-content/50 text-xs mb-0.5">
                                            商品
                                        </p>
                                        <p>{{ detailArtifact.product?.name || detailArtifact.product_id }}</p>
                                    </div>
                                    <div>
                                        <p class="text-base-content/50 text-xs mb-0.5">
                                            批次
                                        </p>
                                        <p class="font-mono text-xs">
                                            {{ detailArtifact.batch_id?.slice(-8) || '未分配' }}
                                        </p>
                                    </div>
                                    <div>
                                        <p class="text-base-content/50 text-xs mb-0.5">
                                            创建时间
                                        </p>
                                        <p class="text-xs">
                                            {{ formatDateTime(detailArtifact.created_at) }}
                                        </p>
                                    </div>
                                    <div>
                                        <p class="text-base-content/50 text-xs mb-0.5">
                                            更新时间
                                        </p>
                                        <p class="text-xs">
                                            {{ formatDateTime(detailArtifact.updated_at) }}
                                        </p>
                                    </div>
                                </div>
                                <div v-if="detailArtifact.product">
                                    <p class="text-base-content/50 text-xs mb-0.5">
                                        商品描述
                                    </p>
                                    <p class="text-sm">
                                        {{ detailArtifact.product.description }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Storage tab -->
                    <div v-else-if="activeDetailTab === 'storage'" class="space-y-3">
                        <p class="text-xs text-base-content/50">
                            工件的内部存储数据（用户设计数据）。请确保 JSON 格式正确后保存。
                        </p>
                        <textarea
                            v-model="storageJson"
                            class="textarea textarea-bordered w-full font-mono text-xs h-64 resize-y"
                            spellcheck="false"
                            @input="validateJson"
                        />
                        <p v-if="storageJsonError" class="text-xs text-error">
                            JSON 格式错误：{{ storageJsonError }}
                        </p>
                        <div class="flex justify-end">
                            <button
                                class="btn btn-accent btn-sm"
                                :disabled="isSavingStorage || !!storageJsonError"
                                @click="handleSaveStorage"
                            >
                                保存存储
                            </button>
                        </div>
                    </div>

                    <!-- Design tab -->
                    <div v-else-if="activeDetailTab === 'design' && detailArtifact" class="space-y-3">
                        <p class="text-xs text-base-content/50">
                            此处编辑的是关联商品的设计模板，修改后将影响该商品的所有工件。
                        </p>
                        <textarea
                            v-model="designJson"
                            class="textarea textarea-bordered w-full font-mono text-xs h-64 resize-y"
                            spellcheck="false"
                            @input="validateDesignJson"
                        />
                        <p v-if="designJsonError" class="text-xs text-error">
                            JSON 格式错误：{{ designJsonError }}
                        </p>
                        <div class="flex items-center justify-between">
                            <p class="text-xs text-warning">
                                正在编辑 {{ detailArtifact.product?.name || detailArtifact.product_id }} 的设计模板
                            </p>
                            <button
                                class="btn btn-accent btn-sm"
                                :disabled="isSavingDesign || !!designJsonError"
                                @click="handleSaveDesign"
                            >
                                保存模板
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop">
                <button @click="showDetail = false">
                    close
                </button>
            </form>
        </dialog>
    </div>
</template>
