export interface UseImageSelectorCtx {
    selectorOpen: Ref<boolean>
    selectorImageKey?: Ref<string | undefined>
    selectorImageAspect?: Ref<string | undefined>
    selectorInitialFilters: Ref<string[]>
    selectorDefaultPageSize?: number
    selectorConfirmLabel?: string
    selectorReadonlyMode?: boolean
    openImageSelector: (key: string, overrideFilter?: string) => void
    closeImageSelector: () => void
    handleImageSelect: (image: ImageSimplePublic) => void
    clearImageSelect: (key: string) => void
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
