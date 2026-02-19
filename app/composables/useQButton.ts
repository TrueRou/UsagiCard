export function useQButton(artifact: Ref<ArtifactUserResponse>, potentialTabKey?: string): UseQButtonCtx {
    const functionTypes: ComputedRef<ProductTypeFunction[]> = computed(() => {
        return artifact.value.product.type.function_types
    })

    const functionTabs: Ref<UseFunctionTabsCtx[] | undefined> = asyncComputed(async () => {
        const retVal: UseFunctionTabsCtx[] = []
        for (const typeFunction of functionTypes.value) {
            const module = await import(`./function/${ProductTypeFunction[typeFunction]}/useFunctionTabs.ts`)
            retVal.push(module.useFunctionTabs())
        }
        return retVal
    }, undefined, { lazy: true })

    const qButtonTabs = computed(() => {
        const qTabs: Record<string, { label: string, component: string, icon?: string }> = {}
        for (const tab of functionTabs.value ?? []) {
            if (tab.qButtonTabKey) {
                const item = tab.tabConfig.items[tab.qButtonTabKey]
                if (item) {
                    qTabs[tab.qButtonTabKey] = item
                }
            }
        }
        return qTabs
    })

    const activeTabKey = ref<string | undefined>(potentialTabKey)
    const qDialogOpened = ref(false)

    watch([qButtonTabs], () => {
        if (qButtonTabs.value !== undefined && Object.keys(qButtonTabs.value).length > 0) {
            activeTabKey.value = Object.keys(qButtonTabs.value)[0]
        }
    })

    const activeTabValue = computed(() => {
        if (activeTabKey.value && qButtonTabs.value) {
            return qButtonTabs.value[activeTabKey.value]
        }
    })

    const switchTab = (tabKey: string) => {
        if (qButtonTabs.value && qButtonTabs.value[tabKey]) {
            activeTabKey.value = tabKey
        }
    }

    const qDialogOpen = (val: boolean) => {
        qDialogOpened.value = val
    }

    return {
        artifact,
        switchTab,
        qDialogOpen,
        qDialogOpened,
        qButtonTabs,
        activeTabKey,
        activeTabValue,
    }
}
