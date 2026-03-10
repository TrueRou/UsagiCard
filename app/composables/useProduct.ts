export async function useProduct(product: Ref<ProductSimpleResponse>) {
    const productSaving = ref(false)
    const productSave = async (newProduct: Record<string, any>) => {
        productSaving.value = true
        try {
            product.value = await useNuxtApp().$leporid<ProductPublic>(`/api/products/${product.value.id}`, {
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
        productSaving,
        productSave,
        productSaveDesign,
    }
}
