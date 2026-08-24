import type { ArtifactUserResponse, ProductTypeFunction } from '~/types/api'

export function useQButton(artifact: Ref<ArtifactUserResponse>): UseQButtonCtx {
    const functionTypes: ComputedRef<ProductTypeFunction[]> = computed(() => {
        return artifact.value.type.function_types
    })

    const quickActions = computed(() => {
        const actions: Record<string, FunctionQuickActionMeta> = {}
        for (const action of getEnabledQuickActions(functionTypes.value)) {
            actions[action.key] = action
        }
        return actions
    })

    const activeQuickActionKey = ref<string | undefined>()
    const qDialogOpened = ref(false)

    watch([quickActions], () => {
        if (quickActions.value !== undefined && Object.keys(quickActions.value).length > 0) {
            if (!activeQuickActionKey.value || !quickActions.value[activeQuickActionKey.value]) {
                activeQuickActionKey.value = Object.keys(quickActions.value)[0]
            }
        }
    })

    const activeQuickAction = computed(() => {
        if (activeQuickActionKey.value && quickActions.value) {
            return quickActions.value[activeQuickActionKey.value]
        }
    })

    const switchQuickAction = (actionKey: string) => {
        if (quickActions.value && quickActions.value[actionKey]) {
            activeQuickActionKey.value = actionKey
        }
    }

    const qDialogOpen = (val: boolean) => {
        if (val)
            activeQuickActionKey.value = Object.keys(quickActions.value)[0]
        qDialogOpened.value = val
    }

    return {
        artifact,
        switchQuickAction,
        qDialogOpen,
        qDialogOpened,
        quickActions,
        activeQuickActionKey,
        activeQuickAction,
    }
}
