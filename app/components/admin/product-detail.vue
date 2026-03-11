<script setup lang="ts">
const isOpen = ref(false)
const isSaving = ref(false)
const productId = ref<string | null>(null)
const product = ref<ProductPublic | null>(null)
const designText = ref('')
const designError = ref('')

async function open(id: string) {
    productId.value = id
    designError.value = ''
    isOpen.value = true
    const data = await useNuxtApp().$leporid<ProductPublic>(`/api/admin/products/${id}`)
    product.value = data
    designText.value = JSON.stringify(data.design, null, 2)
}

function validateDesign(): boolean {
    try {
        JSON.parse(designText.value)
        designError.value = ''
        return true
    }
    catch {
        designError.value = 'JSON 格式错误，请检查后重试'
        return false
    }
}

async function handleSave() {
    if (!validateDesign() || !productId.value)
        return
    isSaving.value = true
    try {
        await useNuxtApp().$leporid(`/api/admin/products/${productId.value}`, {
            method: 'PATCH',
            body: { design: JSON.parse(designText.value) },
            showSuccessToast: true,
            successMessage: '商品设计已更新',
        })
    }
    finally {
        isSaving.value = false
    }
}

defineExpose({ open })
</script>

<template>
    <dialog class="modal" :class="{ 'modal-open': isOpen }">
        <div class="modal-box max-w-2xl">
            <h3 class="text-lg font-bold mb-4">
                商品详情
            </h3>

            <div v-if="!product" class="flex justify-center py-8">
                <span class="loading loading-spinner loading-md" />
            </div>

            <div v-else class="space-y-4">
                <!-- 基本信息 -->
                <div class="grid grid-cols-2 gap-3 text-sm">
                    <div>
                        <span class="text-base-content/50">名称</span>
                        <p class="font-medium">
                            {{ product.name }}
                        </p>
                    </div>
                    <div>
                        <span class="text-base-content/50">价格</span>
                        <p class="font-semibold">
                            ¥{{ Number(product.price).toFixed(2) }}
                        </p>
                    </div>
                    <div>
                        <span class="text-base-content/50">材料</span>
                        <p>{{ product.material?.name || '-' }}</p>
                    </div>
                    <div>
                        <span class="text-base-content/50">类型</span>
                        <p>{{ product.type?.name || '-' }}</p>
                    </div>
                    <div class="col-span-2">
                        <span class="text-base-content/50">描述</span>
                        <p>{{ product.description }}</p>
                    </div>
                </div>

                <!-- 设计 JSON 编辑 -->
                <div>
                    <div class="flex items-center justify-between mb-1">
                        <span class="text-sm text-base-content/50">设计 JSON</span>
                        <NuxtLink
                            :to="`/admin/artifacts?product_id=${productId}`"
                            class="text-xs text-primary hover:underline"
                            @click="isOpen = false"
                        >
                            查看关联工件 →
                        </NuxtLink>
                    </div>
                    <textarea
                        v-model="designText"
                        class="textarea textarea-bordered w-full font-mono text-xs"
                        rows="12"
                        spellcheck="false"
                        @input="designError = ''"
                    />
                    <p v-if="designError" class="text-error text-xs mt-1">
                        {{ designError }}
                    </p>
                </div>
            </div>

            <div class="modal-action">
                <button class="btn btn-outline btn-sm" @click="isOpen = false">
                    关闭
                </button>
                <button
                    v-if="product"
                    class="btn btn-primary btn-sm"
                    :disabled="isSaving"
                    @click="handleSave"
                >
                    <span v-if="isSaving" class="loading loading-spinner loading-xs" />
                    保存设计
                </button>
            </div>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button @click="isOpen = false">
                close
            </button>
        </form>
    </dialog>
</template>
