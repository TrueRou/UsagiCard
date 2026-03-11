export async function useProductDesigner(product: Ref<ProductSimpleResponse | undefined> = ref()) {
    const productSaving = ref(false)

    const productAvailable = computed(() => product.value !== undefined)

    const productSave = async (newProduct: Record<string, any>) => {
        productSaving.value = true
        try {
            if (product.value !== undefined && productAvailable.value) {
                product.value = await useNuxtApp().$leporid<ProductPublic>(`/api/products/${product.value.id}`, {
                    method: 'PATCH',
                    body: newProduct,
                })
            }
        }
        finally {
            setTimeout(() => productSaving.value = false, 500)
        }
    }

    const productSaveDesign = async (newDesign: Record<string, any>) => {
        await productSave({ design: newDesign })
    }

    function goToPrev() {
        watch(() => productSaving.value, (newVal, oldVal) => {
            if (oldVal === true && newVal === false)
                useRouter().go(-1)
        })
    }

    return {
        product,
        productAvailable,
        productSaving,
        productSave,
        productSaveDesign,
        goToPrev,
    }
}
