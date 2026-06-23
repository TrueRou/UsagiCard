import UsagiCardDXAdaptiveView from '~/components/global/design/UsagiCardDX/adaptiveView/index.vue'
import UsagiCardDXDesigner from '~/components/global/design/UsagiCardDX/designer/index.vue'
import UsagiCardDXSketchpad from '~/components/global/design/UsagiCardDX/sketchpad/index.vue'

const designComponents = {
    [ProductTypeDesign.UsagiCardDX]: {
        designer: UsagiCardDXDesigner,
        sketchpad: UsagiCardDXSketchpad,
        adaptiveView: UsagiCardDXAdaptiveView,
    },
} satisfies Partial<Record<ProductTypeDesign, {
    designer: Component
    sketchpad: Component
    adaptiveView: Component
}>>

function getDesignComponents(designType: ProductTypeDesign) {
    const components = designComponents[designType]
    if (!components) {
        throw createError({ statusCode: 404, statusMessage: '设计类型暂不支持' })
    }
    return components
}

export interface UseDesignCtx {
    design: ComputedRef<Record<string, any>>
    designType: ComputedRef<ProductTypeDesign>
    designTypeLiteral: ComputedRef<string>
    sketchpadScale: Ref<number>
    displayMode: Ref<ArtifactDisplayMode>
    designerComponent: ComputedRef<Component>
    sketchpadComponent: ComputedRef<Component>
    adaptiveViewComponent: ComputedRef<Component>
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
    const components = computed(() => getDesignComponents(designType.value))

    return {
        design,
        designType,
        designTypeLiteral,
        sketchpadScale: toRef(1.0),
        displayMode: toRef(ArtifactDisplayMode.SKETCHPAD_FRONT),
        designerComponent: computed(() => components.value.designer),
        sketchpadComponent: computed(() => components.value.sketchpad),
        adaptiveViewComponent: computed(() => components.value.adaptiveView),
        fromProduct,
        fromArtifact,
    }
}
