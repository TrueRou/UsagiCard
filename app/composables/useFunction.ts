export function useFunction(artifact: Ref<ArtifactUserResponse>, potentialTabKey?: string) {
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

    const tabConfigs = computed(() => {
        return (functionTabs.value ?? []).map(tab => tab.tabConfig)
    })

    const flattenTabItems = computed(() => {
        const items: Record<string, { label: string, component: string, icon?: string }> = {}
        for (const tab of tabConfigs.value ?? []) {
            Object.entries(tab.items).forEach(([key, val]) => items[key] = val)
        }
        return items
    })

    const tabDefaultKey = computed(() => {
        if (functionTabs.value && functionTabs.value.length > 0 && functionTabs.value[0]) {
            return functionTabs.value[0].defaultTabKey
        }
    })

    const activeTabKey = ref<string | undefined>(potentialTabKey || tabDefaultKey.value)
    const activeComponent = computed(() => {
        if (activeTabKey.value) {
            return flattenTabItems.value[activeTabKey.value]?.component
        }
    })

    return {
        tabConfigs,
        activeTabKey,
        activeComponent,
    }
}
