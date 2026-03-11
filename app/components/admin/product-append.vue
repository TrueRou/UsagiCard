<script setup lang="ts">
const props = defineProps<{
    orderId: string
}>()

const emit = defineEmits<{
    (e: 'done'): void
}>()

const isOpen = ref(false)
const isSubmitting = ref(false)
const designError = ref('')

const form = reactive({
    name: '' as string | null,
    description: '' as string | null,
    design: '{}',
    material_id: '' as string,
    type_id: '' as string,
    quantity: 1,
})

const selectedMaterial = ref<any | null>(null)
const selectedType = ref<any | null>(null)
const presetPickerRef = ref<any>()
const materialPickerRef = ref<any>()
const typePickerRef = ref<any>()

function open() {
    form.name = null
    form.description = null
    form.design = '{}'
    form.material_id = ''
    form.type_id = ''
    form.quantity = 1
    selectedMaterial.value = null
    selectedType.value = null
    designError.value = ''
    isOpen.value = true
}

function onPresetConfirm(items: any[]) {
    const preset = items[0]
    if (!preset)
        return
    form.name = preset.product_name
    form.description = preset.product_description
    form.design = JSON.stringify(preset.product_design, null, 2)
    form.material_id = preset.product_material_id
    form.type_id = preset.product_type_id
    selectedMaterial.value = { id: preset.product_material_id, name: '(从预设值继承)' }
    selectedType.value = { id: preset.product_type_id, name: '(从预设值继承)' }
}

function onMaterialConfirm(items: any[]) {
    const m = items[0]
    if (!m)
        return
    selectedMaterial.value = m
    form.material_id = m.id
}

function onTypeConfirm(items: any[]) {
    const t = items[0]
    if (!t)
        return
    selectedType.value = t
    form.type_id = t.id
}

async function handleSubmit() {
    if (!form.material_id || !form.type_id) {
        designError.value = '请选择材料和类型'
        return
    }
    try {
        JSON.parse(form.design)
        designError.value = ''
    }
    catch {
        designError.value = 'Design JSON 格式错误'
        return
    }

    isSubmitting.value = true
    try {
        await useNuxtApp().$leporid(`/api/admin/orders/${props.orderId}/items`, {
            method: 'POST',
            body: {
                name: form.name || null,
                description: form.description || null,
                design: JSON.parse(form.design),
                material_id: form.material_id,
                type_id: form.type_id,
                quantity: form.quantity,
            },
            showSuccessToast: true,
            successMessage: '商品已添加到订单',
        })
        isOpen.value = false
        emit('done')
    }
    finally {
        isSubmitting.value = false
    }
}

defineExpose({ open })
</script>

<template>
    <dialog class="modal" :class="{ 'modal-open': isOpen }">
        <div class="modal-box max-w-2xl">
            <h3 class="text-lg font-bold mb-4">
                添加商品到订单
            </h3>

            <div class="space-y-3">
                <!-- 从 Preset 填充 -->
                <div class="bg-base-200 rounded-lg p-3 flex items-center gap-3">
                    <span class="text-sm text-base-content/70">从预设快速填充：</span>
                    <button
                        class="btn btn-outline btn-sm"
                        type="button"
                        @click="presetPickerRef?.open()"
                    >
                        <Icon name="mdi:package-variant" class="w-4 h-4" />
                        选择 Preset
                    </button>
                </div>

                <!-- 商品名称 -->
                <fieldset class="fieldset">
                    <legend class="fieldset-legend">
                        商品名称（留空自动生成）
                    </legend>
                    <input v-model="form.name" type="text" placeholder="自动根据材料和类型生成" class="input w-full">
                </fieldset>

                <!-- 描述 -->
                <fieldset class="fieldset">
                    <legend class="fieldset-legend">
                        商品描述（留空自动生成）
                    </legend>
                    <input v-model="form.description" type="text" placeholder="自动生成描述" class="input w-full">
                </fieldset>

                <!-- 材料 -->
                <fieldset class="fieldset">
                    <legend class="fieldset-legend">
                        材料 <span class="text-error">*</span>
                    </legend>
                    <div class="flex items-center gap-3">
                        <button
                            class="btn btn-outline btn-sm"
                            type="button"
                            @click="materialPickerRef?.open(selectedMaterial ? [selectedMaterial] : [])"
                        >
                            选择材料
                        </button>
                        <span class="text-sm">
                            <span v-if="selectedMaterial">{{ selectedMaterial.name }}</span>
                            <span v-else class="text-base-content/40">未选择</span>
                        </span>
                    </div>
                </fieldset>

                <!-- 类型 -->
                <fieldset class="fieldset">
                    <legend class="fieldset-legend">
                        类型 <span class="text-error">*</span>
                    </legend>
                    <div class="flex items-center gap-3">
                        <button
                            class="btn btn-outline btn-sm"
                            type="button"
                            @click="typePickerRef?.open(selectedType ? [selectedType] : [])"
                        >
                            选择类型
                        </button>
                        <span class="text-sm">
                            <span v-if="selectedType">{{ selectedType.name }}</span>
                            <span v-else class="text-base-content/40">未选择</span>
                        </span>
                    </div>
                </fieldset>

                <!-- Design JSON -->
                <fieldset class="fieldset">
                    <legend class="fieldset-legend">
                        设计 JSON <span class="text-error">*</span>
                    </legend>
                    <textarea
                        v-model="form.design"
                        class="textarea textarea-bordered w-full font-mono text-xs"
                        rows="8"
                        spellcheck="false"
                        @input="designError = ''"
                    />
                    <p v-if="designError" class="text-error text-xs mt-1">
                        {{ designError }}
                    </p>
                </fieldset>

                <!-- 数量 -->
                <fieldset class="fieldset">
                    <legend class="fieldset-legend">
                        数量
                    </legend>
                    <input v-model.number="form.quantity" type="number" min="1" class="input w-32">
                </fieldset>
            </div>

            <div class="modal-action">
                <button class="btn btn-outline btn-sm" @click="isOpen = false">
                    取消
                </button>
                <button
                    class="btn btn-primary btn-sm"
                    :disabled="isSubmitting || !form.material_id || !form.type_id"
                    @click="handleSubmit"
                >
                    <span v-if="isSubmitting" class="loading loading-spinner loading-xs" />
                    添加到订单
                </button>
            </div>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button @click="isOpen = false">
                close
            </button>
        </form>

        <!-- Pickers -->
        <AdminResourcePicker
            ref="presetPickerRef"
            resource-type="preset"
            :multiple="false"
            title="选择 Preset"
            @confirm="onPresetConfirm"
        />
        <AdminResourcePicker
            ref="materialPickerRef"
            resource-type="material"
            :multiple="false"
            title="选择材料"
            @confirm="onMaterialConfirm"
        />
        <AdminResourcePicker
            ref="typePickerRef"
            resource-type="type"
            :multiple="false"
            title="选择类型"
            @confirm="onTypeConfirm"
        />
    </dialog>
</template>
