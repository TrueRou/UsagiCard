type StorageNamespace = keyof ArtifactStorage

export type StorageSaveFn = <K extends StorageNamespace>(
    namespace: K,
    newData: NonNullable<ArtifactStorage[K]>,
    options?: { successMessage?: string, showSuccessToast?: boolean },
) => Promise<void>

export async function useArtifact(artifactId: string) {
    const artifactAsyncData = await useLeporid<ArtifactUserResponse>(`/api/artifacts/${artifactId}`)
    const { data, error } = artifactAsyncData

    const artifact = computed(() => {
        if (data.value === undefined) {
            throw createError({ statusCode: error.value?.statusCode || 404, statusMessage: '工件获取失败', message: error.value?.message })
        }
        return data.value
    })

    const storageOf = <K extends StorageNamespace>(ns: K) => {
        return computed(() => (artifact.value.storage as ArtifactStorage)[ns])
    }

    const storageSaving = ref(false)
    const storageSave: StorageSaveFn = async (namespace, newData, options) => {
        storageSaving.value = true
        try {
            const fullStorage = { ...artifact.value.storage, [namespace]: newData }
            data.value = await useNuxtApp().$leporid(`/api/artifacts/${artifactId}/storage`, {
                method: 'PATCH',
                body: { storage: fullStorage },
                showSuccessToast: options?.showSuccessToast ?? true,
                successMessage: options?.successMessage ?? '保存成功',
            })
        }
        finally {
            setTimeout(() => storageSaving.value = false, 500)
        }
    }

    return {
        artifact,
        artifactAsyncData,
        storageOf,
        storageSave,
        storageSaving,
        useDesignCtx: useDesign(
            computed(() => artifact.value.product.design),
            computed(() => artifact.value.product.type.design_type),
            computed(() => artifact.value.product),
            computed(() => artifact.value),
        ),
    }
}
