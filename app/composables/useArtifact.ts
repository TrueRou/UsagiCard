export async function useArtifact(artifactId: string) {
    const artifactAsyncData = await useLeporid<ArtifactUserResponse>(`/api/artifacts/${artifactId}`)
    const { data: artifact, error } = artifactAsyncData

    if (artifact.value === undefined) {
        throw createError({ statusCode: 404, statusText: '工件不存在', fatal: true, data: error.value })
    }

    const artifactDesignType = toRef(artifact.value.product.type.design_type)
    const artifactDesign = toRef(artifact.value.product.design)
    const artifactProduct = toRef(artifact.value.product)
    const useDesignCtx = await useDesign(artifactDesignType, artifactDesign, artifactProduct, artifact)

    const storageSaving = ref(false)
    const storageSave = async (newStorage: Record<string, any>) => {
        storageSaving.value = true
        try {
            artifact.value = await useNuxtApp().$leporid<ArtifactUserResponse>(`/api/artifacts/${artifactId}/storage`, {
                method: 'PATCH',
                body: { storage: newStorage },
            })
        }
        finally {
            setTimeout(() => storageSaving.value = false, 500)
        }
    }

    return {
        artifact: artifact as Ref<ArtifactUserResponse>,
        artifactAsyncData,
        storageSave,
        storageSaving,
        useDesignCtx,
    }
}
