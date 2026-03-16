<script setup lang="ts">
interface MarketplacePresetDetail {
    id: string
    product_name: string
    product_description: string
    product_design: Record<string, unknown>
    product_material_id: string
    product_type_id: string
    material: ProductMaterialPublic
    type: ProductTypePublic
}

interface PageData<T> {
    records: T[]
    total: number
    page_number: number
    page_size: number
    total_pages: number
}

const route = useRoute()
const { loggedIn } = useUserSession()

const presetId = computed(() => {
    const raw = route.query.preset
    if (Array.isArray(raw))
        return raw[0] ?? ''
    return raw ?? ''
})

const routeDesignType = computed<ProductTypeDesign | null>(() => {
    const raw = route.query.type
    const value = Array.isArray(raw) ? raw[0] : raw
    if (value === undefined)
        return null
    const parsed = Number(value)
    if (parsed !== 0 && parsed !== 1)
        return null
    return parsed as ProductTypeDesign
})

const selectedMaterialId = ref('')
const selectedTypeId = ref('')
const designText = ref('{}')
const quantity = ref(1)

const shippingName = ref('')
const shippingPhone = ref('')
const shippingAddress = ref('')

const preset = ref<MarketplacePresetDetail | null>(null)
const consultResult = ref<ProductConsultResponse | null>(null)
const consultError = ref('')
const isConsulting = ref(false)
const isSubmitting = ref(false)

const { data: materialsPage } = await useLeporid<PageData<ProductMaterialPublic>>('/api/platform/product-materials?page_size=100', {
	server: true,
})

const { data: typesPage } = await useLeporid<PageData<ProductTypePublic>>('/api/platform/product-types?page_size=100', {
	server: true,
})

const materials = computed(() => materialsPage.value?.records ?? [])
const types = computed(() => typesPage.value?.records ?? [])

if (presetId.value) {
    const { data: presetData } = await useLeporid<MarketplacePresetDetail>(`/api/platform/presets/${presetId.value}`, {
        server: true,
    })
    if (presetData.value) {
        preset.value = presetData.value
        selectedMaterialId.value = presetData.value.product_material_id
        selectedTypeId.value = presetData.value.product_type_id
        designText.value = JSON.stringify(presetData.value.product_design, null, 2)
    }
}

if (!selectedMaterialId.value && materials.value.length > 0) {
    selectedMaterialId.value = materials.value[0]!.id
}

if (!selectedTypeId.value && types.value.length > 0) {
    if (routeDesignType.value !== null) {
        const matched = types.value.find(item => item.design_type === routeDesignType.value)
        selectedTypeId.value = matched?.id ?? types.value[0]!.id
    }
    else {
        selectedTypeId.value = types.value[0]!.id
    }
}

const selectedMaterial = computed(() => {
    return materials.value.find(item => item.id === selectedMaterialId.value) ?? null
})

const selectedType = computed(() => {
    return types.value.find(item => item.id === selectedTypeId.value) ?? null
})

const parsedDesign = computed(() => {
    try {
        return {
            valid: true,
            value: JSON.parse(designText.value) as Record<string, unknown>,
        }
    }
    catch {
        return {
            valid: false,
            value: null,
        }
    }
})

let consultTimer: ReturnType<typeof setTimeout> | null = null
let consultSeq = 0

async function runConsult() {
    if (!selectedMaterialId.value || !selectedTypeId.value) {
        consultResult.value = null
        return
    }
    if (!parsedDesign.value.valid || !parsedDesign.value.value) {
        consultError.value = '设计 JSON 无法解析，请检查格式'
        consultResult.value = null
        return
    }

    const seq = ++consultSeq
    isConsulting.value = true
    consultError.value = ''

    try {
        const result = await useNuxtApp().$leporid<ProductConsultResponse>('/api/products/consult', {
            method: 'POST',
            body: {
                design: parsedDesign.value.value,
                material_id: selectedMaterialId.value,
                type_id: selectedTypeId.value,
            },
        })
        if (seq !== consultSeq)
            return
        consultResult.value = result
    }
    catch {
        if (seq !== consultSeq)
            return
        consultResult.value = null
        consultError.value = '询价失败，请稍后重试'
    }
    finally {
        if (seq === consultSeq)
            isConsulting.value = false
    }
}

function scheduleConsult() {
    if (consultTimer)
        clearTimeout(consultTimer)
    consultTimer = setTimeout(() => {
        void runConsult()
    }, 400)
}

onBeforeUnmount(() => {
    if (consultTimer)
        clearTimeout(consultTimer)
})

if (import.meta.client) {
    watch([selectedMaterialId, selectedTypeId, designText], () => {
        scheduleConsult()
    }, { immediate: true })
}

const canSubmit = computed(() => {
    if (isSubmitting.value || isConsulting.value)
        return false
    if (!consultResult.value)
        return false
    if (!selectedMaterialId.value || !selectedTypeId.value)
        return false
    if (!parsedDesign.value.valid || !parsedDesign.value.value)
        return false
    if (!shippingName.value || !shippingPhone.value || !shippingAddress.value)
        return false
    if (quantity.value < 1)
        return false
    return true
})

