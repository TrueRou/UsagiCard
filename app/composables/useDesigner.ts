export function useDesigner() {
    const isSaving = ref(false)

    const save = async (newDesign: Record<string, any>) => {
        isSaving.value = true
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
            setTimeout(() => isSaving.value = false, 500)
        }
    }

    return {
        isSaving,
        save,
    }
}
