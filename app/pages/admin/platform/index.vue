<script setup lang="ts">
const notificationsStore = useNotificationsStore()
const dialogStore = useDialogStore()

// Picker refs
const materialPickerRef = ref<any>()
const typePickerRef = ref<any>()
const presetPickerRef = ref<any>()

// Picker selections for forms
const selectedMaterial = ref<any | null>(null)
const selectedType = ref<any | null>(null)
const selectedPresetForSku = ref<any | null>(null)

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
    selectedMaterial.value = null
    selectedType.value = null
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
    // Placeholder objects so picker can mark them as selected
    selectedMaterial.value = preset.product_material_id ? { id: preset.product_material_id, name: preset.product_material?.name || preset.product_material_id.slice(-8) } : null
    selectedType.value = preset.product_type_id ? { id: preset.product_type_id, name: preset.product_type?.name || preset.product_type_id.slice(-8) } : null
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
            product_material_id: selectedMaterial.value?.id || presetForm.product_material_id,
            product_type_id: selectedType.value?.id || presetForm.product_type_id,
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
    selectedPresetForSku.value = null
    Object.assign(skuForm, { platform: '', plan_id: '', sku_id: '', quantity: 1, preset_id: '' })
    showSkuModal.value = true
}

function openSkuEdit(sku: any) {
    skuEditing.value = sku.id
    selectedPresetForSku.value = sku.preset_id ? { id: sku.preset_id, product_name: sku.preset?.product_name || sku.preset_id.slice(-8) } : null
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
            preset_id: selectedPresetForSku.value?.id || skuForm.preset_id,
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

// === Product Materials ===
const materialParams = reactive({ page_number: 1, page_size: 20 })
const { data: materials, refresh: refreshMaterials } = await useLeporid<any>('/api/admin/platform/product-materials', {
    params: materialParams,
})

const showMaterialModal = ref(false)
const materialEditing = ref<string | null>(null)
const materialForm = reactive({
    name: '',
    description: '',
    price_modifier: '0.00',
})

function openMaterialCreate() {
    materialEditing.value = null
    Object.assign(materialForm, { name: '', description: '', price_modifier: '0.00' })
    showMaterialModal.value = true
}

function openMaterialEdit(material: any) {
    materialEditing.value = material.id
    Object.assign(materialForm, {
        name: material.name,
        description: material.description,
        price_modifier: String(material.price_modifier),
    })
    showMaterialModal.value = true
}

async function handleSaveMaterial() {
    isProcessing.value = true
    try {
        const body = {
            name: materialForm.name,
            description: materialForm.description,
            price_modifier: Number.parseFloat(materialForm.price_modifier || '0'),
        }
        if (materialEditing.value) {
            await useNuxtApp().$leporid(`/api/admin/platform/product-materials/${materialEditing.value}`, {
                method: 'PATCH',
                body,
                showSuccessToast: true,
                successMessage: '材料已更新',
            })
        }
        else {
            await useNuxtApp().$leporid('/api/admin/platform/product-materials', {
                method: 'POST',
                body,
                showSuccessToast: true,
                successMessage: '材料已创建',
            })
        }
        showMaterialModal.value = false
        await refreshMaterials()
    }
    finally {
        isProcessing.value = false
    }
}

async function handleDeleteMaterial(id: string) {
    if (!await dialogStore.confirm('确定删除此材料？关联的预设和商品可能受影响。', { danger: true }))
        return
    isProcessing.value = true
    try {
        await useNuxtApp().$leporid(`/api/admin/platform/product-materials/${id}`, {
            method: 'DELETE',
            showSuccessToast: true,
            successMessage: '材料已删除',
        })
        await refreshMaterials()
    }
    finally {
        isProcessing.value = false
    }
}

// === Product Types ===
const typeParams = reactive({ page_number: 1, page_size: 20 })
const { data: types, refresh: refreshTypes } = await useLeporid<any>('/api/admin/platform/product-types', {
    params: typeParams,
})

const DESIGN_TYPE_LABELS: Record<number, string> = {
    0: 'UsagiCardDX',
    1: 'UsagiCardWars',
}

const FUNCTION_TYPE_LABELS: Record<number, string> = {
    0: 'UsagiCard',
    1: 'MaiMaiCN',
}

const showTypeModal = ref(false)
const typeEditing = ref<string | null>(null)
const typeForm = reactive({
    name: '',
    description: '',
    design_type: 0 as 0 | 1,
    function_types: [] as (0 | 1)[],
    price_modifier: '0.00',
})

function openTypeCreate() {
    typeEditing.value = null
    Object.assign(typeForm, { name: '', description: '', design_type: 0, function_types: [], price_modifier: '0.00' })
    showTypeModal.value = true
}

function openTypeEdit(type: any) {
    typeEditing.value = type.id
    Object.assign(typeForm, {
        name: type.name,
        description: type.description,
        design_type: type.design_type ?? 0,
        function_types: type.function_types ? [...type.function_types] : [],
        price_modifier: type.price_modifier ?? '0.00',
    })
    showTypeModal.value = true
}

async function handleSaveType() {
    isProcessing.value = true
    try {
        const body = {
            name: typeForm.name,
            description: typeForm.description,
            design_type: typeForm.design_type,
            function_types: typeForm.function_types,
            price_modifier: typeForm.price_modifier,
        }
        if (typeEditing.value) {
            await useNuxtApp().$leporid(`/api/admin/platform/product-types/${typeEditing.value}`, {
                method: 'PATCH',
                body,
                showSuccessToast: true,
                successMessage: '类型已更新',
            })
        }
        else {
            await useNuxtApp().$leporid('/api/admin/platform/product-types', {
                method: 'POST',
                body,
                showSuccessToast: true,
                successMessage: '类型已创建',
            })
        }
        showTypeModal.value = false
        await refreshTypes()
    }
    finally {
        isProcessing.value = false
    }
}

async function handleDeleteType(id: string) {
    if (!await dialogStore.confirm('确定删除此商品类型？关联的预设和商品可能受影响。', { danger: true }))
        return
    isProcessing.value = true
    try {
        await useNuxtApp().$leporid(`/api/admin/platform/product-types/${id}`, {
            method: 'DELETE',
            showSuccessToast: true,
            successMessage: '类型已删除',
        })
        await refreshTypes()
    }
    finally {
        isProcessing.value = false
    }
}
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
                                    <button class="btn btn-accent btn-xs" @click="openPresetEdit(preset)">
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
                                    <button class="btn btn-accent btn-xs" @click="openSkuEdit(sku)">
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
                        <span class="label-text text-sm mb-1">商品名称</span>
                        <input v-model="presetForm.product_name" class="input input-bordered input-sm w-full">
                    </label>
                    <label class="form-control">
                        <span class="label-text text-sm mb-1">描述</span>
                        <input v-model="presetForm.product_description" class="input input-bordered input-sm w-full">
                    </label>
                    <label class="form-control flex flex-col">
                        <span class="label-text text-sm mb-1">商品设计模板 (JSON)</span>
                        <textarea
                            v-model="presetForm.product_design"
                            class="textarea textarea-bordered h-48 font-mono text-xs resize-y w-full"
                        />
                    </label>
                    <div class="form-control">
                        <span class="label-text text-sm mb-1">材料</span>
                        <div class="flex gap-2">
                            <input
                                :value="selectedMaterial ? selectedMaterial.name : ''"
                                readonly
                                class="input input-bordered input-sm flex-1 text-xs"
                                placeholder="点击右侧选择材料"
                            >
                            <button
                                class="btn btn-accent btn-sm"
                                type="button"
                                @click="materialPickerRef?.open(selectedMaterial ? [selectedMaterial] : [])"
                            >
                                {{ selectedMaterial ? '重选' : '选择' }}
                            </button>
                        </div>
                    </div>
                    <div class="form-control">
                        <span class="label-text text-sm mb-1">商品类型</span>
                        <div class="flex gap-2">
                            <input
                                :value="selectedType ? selectedType.name : ''"
                                readonly
                                class="input input-bordered input-sm flex-1 text-xs"
                                placeholder="点击右侧选择类型"
                            >
                            <button
                                class="btn btn-accent btn-sm"
                                type="button"
                                @click="typePickerRef?.open(selectedType ? [selectedType] : [])"
                            >
                                {{ selectedType ? '重选' : '选择' }}
                            </button>
                        </div>
                    </div>
                </div>
                <div class="modal-action">
                    <button class="btn btn-outline btn-sm" @click="showPresetModal = false">
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

        <!-- Material / Type / Preset pickers -->
        <AdminResourcePicker
            ref="materialPickerRef"
            resource-type="material"
            :multiple="false"
            title="选择材料"
            @confirm="items => { if (items[0]) { selectedMaterial = items[0]; presetForm.product_material_id = items[0].id } }"
        />
        <AdminResourcePicker
            ref="typePickerRef"
            resource-type="type"
            :multiple="false"
            title="选择商品类型"
            @confirm="items => { if (items[0]) { selectedType = items[0]; presetForm.product_type_id = items[0].id } }"
        />
        <AdminResourcePicker
            ref="presetPickerRef"
            resource-type="preset"
            :multiple="false"
            title="选择预设"
            @confirm="items => { if (items[0]) { selectedPresetForSku = items[0]; skuForm.preset_id = items[0].id } }"
        />

        <!-- SKU modal -->
        <dialog class="modal" :class="{ 'modal-open': showSkuModal }">
            <div class="modal-box max-w-lg">
                <h3 class="text-lg font-bold">
                    {{ skuEditing ? '编辑 SKU' : '新增 SKU' }}
                </h3>
                <div class="mt-4 space-y-3">
                    <label class="form-control">
                        <span class="label-text text-sm mb-1">平台标识</span>
                        <input v-model="skuForm.platform" class="input input-bordered input-sm w-full" placeholder="如 afdian">
                    </label>
                    <label class="form-control">
                        <span class="label-text text-sm mb-1">方案 ID</span>
                        <input v-model="skuForm.plan_id" class="input input-bordered input-sm w-full font-mono text-xs">
                    </label>
                    <label class="form-control">
                        <span class="label-text text-sm mb-1">SKU ID（可选）</span>
                        <input v-model="skuForm.sku_id" class="input input-bordered input-sm w-full font-mono text-xs">
                    </label>
                    <label class="form-control">
                        <span class="label-text text-sm mb-1">数量</span>
                        <input v-model.number="skuForm.quantity" type="number" min="1" class="input input-bordered input-sm w-full">
                    </label>
                    <div class="form-control">
                        <span class="label-text text-sm mb-1">关联预设</span>
                        <div class="flex gap-2">
                            <input
                                :value="selectedPresetForSku ? selectedPresetForSku.product_name : ''"
                                readonly
                                class="input input-bordered input-sm flex-1 text-xs"
                                placeholder="点击右侧选择预设"
                            >
                            <button
                                class="btn btn-accent btn-sm"
                                type="button"
                                @click="presetPickerRef?.open(selectedPresetForSku ? [selectedPresetForSku] : [])"
                            >
                                {{ selectedPresetForSku ? '重选' : '选择' }}
                            </button>
                        </div>
                    </div>
                </div>
                <div class="modal-action">
                    <button class="btn btn-outline btn-sm" @click="showSkuModal = false">
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

        <div class="divider" />

        <!-- Materials section -->
        <section>
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-2xl font-bold">
                    商品材料
                </h2>
                <button class="btn btn-primary btn-sm" @click="openMaterialCreate">
                    <Icon name="mdi:plus" class="w-4 h-4" />
                    新增材料
                </button>
            </div>

            <div class="overflow-x-auto">
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th>名称</th>
                            <th>描述</th>
                            <th>价格修正</th>
                            <th>创建时间</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="material in materials?.records" :key="material.id">
                            <td class="font-medium">
                                {{ material.name }}
                            </td>
                            <td class="text-sm max-w-48 truncate">
                                {{ material.description }}
                            </td>
                            <td class="font-semibold">
                                +¥{{ Number.parseFloat(material.price_modifier).toFixed(2) }}
                            </td>
                            <td class="text-xs text-base-content/60">
                                {{ formatDateTime(material.created_at) }}
                            </td>
                            <td>
                                <div class="flex gap-1">
                                    <button class="btn btn-accent btn-xs" @click="openMaterialEdit(material)">
                                        编辑
                                    </button>
                                    <button
                                        class="btn btn-error btn-xs btn-outline"
                                        :disabled="isProcessing"
                                        @click="handleDeleteMaterial(material.id)"
                                    >
                                        删除
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div v-if="!materials?.records?.length" class="text-center py-8 text-base-content/50">
                    暂无材料数据
                </div>
            </div>

            <AdminPagination
                v-if="materials"
                :total-pages="materials.total_page"
                :current-page="materialParams.page_number"
                @update:current-page="(p: number) => { materialParams.page_number = p; refreshMaterials() }"
            />
        </section>

        <div class="divider" />

        <!-- Types section -->
        <section>
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-2xl font-bold">
                    商品类型
                </h2>
                <button class="btn btn-primary btn-sm" @click="openTypeCreate">
                    <Icon name="mdi:plus" class="w-4 h-4" />
                    新增类型
                </button>
            </div>

            <div class="overflow-x-auto">
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th>名称</th>
                            <th>描述</th>
                            <th>设计类型</th>
                            <th>功能类型</th>
                            <th>价格修正</th>
                            <th>创建时间</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="type in types?.records" :key="type.id">
                            <td class="font-medium">
                                {{ type.name }}
                            </td>
                            <td class="text-sm max-w-48 truncate">
                                {{ type.description }}
                            </td>
                            <td class="text-xs">
                                {{ DESIGN_TYPE_LABELS[type.design_type] ?? type.design_type }}
                            </td>
                            <td class="text-xs">
                                {{ (type.function_types ?? []).map((f: number) => FUNCTION_TYPE_LABELS[f] ?? f).join(', ') || '-' }}
                            </td>
                            <td class="text-xs">
                                ¥{{ type.price_modifier }}
                            </td>
                            <td class="text-xs text-base-content/60">
                                {{ formatDateTime(type.created_at) }}
                            </td>
                            <td>
                                <div class="flex gap-1">
                                    <button class="btn btn-accent btn-xs" @click="openTypeEdit(type)">
                                        编辑
                                    </button>
                                    <button
                                        class="btn btn-error btn-xs btn-outline"
                                        :disabled="isProcessing"
                                        @click="handleDeleteType(type.id)"
                                    >
                                        删除
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div v-if="!types?.records?.length" class="text-center py-8 text-base-content/50">
                    暂无类型数据
                </div>
            </div>

            <AdminPagination
                v-if="types"
                :total-pages="types.total_page"
                :current-page="typeParams.page_number"
                @update:current-page="(p: number) => { typeParams.page_number = p; refreshTypes() }"
            />
        </section>

        <!-- Material modal -->
        <dialog class="modal" :class="{ 'modal-open': showMaterialModal }">
            <div class="modal-box max-w-md">
                <h3 class="text-lg font-bold">
                    {{ materialEditing ? '编辑材料' : '新增材料' }}
                </h3>
                <div class="mt-4 space-y-3">
                    <label class="form-control">
                        <span class="label-text text-sm mb-1">名称</span>
                        <input v-model="materialForm.name" class="input input-bordered input-sm w-full">
                    </label>
                    <label class="form-control">
                        <span class="label-text text-sm mb-1">描述</span>
                        <input v-model="materialForm.description" class="input input-bordered input-sm w-full">
                    </label>
                    <label class="form-control">
                        <span class="label-text text-sm mb-1">价格修正（元）</span>
                        <input
                            v-model="materialForm.price_modifier"
                            type="number"
                            step="0.01"
                            class="input input-bordered input-sm w-full"
                            placeholder="0.00"
                        >
                    </label>
                </div>
                <div class="modal-action">
                    <button class="btn btn-outline btn-sm" @click="showMaterialModal = false">
                        取消
                    </button>
                    <button class="btn btn-primary btn-sm" :disabled="isProcessing" @click="handleSaveMaterial">
                        保存
                    </button>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop">
                <button @click="showMaterialModal = false">
                    close
                </button>
            </form>
        </dialog>

        <!-- Type modal -->
        <dialog class="modal" :class="{ 'modal-open': showTypeModal }">
            <div class="modal-box max-w-md">
                <h3 class="text-lg font-bold">
                    {{ typeEditing ? '编辑商品类型' : '新增商品类型' }}
                </h3>
                <div class="mt-4 space-y-3">
                    <label class="form-control">
                        <span class="label-text text-sm mb-1">名称</span>
                        <input v-model="typeForm.name" class="input input-bordered input-sm w-full">
                    </label>
                    <label class="form-control">
                        <span class="label-text text-sm mb-1">描述</span>
                        <input v-model="typeForm.description" class="input input-bordered input-sm w-full">
                    </label>
                    <label class="form-control">
                        <span class="label-text text-sm mb-1">设计类型</span>
                        <select v-model="typeForm.design_type" class="select select-bordered select-sm w-full">
                            <option v-for="(label, val) in DESIGN_TYPE_LABELS" :key="val" :value="Number(val)">
                                {{ label }}
                            </option>
                        </select>
                    </label>
                    <div class="form-control">
                        <span class="label-text text-sm mb-1">功能类型</span>
                        <div class="flex gap-4 mt-1">
                            <label
                                v-for="(label, val) in FUNCTION_TYPE_LABELS"
                                :key="val"
                                class="flex items-center gap-2 cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    class="checkbox checkbox-sm"
                                    :checked="typeForm.function_types.includes(Number(val) as 0 | 1)"
                                    @change="(e) => { const v = Number(val) as 0 | 1; const checked = (e.target as HTMLInputElement).checked; typeForm.function_types = checked ? [...typeForm.function_types, v] : typeForm.function_types.filter(f => f !== v) }"
                                >
                                <span class="text-sm">{{ label }}</span>
                            </label>
                        </div>
                    </div>
                    <label class="form-control">
                        <span class="label-text text-sm mb-1">价格修正（元）</span>
                        <input
                            v-model="typeForm.price_modifier"
                            type="number"
                            step="0.01"
                            class="input input-bordered input-sm w-full"
                            placeholder="0.00"
                        >
                    </label>
                </div>
                <div class="modal-action">
                    <button class="btn btn-outline btn-sm" @click="showTypeModal = false">
                        取消
                    </button>
                    <button class="btn btn-primary btn-sm" :disabled="isProcessing" @click="handleSaveType">
                        保存
                    </button>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop">
                <button @click="showTypeModal = false">
                    close
                </button>
            </form>
        </dialog>
    </div>
</template>
