export { useArtifact } from './artifact/useArtifact'

export interface UseImageSelectorCtx {
    selectorOpen: Ref<boolean>
    selectorImageKey?: Ref<string | undefined>
    selectorImageAspect?: Ref<ImageAspectPublic | undefined>
    selectorInitialFilters: Ref<string[]>
    selectorDefaultPageSize?: number
    selectorTitleLabel?: Ref<string | undefined>
    selectorConfirmLabel?: string
    selectorReadonlyMode?: boolean
    openImageSelector: (key: string) => void
    closeImageSelector: () => void
    handleImageSelect: (image: ImageSimplePublic) => void
    clearImageSelect: (key: string) => void
}

export interface UseArtifactCtx {
    artifact: Ref<ArtifactUserResponse>
    sketchpadScale: Ref<number>
    displayMode: Ref<ArtifactDisplayMode>
    designerComponent: string
    sketchpadComponent: string
    adaptiveViewComponent: string
    saveDesign: (newDesign: Record<string, any>) => Promise<void>
    isSavingDesign: Ref<boolean>
}
