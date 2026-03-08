<script setup lang="ts">
const notificationsStore = useNotificationsStore()
const dialogStore = useDialogStore()

// === Presets ===
const presetParams = reactive({ page_number: 1, page_size: 20 })
const { data: presets, refresh: refreshPresets } = await useLeporid<PageAdminPlatformPresetDetailPublic>('/api/admin/platform/presets', {
    params: presetParams,
})

const showPresetModal = ref(false)
const presetEditing = ref<string | null>(null) // null = create, string = update
const presetForm = reactive({
    product_name: '',
    product_description: '',
    product_design: '{}',
    product_material_id: '',
    product_type_id: '',
})

function openPresetCreate() {
    presetEditing.value = null
    Object.assign(presetForm, {
        product_name: '',
        product_description: '',
        product_design: '{}',
        product_material_id: '',
        product_type_id: '',
    })
    showPresetModal.value = true
}

function openPresetEdit(preset: any) {
    presetEditing.value = preset.id
    Object.assign(presetForm, {
        product_name: preset.product_name,
        product_description: preset.product_description,
        product_design: JSON.stringify(preset.product_design, null, 2),
        product_material_id: preset.product_material_id,
        product_type_id: preset.product_type_id,
    })
    showPresetModal.value = true
}

const isProcessing = ref(false)

async function handleSavePreset() {
    isProcessing.value = true
    try {
        const body = {
            product_name: presetForm.product_name,
            product_description: presetForm.product_description,
            product_design: JSON.parse(presetForm.product_design),
            product_material_id: presetForm.product_material_id,
            product_type_id: presetForm.product_type_id,
        }
        if (presetEditing.value) {
            await useNuxtApp().$leporid(`/api/admin/platform/presets/${presetEditing.value}`, {
                method: 'PATCH',
                body,
                showSuccessToast: true,
                successMessage: '预设已更新',
            })
        }
        else {
            await useNuxtApp().$leporid('/api/admin/platform/presets', {
                method: 'POST',
                body,
                showSuccessToast: true,
                successMessage: '预设已创建',
            })
        }
        showPresetModal.value = false
        await refreshPresets()
    }
    catch (e: any) {
        if (e?.message?.includes('JSON') || e instanceof SyntaxError) {
            notificationsStore.addNotification({ type: 'warning', message: '商品设计模板 JSON 格式错误' })
        }
    }
    finally {
        isProcessing.value = false
    }
}

async function handleDeletePreset(id: string) {
    if (!await dialogStore.confirm('确定删除此预设？关联的SKU和兑换码可能受影响。', { danger: true }))
        return
    isProcessing.value = true
    try {
        await useNuxtApp().$leporid(`/api/admin/platform/presets/${id}`, {
            method: 'DELETE',
            showSuccessToast: true,
            successMessage: '预设已删除',
        })
        await refreshPresets()
    }
    finally {
        isProcessing.value = false
    }
}

// === SKUs ===
const skuParams = reactive({ page_number: 1, page_size: 20 })
const { data: skus, refresh: refreshSkus } = await useLeporid<PageAdminPlatformSkuPublic>('/api/admin/platform/skus', {
    params: skuParams,
})

const showSkuModal = ref(false)
const skuEditing = ref<string | null>(null)
const skuForm = reactive({
    platform: '',
    plan_id: '',
    sku_id: '',
    quantity: 1,
    preset_id: '',
})

function openSkuCreate() {
    skuEditing.value = null
    Object.assign(skuForm, { platform: '', plan_id: '', sku_id: '', quantity: 1, preset_id: '' })
    showSkuModal.value = true
}

function openSkuEdit(sku: any) {
    skuEditing.value = sku.id
    Object.assign(skuForm, {
        platform: sku.platform,
        plan_id: sku.plan_id,
        sku_id: sku.sku_id || '',
        quantity: sku.quantity,
        preset_id: sku.preset_id,
    })
    showSkuModal.value = true
}

