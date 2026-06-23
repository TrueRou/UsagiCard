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

export interface UseQButtonCtx {
    artifact: Ref<ArtifactUserResponse>
    switchQuickAction: (actionKey: string) => void
    qDialogOpen: (val: boolean) => void
    qDialogOpened: Ref<boolean>
    quickActions: Ref<Record<string, FunctionQuickActionMeta> | undefined>
    activeQuickActionKey: Ref<string | undefined>
    activeQuickAction: ComputedRef<FunctionQuickActionMeta | undefined>
}
