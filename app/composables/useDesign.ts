export async function useDesign(
    designType: Ref<ProductTypeDesign>,
    rawDesign: Ref<Record<string, any>>,
    fromProduct: Ref<ProductSimpleResponse>,
    fromArtifact: Ref<ArtifactUserResponse | undefined> = ref(),
): Promise<UseDesignCtx> {
    const rawDesignRef = ref(rawDesign)
    const sketchpadScaleRef = ref(1.0)
    const displayModeRef = ref(ArtifactDisplayMode.SKETCHPAD_FRONT)
    const productIdRef = computed(() => fromProduct.value.id)
    const artifactIdRef = computed(() => fromArtifact.value?.id)
    const designTypeLiteral = computed(() => ProductTypeDesign[designType.value])

    return {
        productId: productIdRef,
        artifactId: artifactIdRef,
        rawDesign: rawDesignRef,
        sketchpadScale: sketchpadScaleRef,
        displayMode: displayModeRef,
        designerComponent: computed(() => `Design${designTypeLiteral.value}Designer`),
        sketchpadComponent: computed(() => `Design${designTypeLiteral.value}Sketchpad`),
        adaptiveViewComponent: computed(() => `Design${designTypeLiteral.value}AdaptiveView`),
    }
}
