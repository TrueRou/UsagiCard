export interface UseDesignCtx {
    design: ComputedRef<Record<string, any>>
    designType: ComputedRef<ProductTypeDesign>
    designTypeLiteral: ComputedRef<string>
    sketchpadScale: Ref<number>
    displayMode: Ref<ArtifactDisplayMode>
    designerComponent: Ref<string>
    sketchpadComponent: Ref<string>
    adaptiveViewComponent: Ref<string>
    fromProduct: Ref<ProductSimpleResponse | undefined> // 如果尚处于设计器预览阶段，fromProduct 将为 undefined
    fromArtifact: Ref<(ArtifactUserResponse & { storage: ArtifactStorage }) | undefined> // 如果尚处于产品设计阶段，fromArtifact 将为 undefined
}

export function useDesign(
    design: ComputedRef<Record<string, any>>,
    designType: ComputedRef<ProductTypeDesign>,
    fromProduct: ComputedRef<ProductSimpleResponse | undefined> = computed(() => undefined),
    fromArtifact: ComputedRef<(ArtifactUserResponse & { storage: ArtifactStorage }) | undefined> = computed(() => undefined),
): UseDesignCtx {
    const designTypeLiteral = computed(() => ProductTypeDesign[designType.value])

    return {
        design,
        designType,
        designTypeLiteral,
        sketchpadScale: toRef(1.0),
        displayMode: toRef(ArtifactDisplayMode.SKETCHPAD_FRONT),
        designerComponent: computed(() => `Design${designTypeLiteral.value}Designer`),
        sketchpadComponent: computed(() => `Design${designTypeLiteral.value}Sketchpad`),
        adaptiveViewComponent: computed(() => `Design${designTypeLiteral.value}AdaptiveView`),
        fromProduct,
        fromArtifact,
    }
}
