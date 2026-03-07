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
    fromProduct: Ref<ProductSimpleResponse>
    fromArtifact: Ref<ArtifactUserResponse | undefined> // 如果尚处于产品设计阶段，artifact 将为 undefined
    rawDesign: Ref<Record<string, any>>
    sketchpadScale: Ref<number>
    displayMode: Ref<ArtifactDisplayMode>
    designerComponent: Ref<string>
    sketchpadComponent: Ref<string>
    adaptiveViewComponent: Ref<string>
}

export interface UseFunctionTabsCtx {
    tabConfig: {
        label: string
        icon?: string
        items: Record<string, {
            label: string
            component: string
            icon?: string
            hidden?: boolean
        }>
    }
    defaultTabKey: string
    qButtonTabKey?: string
}

export interface UseQButtonCtx {
    artifact: Ref<ArtifactUserResponse>
    switchTab: (tabKey: string) => void
    qDialogOpen: (val: boolean) => void
    qDialogOpened: Ref<boolean>
    qButtonTabs: Ref<Record<string, { from: string, label: string, component: string, icon?: string }> | undefined>
    activeTabKey: Ref<string | undefined>
    activeTabValue: ComputedRef<{ label: string, component: string, icon?: string } | undefined>
}
