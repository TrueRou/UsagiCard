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
const productDesign = ref<Record<string, unknown>>({})
const quantity = ref(1)

const shippingName = ref('')
const shippingPhone = ref('')
const shippingAddress = ref('')

const preset = ref<MarketplacePresetDetail | null>(null)
const consultResult = ref<ProductConsultResponse | null>(null)
const consultError = ref('')
const isConsulting = ref(false)
const isSubmitting = ref(false)

const { data: materialsPage } = await useLeporid<PageData<ProductMaterialPublic>>('/api/platform/product-materials?page_size=50', {
    server: true,
})

const { data: typesPage } = await useLeporid<PageData<ProductTypePublic>>('/api/platform/product-types?page_size=50', {
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
        productDesign.value = presetData.value.product_design
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

let consultTimer: ReturnType<typeof setTimeout> | null = null
let consultSeq = 0

async function runConsult() {
    if (!selectedMaterialId.value || !selectedTypeId.value) {
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
                design: productDesign.value,
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
    watch([selectedMaterialId, selectedTypeId], () => {
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
    if (!shippingName.value || !shippingPhone.value || !shippingAddress.value)
        return false
    if (quantity.value < 1)
        return false
    return true
})

useHead({
    title: '确认商品 - 市场',
})

async function handleSubmit() {
    if (!loggedIn.value) {
        return navigateTo(`/auth/login?redirect=${encodeURIComponent(route.fullPath)}`)
    }
    if (!canSubmit.value || !consultResult.value)
        return

    isSubmitting.value = true
    try {
        const product = await useNuxtApp().$leporid<ProductPublic>('/api/products', {
            method: 'POST',
            body: {
                name: consultResult.value.name,
                description: consultResult.value.description,
                design: productDesign.value,
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
                确认商品
            </h1>
            <p class="text-sm text-base-content/70 mt-2">
                询价结果仅供参考，不包含运费，实际价格以订单结算时为准。
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

        <section v-if="!preset" class="border border-base-300 rounded-xl bg-base-100 p-4 sm:p-5">
            <h2 class="text-lg font-semibold mb-4">
                商品配置
            </h2>
            <div class="grid sm:grid-cols-2 gap-4">
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

                <label class="form-control w-full sm:max-w-xs">
                    <span class="label-text">数量</span>
                    <input v-model.number="quantity" min="1" type="number" class="input input-bordered w-full">
                </label>
            </div>
        </section>

        <section class="border border-base-300 rounded-xl bg-base-100 p-4 sm:p-5">
            <h2 class="text-lg font-semibold mb-4">
                收货信息
            </h2>
            <div class="grid sm:grid-cols-2 gap-4">
                <label class="form-control w-full">
                    <span class="label-text">收件人</span>
                    <input v-model="shippingName" type="text" class="input input-bordered w-full">
                </label>
                <label class="form-control w-full">
                    <span class="label-text">联系电话</span>
                    <input v-model="shippingPhone" type="text" class="input input-bordered w-full">
                </label>
                <label class="form-control w-full sm:col-span-2">
                    <span class="label-text">收货地址</span>
                    <input v-model="shippingAddress" type="text" class="input input-bordered w-full">
                </label>
            </div>
        </section>

        <section class="border border-base-300 rounded-xl bg-base-100 p-4 sm:p-5">
            <h2 class="text-lg font-semibold mb-3">
                结算
            </h2>
            <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div class="space-y-2">
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
                    </template>
                </div>

                <div class="sm:text-right">
                    <p class="text-xs text-base-content/60">
                        当前价格
                    </p>
                    <p class="text-2xl font-semibold text-primary mt-1">
                        {{ consultResult ? `￥${consultResult.price}` : '--' }}
                    </p>
                    <button class="btn btn-primary mt-4" :disabled="!canSubmit" @click="handleSubmit">
                        <span v-if="isSubmitting" class="loading loading-spinner loading-sm" />
                        {{ loggedIn ? '确认下单' : '登录后下单' }}
                    </button>
                </div>
            </div>
        </section>
    </div>
</template>
