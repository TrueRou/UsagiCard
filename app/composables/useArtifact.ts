export async function useArtifact(artifactId: string) {
    const artifactAsyncData = await useLeporid<ArtifactUserResponse>(`/api/artifacts/${artifactId}`)
    const { data, error } = artifactAsyncData

    const artifact = computed(() => {
        if (data.value === undefined) {
            throw createError({ statusCode: error.value?.statusCode || 404, statusMessage: '工件获取失败', message: error.value?.message })
        }
        return data.value
    })

    const storageSaving = ref(false)
    const storageSave = async (newStorage: Record<string, any>) => {
        storageSaving.value = true
        try {
            data.value = await useNuxtApp().$leporid<ArtifactUserResponse>(`/api/artifacts/${artifactId}/storage`, {
                method: 'PATCH',
                body: { storage: newStorage },
            })
        }
        finally {
            setTimeout(() => storageSaving.value = false, 500)
        }
    }

    return {
        artifact,
        artifactAsyncData,
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
