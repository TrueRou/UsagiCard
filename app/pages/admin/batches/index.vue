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

// Advance modal
const showAdvanceModal = ref(false)
const advanceBatch = ref<{ id: string, status: number } | null>(null)
const advanceTarget = ref<number>(ArtifactStatus.IN_PRODUCTION)

const advanceOptions = [
    { value: ArtifactStatus.IN_PRODUCTION, label: '制作中' },
    { value: ArtifactStatus.COMPLETED, label: '已完成' },
    { value: ArtifactStatus.ACTIVATED, label: '已激活' },
]

function openAdvance(batch: { id: string, status: number }) {
    advanceBatch.value = batch
    advanceTarget.value = ArtifactStatus.IN_PRODUCTION
    showAdvanceModal.value = true
}

async function handleAdvance() {
    if (!advanceBatch.value)
        return
    isProcessing.value = true
    try {
        await useNuxtApp().$leporid(`/api/batches/${advanceBatch.value.id}/advance`, {
            method: 'POST',
            body: { target_status: advanceTarget.value },
            showSuccessToast: true,
            successMessage: '工件状态已批量推进',
        })
        showAdvanceModal.value = false
        await refresh()
    }
    finally {
        isProcessing.value = false
    }
}

// Create batch modal
const showCreateModal = ref(false)
const newArtifactIds = ref('')

async function handleCreateBatch() {
    const ids = newArtifactIds.value
        .split(/[\n,;]+/)
        .map(s => s.trim())
        .filter(Boolean)
    if (!ids.length)
        return
    isProcessing.value = true
    try {
        await useNuxtApp().$leporid('/api/batches', {
            method: 'POST',
            body: { artifact_ids: ids },
            showSuccessToast: true,
            successMessage: '批次已创建',
        })
        showCreateModal.value = false
        newArtifactIds.value = ''
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
            <button class="btn btn-primary btn-sm" @click="showCreateModal = true">
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
                        <th>批次ID</th>
                        <th>状态</th>
                        <th>工件数量</th>
                        <th>创建者</th>
                        <th>创建时间</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="batch in batches?.records" :key="batch.id">
                        <td class="font-mono text-xs">
                            {{ batch.id.slice(-8) }}
                        </td>
                        <td>
                            <AdminStatusBadge :status="batch.status" type="batch" />
                        </td>
                        <td>
                            {{ batch.artifacts?.length ?? '-' }}
                        </td>
                        <td class="font-mono text-xs">
                            {{ batch.user_id.slice(-8) }}
                        </td>
                        <td class="text-xs text-base-content/60">
                            {{ formatDateTime(batch.created_at) }}
                        </td>
                        <td>
                            <div class="flex gap-1">
                                <button class="btn btn-ghost btn-xs" @click="openAdvance(batch)">
                                    推进状态
                                </button>
                            </div>
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

        <!-- Advance modal -->
        <dialog class="modal" :class="{ 'modal-open': showAdvanceModal }">
            <div class="modal-box">
                <h3 class="text-lg font-bold">
                    批量推进工件状态
                </h3>
                <p v-if="advanceBatch" class="text-xs text-base-content/50 font-mono mt-1">
                    批次 {{ advanceBatch.id.slice(-8) }}
                </p>
                <p class="text-sm text-base-content/70 mt-3">
                    将此批次内所有低于目标状态的工件推进至目标状态。
                </p>
                <div class="mt-4">
                    <label class="form-control">
                        <span class="label-text text-sm">目标状态</span>
                        <select v-model.number="advanceTarget" class="select select-bordered select-sm w-full mt-1">
                            <option v-for="opt in advanceOptions" :key="opt.value" :value="opt.value">
                                {{ opt.label }}
                            </option>
                        </select>
                    </label>
                </div>
                <div class="modal-action">
                    <button class="btn btn-ghost btn-sm" @click="showAdvanceModal = false">
                        取消
                    </button>
                    <button class="btn btn-primary btn-sm" :disabled="isProcessing" @click="handleAdvance">
                        确认推进
                    </button>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop">
                <button @click="showAdvanceModal = false">
                    close
                </button>
            </form>
        </dialog>

        <!-- Create batch modal -->
        <dialog class="modal" :class="{ 'modal-open': showCreateModal }">
            <div class="modal-box">
                <h3 class="text-lg font-bold">
                    创建批次
                </h3>
                <p class="text-sm text-base-content/70 mt-2">
                    输入要加入批次的工件ID，每行一个或用逗号分隔。
                </p>
                <div class="mt-4">
                    <textarea
                        v-model="newArtifactIds"
                        class="textarea textarea-bordered w-full h-32 font-mono text-xs"
                        placeholder="粘贴工件ID，每行一个..."
                    />
                </div>
                <div class="modal-action">
                    <button class="btn btn-ghost btn-sm" @click="showCreateModal = false">
                        取消
                    </button>
                    <button class="btn btn-primary btn-sm" :disabled="isProcessing" @click="handleCreateBatch">
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
    </div>
</template>
