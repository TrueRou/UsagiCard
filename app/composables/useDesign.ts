import type { ArtifactStorage, ArtifactUserResponse } from '~/types/api'
import UsagiCardDXAdaptiveView from '~/components/global/usagi-card-dx/adaptive-view/index.vue'
import UsagiCardDXSketchpad from '~/components/global/usagi-card-dx/sketchpad/index.vue'
import { ArtifactDisplayMode, ProductTypeDesign } from '~/types/api'

const designComponents = {
    [ProductTypeDesign.USAGI_CARD_DX]: {
        sketchpad: UsagiCardDXSketchpad,
        adaptiveView: UsagiCardDXAdaptiveView,
    },
} satisfies Partial<Record<ProductTypeDesign, {
    sketchpad: Component
    adaptiveView: Component
}>>

function getDesignComponents(designType: ProductTypeDesign) {
    const components = (designComponents as Partial<Record<ProductTypeDesign, {
        sketchpad: Component
        adaptiveView: Component
    }>>)[designType]
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
    sketchpadComponent: ComputedRef<Component>
    adaptiveViewComponent: ComputedRef<Component>
    fromArtifact: Ref<(ArtifactUserResponse & { storage: ArtifactStorage }) | undefined> // 如果尚处于设计阶段，fromArtifact 将为 undefined
}

export function useDesign(
    design: ComputedRef<Record<string, any>>,
    designType: ComputedRef<ProductTypeDesign>,
    fromArtifact: ComputedRef<(ArtifactUserResponse & { storage: ArtifactStorage }) | undefined> = computed(() => undefined),
): UseDesignCtx {
    const designTypeLiteral = computed(() => designType.value)
    const components = computed(() => getDesignComponents(designType.value))

    return {
        design,
        designType,
        designTypeLiteral,
        sketchpadScale: toRef(1.0),
        displayMode: toRef(ArtifactDisplayMode.SKETCHPAD_FRONT),
        sketchpadComponent: computed(() => components.value.sketchpad),
        adaptiveViewComponent: computed(() => components.value.adaptiveView),
        fromArtifact,
    }
}
