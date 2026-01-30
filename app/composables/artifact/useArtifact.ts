export async function useArtifact(artifactId: string): Promise<UseArtifactCtx> {
    // 基本属性
    const { data, refresh } = await useLeporid<ArtifactUserResponse>(`/artifacts/${artifactId}`)

    if (data.value === undefined) {
        throw createError({ statusCode: 404, statusText: 'Artifact not found', fatal: true })
    }

    const designType = ProductTypeDesign[data.value.product.type.design_type]

    if (designType === undefined) {
        throw createError({ statusCode: 500, statusText: 'Unsupported design type', fatal: true })
    }

    // 响应式属性
    const sketchpadScale = ref(1.0)
    const displayMode = ref(ArtifactDisplayMode.SKETCHPAD_FRONT)

    // 设计器
    const isSavingDesign = ref(false)
    const saveDesign = async (newDesign: Record<string, any>) => {
        isSavingDesign.value = true
        try {
            // TODO: 改为真正的保存接口
            await useNuxtApp().$leporid('/api/nuxt/profile', {
                method: 'PUT',
                body: newDesign,
                showSuccessToast: true,
                successMessage: '设计已保存',
            })
            await refresh()
        }
        finally {
            setTimeout(() => isSavingDesign.value = false, 500) // 保证最短等待 500 毫秒
        }
    }

    return {
        saveDesign,
        artifact: data as Ref<ArtifactUserResponse>,
        sketchpadScale,
        displayMode,
        isSavingDesign,
        designerComponent: resolveComponent(`${designType}Designer`),
        sketchpadComponent: resolveComponent(`${designType}Sketchpad`),
        adaptiveViewComponent: resolveComponent(`${designType}AdaptiveView`),
    }
}