async function handleSaveSku() {
    isProcessing.value = true
    try {
        const body = {
            platform: skuForm.platform,
            plan_id: skuForm.plan_id,
            sku_id: skuForm.sku_id || null,
            quantity: skuForm.quantity,
            preset_id: skuForm.preset_id,
        }
        if (skuEditing.value) {
            await useNuxtApp().$leporid(`/api/admin/platform/skus/${skuEditing.value}`, {
                method: 'PATCH',
                body,
                showSuccessToast: true,
                successMessage: 'SKU已更新',
            })
        }
        else {
            await useNuxtApp().$leporid('/api/admin/platform/skus', {
                method: 'POST',
                body,
                showSuccessToast: true,
                successMessage: 'SKU已创建',
            })
        }
        showSkuModal.value = false
        await refreshSkus()
    }
    finally {
        isProcessing.value = false
    }
}

async function handleDeleteSku(id: string) {
    if (!await dialogStore.confirm('确定删除此 SKU？', { danger: true }))
        return
    isProcessing.value = true
    try {
        await useNuxtApp().$leporid(`/api/admin/platform/skus/${id}`, {
            method: 'DELETE',
            showSuccessToast: true,
            successMessage: 'SKU已删除',
        })
        await refreshSkus()
    }
    finally {
        isProcessing.value = false
    }
}

function formatDateTime(iso: string) {
    return new Date(iso).toLocaleString()
}

useHead({ title: '平台配置' })

definePageMeta({
    layout: 'admin',
    middleware: ['require-admin'],
})
</script>

