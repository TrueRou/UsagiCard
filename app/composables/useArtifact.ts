export async function useArtifact(artifactId: string) {
    const { data, refresh, error } = await useLeporid<ArtifactUserResponse>(`/api/artifacts/${artifactId}`)

    const artifact = computed(() => {
        if (data.value === undefined) {
            throw createError({ statusCode: 404, statusText: '工件不存在', fatal: true, data: error.value })
        }
        return data.value
    })

    const artifactDesignType = computed(() => {
        return artifact.value.product.type.design_type
    })

    const artifactDesign = computed(() => {
        return artifact.value.product.design
    })

    const useDesignCtx = await useDesign(artifactDesignType, artifactDesign, artifact)

    return {
        artifact,
        refresh,
        useDesignCtx,
    }
}
