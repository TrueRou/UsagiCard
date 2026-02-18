export async function useArtifact(artifactId: string) {
    const { data, refresh, error } = await useLeporid<ArtifactUserResponse>(`/api/artifacts/${artifactId}`)

    const artifact = computed(() => {
        if (data.value === undefined) {
            throw createError({ statusCode: 404, statusText: '工件不存在', fatal: true, data: error.value })
        }
        return data.value
    })
    const artifactDesignType = computed(() => artifact.value.product.type.design_type)
    const artifactDesign = computed(() => artifact.value.product.design)
    const artifactProduct = computed(() => artifact.value.product)
    const useDesignCtx = await useDesign(artifactDesignType, artifactDesign, artifactProduct, artifact)

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
        refresh,
        storageSave,
        storageSaving,
        useDesignCtx,
    }
}