useHead({
    title: '定制下单 - 市场',
})

async function handleSubmit() {
    if (!loggedIn.value) {
        return navigateTo(`/auth/login?redirect=${encodeURIComponent(route.fullPath)}`)
    }
    if (!canSubmit.value || !consultResult.value || !parsedDesign.value.value)
        return

    isSubmitting.value = true
    try {
        const product = await useNuxtApp().$leporid<ProductPublic>('/api/products', {
            method: 'POST',
            body: {
                name: consultResult.value.name,
                description: consultResult.value.description,
                design: parsedDesign.value.value,
                material_id: selectedMaterialId.value,
                type_id: selectedTypeId.value,
            },
        })

        const order = await useNuxtApp().$leporid<OrderSimplePublic>('/api/orders', {
            method: 'POST',
            body: {
                items: [{ product_id: product.id, quantity: quantity.value }],
                shipping_name: shippingName.value,
                shipping_phone: shippingPhone.value,
                shipping_address: shippingAddress.value,
            },
        })

        await navigateTo(`/orders/${order.id}`)
    }
    finally {
        isSubmitting.value = false
    }
}
</script>

<template>
    <div class="max-w-4xl mx-auto px-6 sm:px-10 py-10 space-y-6">
        <header>
            <NuxtLink to="/marketplace" class="link link-hover text-sm text-base-content/70">
                ← 返回市场
            </NuxtLink>
            <h1 class="text-2xl sm:text-3xl font-semibold mt-3">
                定制下单
            </h1>
            <p class="text-sm text-base-content/70 mt-2">
                你可以完全自定义商品选项；每次调整后都会自动询价。
            </p>
        </header>

        <section v-if="preset" class="border border-primary/30 bg-primary/5 rounded-lg p-4">
            <p class="text-xs uppercase tracking-wider text-primary">
                已加载预设
            </p>
            <p class="font-medium mt-1">
                {{ preset.product_name }}
            </p>
            <p class="text-sm text-base-content/70 mt-1">
                {{ preset.product_description }}
            </p>
        </section>

        <section class="grid sm:grid-cols-2 gap-4">
            <label class="form-control w-full">
                <span class="label-text">材料</span>
                <select v-model="selectedMaterialId" class="select select-bordered w-full">
                    <option v-for="item in materials" :key="item.id" :value="item.id">
                        {{ item.name }}
                    </option>
                </select>
            </label>

            <label class="form-control w-full">
                <span class="label-text">类型</span>
                <select v-model="selectedTypeId" class="select select-bordered w-full">
                    <option v-for="item in types" :key="item.id" :value="item.id">
                        {{ item.name }}
                    </option>
                </select>
            </label>

            <label class="form-control w-full sm:col-span-2">
                <span class="label-text">设计 JSON</span>
                <textarea v-model="designText" class="textarea textarea-bordered h-40 font-mono text-xs" />
                <span v-if="!parsedDesign.valid" class="label-text-alt text-error">JSON 格式无效</span>
            </label>

            <label class="form-control w-full sm:col-span-2">
                <span class="label-text">数量</span>
                <input v-model.number="quantity" min="1" type="number" class="input input-bordered w-full">
            </label>
        </section>

        <section class="grid sm:grid-cols-3 gap-4">
            <label class="form-control w-full sm:col-span-1">
                <span class="label-text">收件人</span>
                <input v-model="shippingName" type="text" class="input input-bordered w-full">
            </label>
            <label class="form-control w-full sm:col-span-1">
                <span class="label-text">联系电话</span>
                <input v-model="shippingPhone" type="text" class="input input-bordered w-full">
            </label>
            <label class="form-control w-full sm:col-span-3">
                <span class="label-text">收货地址</span>
                <input v-model="shippingAddress" type="text" class="input input-bordered w-full">
            </label>
        </section>

        <section class="border border-base-300 rounded-lg p-4 space-y-2">
            <div class="text-sm text-base-content/70">
                当前材料：{{ selectedMaterial?.name ?? '-' }}
            </div>
            <div class="text-sm text-base-content/70">
                当前类型：{{ selectedType?.name ?? '-' }}
            </div>
            <div v-if="isConsulting" class="text-sm text-base-content/70">
                正在询价...
            </div>
            <div v-else-if="consultError" class="text-sm text-error">
                {{ consultError }}
            </div>
            <template v-else-if="consultResult">
                <div class="font-medium">
                    {{ consultResult.name }}
                </div>
                <div class="text-sm text-base-content/70">
                    {{ consultResult.description }}
                </div>
                <div class="text-lg font-semibold text-primary">
                    ￥{{ consultResult.price }}
                </div>
            </template>
        </section>

        <div class="flex justify-end">
            <button class="btn btn-primary" :disabled="!canSubmit" @click="handleSubmit">
                <span v-if="isSubmitting" class="loading loading-spinner loading-sm" />
                {{ loggedIn ? '确认下单' : '登录后下单' }}
            </button>
        </div>
    </div>
</template>
