<script setup lang="ts">
import * as XLSX from 'xlsx'

const route = useRoute()
const batchId = route.params.id as string
const { addNotification } = useNotificationsStore()

const { data: batchData, refresh } = await useLeporid<BatchPublic>(`/api/admin/batches/${batchId}`)

const isProcessing = ref(false)
const isExporting = ref(false)
const isImporting = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

function formatDateTime(iso: string) {
    return new Date(iso).toLocaleString()
}

// ────────────────────────────────────────────────────────────
// Sketchpad preview modal
// ────────────────────────────────────────────────────────────
const showPreviewModal = ref(false)
const previewArtifactId = ref('')

function openPreview(artifactId: string) {
    previewArtifactId.value = artifactId
    showPreviewModal.value = true
}

// ────────────────────────────────────────────────────────────
// Production actions
// ────────────────────────────────────────────────────────────
async function handleStartProduction() {
    isProcessing.value = true
    try {
        batchData.value = await useNuxtApp().$leporid(`/api/admin/batches/${batchId}/produce`, {
            method: 'POST',
            showSuccessToast: true,
        })
    }
    finally {
        isProcessing.value = false
    }
}

// ────────────────────────────────────────────────────────────
// Excel Export（菜鸟格式）
// ────────────────────────────────────────────────────────────
async function handleExportShipping() {
    isExporting.value = true
    try {
        const items = (await useNuxtApp().$leporid<BatchShippingItem[]>(
            `/api/admin/batches/${batchId}/shipping`,
        )) ?? []

        if (!items.length) {
            addNotification({ type: 'warning', message: '暂无工件数据，无法导出' })
            return
        }

        // 按 order_id 合并同一订单的多件工件
        const orderMap = new Map<string, {
            shipping_name: string
            shipping_phone: string
            shipping_address: string
            batch_nos: number[]
        }>()

        for (const item of items) {
            if (!item.order_id)
                continue
            const key = item.order_id
            if (!orderMap.has(key)) {
                orderMap.set(key, {
                    shipping_name: item.shipping_name ?? '',
                    shipping_phone: item.shipping_phone ?? '',
                    shipping_address: item.shipping_address ?? '',
                    batch_nos: [],
                })
            }
            if (item.batch_no != null)
                orderMap.get(key)!.batch_nos.push(item.batch_no)
        }

        const batchName = batchData.value?.name ?? batchId.slice(-8)
        const rows = [...orderMap.values()].map(o => ({
            编号: '',
            收件人姓名: o.shipping_name,
            收件人联系方式: o.shipping_phone,
            收件地址: o.shipping_address,
            物品类: '日用品',
            物品详情: 'NFC卡片',
            备注信息: o.batch_nos.length
                ? `${batchName} #${o.batch_nos.sort((a, b) => a - b).join(', #')}`
                : batchName,
        }))

        const worksheet = XLSX.utils.aoa_to_sheet([])
        worksheet['!merges'] = [
            { s: { r: 0, c: 1 }, e: { r: 0, c: 3 } },
            { s: { r: 0, c: 4 }, e: { r: 0, c: 5 } },
        ]
        XLSX.utils.sheet_add_aoa(worksheet, [
            ['', '收件信息', '', '', '物品信息', '', '备注'],
        ], { origin: 0 })
        XLSX.utils.sheet_add_aoa(worksheet, [
            ['编号', '收件人姓名', '收件人联系方式', '收件地址', '物品类', '物品详情', '备注信息'],
        ], { origin: { r: 1, c: 0 } })
        XLSX.utils.sheet_add_aoa(
            worksheet,
            rows.map(r => [r['编号'], r['收件人姓名'], r['收件人联系方式'], r['收件地址'], r['物品类'], r['物品详情'], r['备注信息']]),
            { origin: { r: 2, c: 0 } },
        )

        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, '发货信息')
        XLSX.writeFile(workbook, `发货单_${batchName}.xlsx`)
    }
    finally {
        isExporting.value = false
    }
}

// ────────────────────────────────────────────────────────────
// Excel Import（菜鸟回传格式）
// ────────────────────────────────────────────────────────────
function triggerImport() {
    fileInputRef.value?.click()
}

