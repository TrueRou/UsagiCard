export { useArtifact } from './useArtifact'

export interface UseImageSelectorCtx {
    selectorOpen: Ref<boolean>
    selectorImageKey?: Ref<string | undefined>
    selectorImageAspect?: Ref<ImageAspectPublic | undefined>
    selectorInitialFilters: Ref<string[]>
    selectorDefaultPageSize?: number
    selectorConfirmLabel?: string
    selectorReadonlyMode?: boolean
    openImageSelector: (key: string) => void
    closeImageSelector: () => void
    handleImageSelect: (image: ImageSimplePublic) => void
    clearImageSelect: (key: string) => void
}

export interface UseDesignCtx {
    artifactId: Ref<string | undefined>
    rawDesign: Ref<Record<string, any>>
    sketchpadScale: Ref<number>
    displayMode: Ref<ArtifactDisplayMode>
    designerComponent: Ref<string>
    sketchpadComponent: Ref<string>
    adaptiveViewComponent: Ref<string>
}
