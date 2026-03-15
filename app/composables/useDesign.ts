export async function useDesign(
    designType: Ref<ProductTypeDesign>,
    currentDesign: Ref<Record<string, any>> = ref({}),
    fromProduct: Ref<ProductSimpleResponse | undefined> = ref(),
    fromArtifact: Ref<ArtifactUserResponse | undefined> = ref(),
): Promise<UseDesignCtx> {
    const currentDesignRef = toRef(currentDesign)
    const sketchpadScaleRef = toRef(1.0)
    const displayModeRef = toRef(ArtifactDisplayMode.SKETCHPAD_FRONT)
    const designTypeLiteral = computed(() => ProductTypeDesign[designType.value])

    return {
        fromProduct,
        fromArtifact,
        designTypeLiteral,
        currentDesign: currentDesignRef,
        sketchpadScale: sketchpadScaleRef,
        displayMode: displayModeRef,
        designerComponent: computed(() => `Design${designTypeLiteral.value}Designer`),
        sketchpadComponent: computed(() => `Design${designTypeLiteral.value}Sketchpad`),
        adaptiveViewComponent: computed(() => `Design${designTypeLiteral.value}AdaptiveView`),
    }
}