async function handleFileUpload(event: Event) {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file)
        return

    isImporting.value = true

    try {
        // 先获取 shipping 数据，建立 phone -> order_id 映射
        const shippingItems = (await useNuxtApp().$leporid<BatchShippingItem[]>(
            `/api/admin/batches/${batchId}/shipping`,
        )) ?? []

        const phoneOrderMap = new Map<string, string>()
        for (const item of shippingItems) {
            if (item.shipping_phone && item.order_id) {
                const phone = item.shipping_phone.replace(/\s+/g, '')
                phoneOrderMap.set(phone, item.order_id)
            }
        }

        // 解析 Excel
        const buffer = await file.arrayBuffer()
        const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' })

        if (!workbook.SheetNames[0]) {
            addNotification({ type: 'error', message: 'Excel 工作表不存在' })
            return
        }

        const worksheet = workbook.Sheets[workbook.SheetNames[0]]

        if (!worksheet) {
            addNotification({ type: 'error', message: 'Excel 工作表无法打开' })
            return
        }

        const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, any>[]

        if (!jsonData.length) {
            addNotification({ type: 'error', message: 'Excel 文件为空' })
            return
        }

        const firstRow = jsonData[0]

        if (!firstRow) {
            addNotification({ type: 'error', message: 'Excel 文件格式有误' })
            return
        }

        const columns = Object.keys(firstRow)

        const phoneCol = columns.find(c => c.includes('收件人电话') || c.includes('联系方式') || c.includes('手机'))
        const trackingCol = columns.find(c => c.includes('包裹号') || c.includes('快递单号') || c.includes('运单号'))

        if (!phoneCol || !trackingCol) {
            addNotification({ type: 'error', message: `无法找到电话列或快递单号列（找到的列：${columns.join(', ')}）` })
            return
        }

        // 构建批量发货请求
        const shipItems: { order_id: string, shipping_sn: string }[] = []
        const usedOrderIds = new Set<string>()

        for (const row of jsonData) {
            const phone = String(row[phoneCol] ?? '').replace(/\s+/g, '')
            const sn = String(row[trackingCol] ?? '').trim()
            if (!phone || !sn)
                continue

            const orderId = phoneOrderMap.get(phone)
            if (orderId && !usedOrderIds.has(orderId)) {
                shipItems.push({ order_id: orderId, shipping_sn: sn })
                usedOrderIds.add(orderId)
            }
        }

        if (!shipItems.length) {
            addNotification({ type: 'error', message: 'Excel 中没有匹配到任何订单，请检查电话号码' })
            return
        }

        // 调用批量发货接口
        const results = (await useNuxtApp().$leporid<BatchBulkShipResult[]>(
            `/api/admin/batches/${batchId}/ship`,
            {
                method: 'POST',
                body: { items: shipItems },
            },
        )) ?? []
        const succeeded = results.filter(r => r.success).length
        const failed = results.filter(r => !r.success).length

        if (succeeded > 0) {
            addNotification({
                type: 'success',
                message: `发货成功 ${succeeded} 单${failed > 0 ? `，失败 ${failed} 单` : ''}`,
            })
        }
        else {
            addNotification({ type: 'error', message: '所有订单发货失败，请检查订单状态' })
        }

        await refresh()
    }
    catch (e) {
        console.error(e)
        addNotification({ type: 'error', message: '处理 Excel 文件时出错' })
    }
    finally {
        isImporting.value = false
        if (fileInputRef.value)
            fileInputRef.value.value = ''
        target.value = ''
    }
}

useHead({ title: () => batchData.value?.name ? `批次 - ${batchData.value.name}` : '批次详情' })

definePageMeta({
    layout: 'admin',
    middleware: ['require-admin'],
})
</script>