<template>
    <div class="space-y-8">
        <!-- Presets section -->
        <section>
            <div class="flex items-center justify-between mb-4">
                <h1 class="text-2xl font-bold">
                    平台预设
                </h1>
                <button class="btn btn-primary btn-sm" @click="openPresetCreate">
                    <Icon name="mdi:plus" class="w-4 h-4" />
                    新增预设
                </button>
            </div>

            <div class="overflow-x-auto">
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th>商品名称</th>
                            <th>描述</th>
                            <th>材料ID</th>
                            <th>类型ID</th>
                            <th>创建时间</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="preset in presets?.records" :key="preset.id">
                            <td class="font-medium">
                                {{ preset.product_name }}
                            </td>
                            <td class="text-sm max-w-48 truncate">
                                {{ preset.product_description }}
                            </td>
                            <td class="font-mono text-xs">
                                {{ preset.product_material_id?.slice(-8) }}
                            </td>
                            <td class="font-mono text-xs">
                                {{ preset.product_type_id?.slice(-8) }}
                            </td>
                            <td class="text-xs text-base-content/60">
                                {{ formatDateTime(preset.created_at) }}
                            </td>
                            <td>
                                <div class="flex gap-1">
                                    <button class="btn btn-ghost btn-xs" @click="openPresetEdit(preset)">
                                        编辑
                                    </button>
                                    <button
                                        class="btn btn-error btn-xs btn-outline"
                                        :disabled="isProcessing"
                                        @click="handleDeletePreset(preset.id)"
                                    >
                                        删除
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div v-if="!presets?.records?.length" class="text-center py-8 text-base-content/50">
                    暂无预设数据
                </div>
            </div>

            <AdminPagination
                v-if="presets"
                :total-pages="presets.total_page"
                :current-page="presetParams.page_number"
                @update:current-page="(p: number) => { presetParams.page_number = p; refreshPresets() }"
            />
        </section>

        <div class="divider" />

        <!-- SKUs section -->
        <section>
            <div class="flex items-center justify-between mb-4">
                <h1 class="text-2xl font-bold">
                    平台 SKU
                </h1>
                <button class="btn btn-primary btn-sm" @click="openSkuCreate">
                    <Icon name="mdi:plus" class="w-4 h-4" />
                    新增 SKU
                </button>
            </div>

            <div class="overflow-x-auto">
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th>平台</th>
                            <th>方案ID</th>
                            <th>SKU ID</th>
                            <th>数量</th>
                            <th>关联预设</th>
                            <th>创建时间</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="sku in skus?.records" :key="sku.id">
                            <td class="font-medium">
                                {{ sku.platform }}
                            </td>
                            <td class="font-mono text-xs">
                                {{ sku.plan_id }}
                            </td>
                            <td class="font-mono text-xs">
                                {{ sku.sku_id || '-' }}
                            </td>
                            <td>{{ sku.quantity }}</td>
                            <td class="text-sm max-w-32 truncate">
                                {{ sku.preset?.product_name || sku.preset_id.slice(-8) }}
                            </td>
                            <td class="text-xs text-base-content/60">
                                {{ formatDateTime(sku.created_at) }}
                            </td>
                            <td>
                                <div class="flex gap-1">
                                    <button class="btn btn-ghost btn-xs" @click="openSkuEdit(sku)">
                                        编辑
                                    </button>
                                    <button
                                        class="btn btn-error btn-xs btn-outline"
                                        :disabled="isProcessing"
                                        @click="handleDeleteSku(sku.id)"
                                    >
                                        删除
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div v-if="!skus?.records?.length" class="text-center py-8 text-base-content/50">
                    暂无 SKU 数据
                </div>
            </div>

            <AdminPagination
                v-if="skus"
                :total-pages="skus.total_page"
                :current-page="skuParams.page_number"
                @update:current-page="(p: number) => { skuParams.page_number = p; refreshSkus() }"
            />
        </section>

        <!-- Preset modal -->
        <dialog class="modal" :class="{ 'modal-open': showPresetModal }">
            <div class="modal-box max-w-lg">
                <h3 class="text-lg font-bold">
                    {{ presetEditing ? '编辑预设' : '新增预设' }}
                </h3>
                <div class="mt-4 space-y-3">
                    <label class="form-control">
                        <span class="label-text text-sm">商品名称</span>
                        <input v-model="presetForm.product_name" class="input input-bordered input-sm">
                    </label>
                    <label class="form-control">
                        <span class="label-text text-sm">描述</span>
                        <input v-model="presetForm.product_description" class="input input-bordered input-sm">
                    </label>
                    <label class="form-control">
                        <span class="label-text text-sm">商品设计模板 (JSON)</span>
                        <textarea
                            v-model="presetForm.product_design"
                            class="textarea textarea-bordered h-24 font-mono text-xs"
                        />
                    </label>
                    <label class="form-control">
                        <span class="label-text text-sm">材料 ID</span>
                        <input
                            v-model="presetForm.product_material_id"
                            class="input input-bordered input-sm font-mono text-xs"
                            placeholder="UUID"
                        >
                    </label>
                    <label class="form-control">
                        <span class="label-text text-sm">类型 ID</span>
                        <input
                            v-model="presetForm.product_type_id"
                            class="input input-bordered input-sm font-mono text-xs"
                            placeholder="UUID"
                        >
                    </label>
                </div>
                <div class="modal-action">
                    <button class="btn btn-ghost btn-sm" @click="showPresetModal = false">
                        取消
                    </button>
                    <button class="btn btn-primary btn-sm" :disabled="isProcessing" @click="handleSavePreset">
                        保存
                    </button>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop">
                <button @click="showPresetModal = false">
                    close
                </button>
            </form>
        </dialog>

        <!-- SKU modal -->
        <dialog class="modal" :class="{ 'modal-open': showSkuModal }">
            <div class="modal-box max-w-lg">
                <h3 class="text-lg font-bold">
                    {{ skuEditing ? '编辑 SKU' : '新增 SKU' }}
                </h3>
                <div class="mt-4 space-y-3">
                    <label class="form-control">
                        <span class="label-text text-sm">平台标识</span>
                        <input v-model="skuForm.platform" class="input input-bordered input-sm" placeholder="如 afdian">
                    </label>
                    <label class="form-control">
                        <span class="label-text text-sm">方案 ID</span>
                        <input v-model="skuForm.plan_id" class="input input-bordered input-sm font-mono text-xs">
                    </label>
                    <label class="form-control">
                        <span class="label-text text-sm">SKU ID（可选）</span>
                        <input v-model="skuForm.sku_id" class="input input-bordered input-sm font-mono text-xs">
                    </label>
                    <label class="form-control">
                        <span class="label-text text-sm">数量</span>
                        <input v-model.number="skuForm.quantity" type="number" min="1" class="input input-bordered input-sm">
                    </label>
                    <label class="form-control">
                        <span class="label-text text-sm">关联预设 ID</span>
                        <input v-model="skuForm.preset_id" class="input input-bordered input-sm font-mono text-xs" placeholder="UUID">
                    </label>
                </div>
                <div class="modal-action">
                    <button class="btn btn-ghost btn-sm" @click="showSkuModal = false">
                        取消
                    </button>
                    <button class="btn btn-primary btn-sm" :disabled="isProcessing" @click="handleSaveSku">
                        保存
                    </button>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop">
                <button @click="showSkuModal = false">
                    close
                </button>
            </form>
        </dialog>
    </div>
</template>
