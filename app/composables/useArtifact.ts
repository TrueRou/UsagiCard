import type { ConcreteComponent } from 'vue'

export interface UseArtifactCtx {
    artifact: ArtifactUserResponse
    sketchpadScale: number
    displayMode: ArtifactDisplayMode
    designerComponent?: ConcreteComponent | string
    sketchpadComponent?: ConcreteComponent | string
    adaptiveViewComponent?: ConcreteComponent | string
}

export async function useArtifact(artifactId: string): Promise<UseArtifactCtx> {
    const { data } = await useLeporid<ArtifactUserResponse>(`/artifacts/${artifactId}`)

    if (data.value === undefined) {
        throw createError({ statusCode: 404, statusText: 'Artifact not found', fatal: true })
    }

    const designType = ProductTypeDesign[data.value.product.type.design_type]

    if (designType === undefined) {
        throw createError({ statusCode: 500, statusText: 'Unsupported design type', fatal: true })
    }

    return {
        artifact: data.value,
        sketchpadScale: 1.0,
        displayMode: ArtifactDisplayMode.SKETCHPAD_FRONT,
        designerComponent: resolveComponent(`${designType}Designer`),
        sketchpadComponent: resolveComponent(`${designType}Sketchpad`),
        adaptiveViewComponent: resolveComponent(`${designType}AdaptiveView`),
    }
}