<template>
    <div>
        <!-- 隐藏文件输入 -->
        <input
            ref="fileInputRef"
            type="file"
            accept=".xlsx,.xls"
            class="hidden"
            @change="handleFileUpload"
        >

        <!-- 顶部导航 -->
        <div class="flex items-center gap-3 mb-6">
            <NuxtLink to="/admin/batches" class="btn btn-ghost btn-sm btn-circle">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
            </NuxtLink>
            <div class="flex-1 min-w-0">
                <h1 class="text-2xl font-bold truncate">
                    {{ batchData?.name ?? '批次详情' }}
                </h1>
                <p class="text-xs text-base-content/40 font-mono mt-0.5">
                    {{ batchId }}
                </p>
            </div>
        </div>

        <!-- 基本信息 + 操作区 -->
        <div class="flex flex-col sm:flex-row sm:items-start gap-4 mb-6">
            <div class="flex flex-wrap gap-4 text-sm flex-1">
                <div>
                    <p class="text-base-content/50 text-xs mb-0.5">
                        状态
                    </p>
                    <AdminStatusBadge v-if="batchData" :status="batchData.status" type="batch" />
                </div>
                <div>
                    <p class="text-base-content/50 text-xs mb-0.5">
                        工件数量
                    </p>
                    <p class="font-medium">
                        {{ batchData?.artifacts?.length ?? 0 }} 件
                    </p>
                </div>
                <div>
                    <p class="text-base-content/50 text-xs mb-0.5">
                        创建时间
                    </p>
                    <p class="text-xs">
                        {{ batchData ? formatDateTime(batchData.created_at) : '-' }}
                    </p>
                </div>
                <div>
                    <p class="text-base-content/50 text-xs mb-0.5">
                        更新时间
                    </p>
                    <p class="text-xs">
                        {{ batchData ? formatDateTime(batchData.updated_at) : '-' }}
                    </p>
                </div>
            </div>

            <!-- 操作按钮区 -->
            <div class="flex flex-wrap gap-2 shrink-0">
                <!-- 生产按钮 -->
                <button
                    v-if="batchData?.status === BatchStatus.PENDING"
                    class="btn btn-primary btn-sm"
                    :disabled="isProcessing"
                    @click="handleStartProduction"
                >
                    <Icon name="mdi:play-circle-outline" class="w-4 h-4" />
                    开始生产
                </button>
                <button
                    v-else-if="batchData?.status === BatchStatus.COMPLETED || batchData?.status === BatchStatus.FAILED"
                    class="btn btn-warning btn-sm btn-outline"
                    :disabled="isProcessing"
                    @click="handleStartProduction"
                >
                    <Icon name="mdi:refresh" class="w-4 h-4" />
                    重新生产
                </button>

                <!-- 发货按钮（已完成批次显示） -->
                <template v-if="batchData?.status === BatchStatus.COMPLETED">
                    <div class="divider divider-horizontal hidden sm:flex" />
                    <button
                        class="btn btn-success btn-sm"
                        :disabled="isExporting"
                        @click="handleExportShipping"
                    >
                        <Icon name="mdi:file-export-outline" class="w-4 h-4" />
                        {{ isExporting ? '导出中...' : '导出发货单' }}
                    </button>
                    <button
                        class="btn btn-accent btn-sm"
                        :disabled="isImporting"
                        @click="triggerImport"
                    >
                        <Icon name="mdi:file-import-outline" class="w-4 h-4" />
                        {{ isImporting ? '导入中...' : '导入快递单号' }}
                    </button>
                </template>
            </div>
        </div>

        <!-- 工件列表 -->
        <div class="overflow-x-auto">
            <table class="table table-sm">
                <thead>
                    <tr>
                        <th class="w-12 text-center">
                            #
                        </th>
                        <th>工件 ID</th>
                        <th>商品名称</th>
                        <th>类型</th>
                        <th>材质</th>
                        <th>状态</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="artifact in batchData?.artifacts" :key="artifact.id">
                        <td class="text-center font-mono font-bold text-base-content/60">
                            {{ artifact.batch_no ?? '-' }}
                        </td>
                        <td class="font-mono text-xs">
                            {{ artifact.id.slice(-8) }}
                        </td>
                        <td class="text-sm max-w-48 truncate">
                            {{ artifact.product?.name ?? '-' }}
                        </td>
                        <td class="text-sm text-base-content/70">
                            {{ artifact.product?.type?.name ?? '-' }}
                        </td>
                        <td class="text-sm text-base-content/70">
                            {{ artifact.product?.material?.name ?? '-' }}
                        </td>
                        <td>
                            <AdminStatusBadge :status="artifact.status" type="artifact" />
                        </td>
                        <td>
                            <div class="flex gap-1">
                                <!-- 预览卡片 -->
                                <button
                                    class="btn btn-ghost btn-xs"
                                    title="预览卡片"
                                    @click="openPreview(artifact.id)"
                                >
                                    <Icon name="mdi:eye-outline" class="w-3.5 h-3.5" />
                                </button>
                                <!-- 写入 NFC（预留） -->
                                <button
                                    class="btn btn-ghost btn-xs opacity-40"
                                    title="写入 NFC（暂未开放）"
                                    disabled
                                >
                                    <Icon name="mdi:nfc" class="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div v-if="!batchData?.artifacts?.length" class="text-center py-12 text-base-content/50">
                批次内暂无工件
            </div>
        </div>

        <!-- 卡片预览 Modal -->
        <dialog class="modal" :class="{ 'modal-open': showPreviewModal }">
            <div class="modal-box p-0 overflow-hidden">
                <div class="flex items-center justify-between px-4 py-3 border-b border-base-200">
                    <h3 class="font-bold text-sm">
                        卡片预览
                        <span class="font-mono text-base-content/40 ml-1">{{ previewArtifactId.slice(-8) }}</span>
                    </h3>
                    <button class="btn btn-ghost btn-sm btn-circle" @click="showPreviewModal = false">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M18 6 6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div style="height: 520px">
                    <iframe
                        v-if="showPreviewModal && previewArtifactId"
                        :src="`/artifacts/${previewArtifactId}/sketchpad`"
                        class="w-full h-full border-0"
                        :title="`工件 ${previewArtifactId} 预览`"
                    />
                </div>
            </div>
            <form method="dialog" class="modal-backdrop">
                <button @click="showPreviewModal = false">
                    close
                </button>
            </form>
        </dialog>
    </div>
</template>
