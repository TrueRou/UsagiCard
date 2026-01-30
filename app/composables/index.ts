import type { ConcreteComponent } from 'vue'

export { useArtifact } from './artifact/useArtifact'

export interface UseImageSelectorCtx {
    selectorOpen: boolean
    selectorImageKey?: string
    selectorImageAspect?: ImageAspectPublic
    selectorInitialFilters: string[]
    selectorDefaultPageSize?: number
    selectorTitleLabel?: string
    selectorConfirmLabel?: string
    selectorReadonlyMode?: boolean
    openImageSelector: (key: string) => void
    closeImageSelector: () => void
    handleImageSelect: (image: ImageSimplePublic) => void
    clearImageSelect: (key: string) => void
}

export interface UseArtifactCtx {
    artifact: ArtifactUserResponse
    sketchpadScale: number
    displayMode: ArtifactDisplayMode
    designerComponent?: ConcreteComponent | string
    sketchpadComponent?: ConcreteComponent | string
    adaptiveViewComponent?: ConcreteComponent | string
    saveDesign: (newDesign: Record<string, any>) => Promise<void>
    isSavingDesign: boolean
}
