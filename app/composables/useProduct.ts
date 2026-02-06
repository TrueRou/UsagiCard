export async function useProduct(defaultDesign: Record<string, any>) {
    const designerSaving = ref(false)
    const designerContent = ref(defaultDesign)

    const designerSave = async (newDesign: Record<string, any>) => {
        designerSaving.value = true
        try {
            // TODO: 改为真正的保存接口
            await useNuxtApp().$leporid('/api/nuxt/profile', {
                method: 'PUT',
                body: newDesign,
                showSuccessToast: true,
                successMessage: '设计已保存',
            })
        }
        finally {
            setTimeout(() => designerSaving.value = false, 500)
        }
    }

    return {
        designerContent,
        designerSaving,
        designerSave,
    }
}
