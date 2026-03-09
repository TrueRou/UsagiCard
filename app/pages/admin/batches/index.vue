<script setup lang="ts">
const searchParams = reactive({
    status: undefined as number | undefined,
    page_number: 1,
    page_size: 20,
})

const { data: batches, refresh } = await useLeporid<PageBatchPublic>('/api/batches', {
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

function defaultBatchName() {
    const d = new Date()
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

// Create batch modal
const showCreateModal = ref(false)
const selectedArtifacts = ref<any[]>([])
const batchName = ref('')
const artifactPickerRef = ref<any>()

function openCreateBatch() {
    selectedArtifacts.value = []
    batchName.value = defaultBatchName()
    showCreateModal.value = true
}

async function handleCreateBatch() {
    const ids = selectedArtifacts.value.map(a => a.id)
    if (!ids.length)
        return
    isProcessing.value = true
    try {
        await useNuxtApp().$leporid('/api/batches', {
            method: 'POST',
            body: { artifact_ids: ids, name: batchName.value.trim() || defaultBatchName() },
            showSuccessToast: true,
            successMessage: '批次已创建',
        })
        showCreateModal.value = false
        selectedArtifacts.value = []
        await refresh()
    }
    finally {
        isProcessing.value = false
    }
}

useHead({ title: '批次管理' })

definePageMeta({
    layout: 'admin',
    middleware: ['require-admin'],
})
</script>

<template>
    <div>
        <div class="flex items-center justify-between mb-6">
            <h1 class="text-2xl font-bold">
                批次管理
            </h1>
            <button class="btn btn-primary btn-sm" @click="openCreateBatch">
                <Icon name="mdi:plus" class="w-4 h-4" />
                创建批次
            </button>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 w-full mb-4">
            <select
                v-model.number="searchParams.status"
                class="select select-bordered select-sm w-full sm:w-36"
                @change="handleSearch"
            >
                <option :value="undefined">
                    全部状态
                </option>
                <option :value="BatchStatus.PENDING">
                    待定
                </option>
                <option :value="BatchStatus.IN_PRODUCTION">
                    制作中
                </option>
                <option :value="BatchStatus.COMPLETED">
                    已完成
                </option>
                <option :value="BatchStatus.FAILED">
                    失败
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
                        <th>批次名称</th>
                        <th>状态</th>
                        <th>工件数量</th>
                        <th>创建时间</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="batch in batches?.records" :key="batch.id">
                        <td>
                            <span class="font-medium">{{ batch.name }}</span>
                            <span class="text-xs text-base-content/40 font-mono ml-2">{{ batch.id.slice(-6) }}</span>
                        </td>
                        <td>
                            <AdminStatusBadge :status="batch.status" type="batch" />
                        </td>
                        <td>
                            {{ batch.artifacts?.length ?? '-' }}
                        </td>
                        <td class="text-xs text-base-content/60">
                            {{ formatDateTime(batch.created_at) }}
                        </td>
                        <td>
                            <NuxtLink :to="`/admin/batches/${batch.id}`" class="btn btn-accent btn-xs">
                                详情
                            </NuxtLink>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div v-if="!batches?.records?.length" class="text-center py-12 text-base-content/50">
                暂无批次数据
            </div>
        </div>

        <AdminPagination
            v-if="batches"
            :total-pages="batches.total_page"
            :current-page="searchParams.page_number"
            @update:current-page="handlePageChange"
        />

        <!-- Create batch modal -->
        <dialog class="modal" :class="{ 'modal-open': showCreateModal }">
            <div class="modal-box">
                <h3 class="text-lg font-bold">
                    创建批次
                </h3>
                <p class="text-sm text-base-content/70 mt-2">
                    填写批次名称并选择要加入批次的工件。
                </p>
                <div class="mt-4 space-y-3">
                    <fieldset class="fieldset">
                        <legend class="fieldset-legend">
                            批次名称
                        </legend>
                        <input v-model="batchName" type="text" class="input" placeholder="如：2026.03.10">
                    </fieldset>
                    <fieldset class="fieldset">
                        <legend class="fieldset-legend">
                            关联工件
                        </legend>
                        <div class="flex items-center gap-3">
                            <button
                                class="btn btn-outline btn-sm"
                                type="button"
                                @click="artifactPickerRef?.open(selectedArtifacts)"
                            >
                                <Icon name="mdi:package-variant" class="w-4 h-4" />
                                选择工件
                            </button>
                            <span class="text-sm text-base-content/60">
                                {{ selectedArtifacts.length ? `已选择 ${selectedArtifacts.length} 个工件` : '未选择工件' }}
                            </span>
                        </div>
                    </fieldset>

                    <div
                        v-if="selectedArtifacts.length"
                        class="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-2 bg-base-200 rounded-lg"
                    >
                        <span
                            v-for="a in selectedArtifacts"
                            :key="a.id"
                            class="badge badge-sm gap-1 font-mono cursor-pointer hover:badge-error transition-colors"
                            @click="selectedArtifacts = selectedArtifacts.filter(x => x.id !== a.id)"
                        >
                            {{ a.id.slice(-8) }}
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M18 6 6 18M6 6l12 12" />
                            </svg>
                        </span>
                    </div>
                </div>
                <div class="modal-action">
                    <button class="btn btn-outline btn-sm" @click="showCreateModal = false">
                        取消
                    </button>
                    <button
                        class="btn btn-primary btn-sm"
                        :disabled="isProcessing || !selectedArtifacts.length"
                        @click="handleCreateBatch"
                    >
                        创建
                    </button>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop">
                <button @click="showCreateModal = false">
                    close
                </button>
            </form>
        </dialog>

        <!-- Artifact picker -->
        <AdminResourcePicker
            ref="artifactPickerRef"
            resource-type="artifact"
            :multiple="true"
            title="选择工件"
            @confirm="items => selectedArtifacts = items"
        />
    </div>
</template>
