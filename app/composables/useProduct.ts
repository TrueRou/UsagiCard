export async function useProduct(productId: Ref<string>) {
    const { data, refresh, error } = await useLeporid<ProductPublic>(`/api/products/${productId}`)

    const product = computed(() => {
        if (data.value === undefined) {
            throw createError({ statusCode: 404, statusText: '工件不存在', fatal: true, data: error.value })
        }
        return data.value
    })

    const productSaving = ref(false)
    const productSave = async (newProduct: Record<string, any>) => {
        productSaving.value = true
        try {
            data.value = await useNuxtApp().$leporid<ProductPublic>(`/api/products/${productId}`, {
                method: 'PATCH',
                body: newProduct,
            })
        }
        finally {
            setTimeout(() => productSaving.value = false, 500)
        }
    }
    const productSaveDesign = async (newDesign: Record<string, any>) => {
        await productSave({ design: newDesign })
    }

    return {
        product,
        refresh,
        productSaving,
        productSave,
        productSaveDesign,
    }
}
