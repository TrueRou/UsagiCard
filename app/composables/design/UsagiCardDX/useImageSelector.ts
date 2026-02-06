export async function useImageSelector(currentDesign: Ref<UsagiCardDxDesign>): Promise<UseImageSelectorCtx> {
    const { data: ID_1_FF } = await useLeporid<ImageAspectPublic>('/api/images/aspects/id-1-ff')
    const { loggedIn } = useUserSession()

    const imageFieldMap: Record<string, keyof UsagiCardDxDesign> = {
        character: 'character_id',
        mask: 'mask_id',
        background: 'background_id',
        frame: 'frame_id',
        passname: 'passname_id',
        cardback: 'cardback_id',
    }

    const imageAspectField: Record<string, ImageAspectPublic | undefined> = {
        character: ID_1_FF.value,
        mask: ID_1_FF.value,
        background: ID_1_FF.value,
        frame: ID_1_FF.value,
        passname: ID_1_FF.value,
        cardback: ID_1_FF.value,
    }

    const selectorImageKey = ref<string>()
    const selectorOpen = ref(false)

    function openImageSelector(key: string) {
        selectorImageKey.value = key
        selectorOpen.value = true
    }

    function closeImageSelector() {
        selectorImageKey.value = undefined
        selectorOpen.value = false
    }

    function handleImageSelect(image: ImageSimplePublic) {
        if (selectorImageKey.value) {
            const designField = imageFieldMap[selectorImageKey.value]
            if (designField !== undefined) {
                Object.assign(currentDesign.value, { [designField]: image.id })
            }
        }
    }

    function clearImageSelect(key: string) {
        const designField = imageFieldMap[key]
        if (designField !== undefined) {
            Object.assign(currentDesign.value, { [designField]: '' })
        }
    }

    const selectorImageAspect = computed(() => {
        return selectorImageKey.value ? imageAspectField[selectorImageKey.value] : undefined
    })

    const selectorInitialFilters = computed(() => {
        return selectorImageKey.value ? [selectorImageKey.value] : []
    })

    return {
        selectorOpen,
        selectorImageKey,
        selectorImageAspect,
        selectorInitialFilters,
        selectorReadonlyMode: !loggedIn.value,
        openImageSelector,
        closeImageSelector,
        handleImageSelect,
        clearImageSelect,
    }
}
