<script setup lang="ts">
const searchParams = reactive({
    status: undefined as number | undefined,
    product_id: undefined as string | undefined,
    batch_id: undefined as string | undefined,
    page_number: 1,
    page_size: 20,
})

const { data: artifacts, refresh } = await useAdminArtifacts(toRef(() => searchParams))

const isProcessing = ref(false)

function handleSearch() {
    searchParams.page_number = 1
    refresh()
}

function handlePageChange(page: number) {
    searchParams.page_number = page
    refresh()
}

// Status update
const editingArtifact = ref<{ id: string, status: number } | null>(null)
const newStatus = ref<number>(0)
const showModal = ref(false)

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
    showModal.value = true
}

async function handleSaveStatus() {
    if (!editingArtifact.value)
        return
    isProcessing.value = true
    try {
        await adminUpdateArtifactStatus(editingArtifact.value.id, newStatus.value)
        showModal.value = false
        await refresh()
    }
    finally {
        isProcessing.value = false
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
                        <th>批次</th>
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
                        <td class="text-xs font-mono">
                            <NuxtLink
                                v-if="artifact.batch_id"
                                :to="`/admin/batches?highlight=${artifact.batch_id}`"
                                class="link link-primary"
                            >
                                {{ artifact.batch_id.slice(-8) }}
                            </NuxtLink>
                            <span v-else class="text-base-content/40">未分配</span>
                        </td>
                        <td class="text-xs text-base-content/60">
                            {{ formatDateTime(artifact.created_at) }}
                        </td>
                        <td>
                            <button class="btn btn-ghost btn-xs" @click="openStatusEditor(artifact)">
                                修改状态
                            </button>
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
        <dialog class="modal" :class="{ 'modal-open': showModal }">
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
                    <button class="btn btn-ghost btn-sm" @click="showModal = false">
                        取消
                    </button>
                    <button class="btn btn-primary btn-sm" :disabled="isProcessing" @click="handleSaveStatus">
                        保存
                    </button>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop">
                <button @click="showModal = false">
                    close
                </button>
            </form>
        </dialog>
    </div>
</template>
