import type { UsagiCardStorage } from '~/types/api'

interface FunctionNavItem extends FunctionPageMeta {
    configurable: boolean
}

function movePinnedItemsToEnd(items: FunctionNavItem[]) {
    const normalItems = items.filter(item => item.pinned !== 'end')
    const pinnedItems = items.filter(item => item.pinned === 'end')
    return [...normalItems, ...pinnedItems]
}

function normalizeMenuKeys(keys: string[] | undefined, availableKeys: Set<string>) {
    const normalized: string[] = []
    for (const key of keys ?? []) {
        if (!availableKeys.has(key) || normalized.includes(key))
            continue
        normalized.push(key)
    }
    return normalized
}

export function useFunctionMenu(pageItems: Ref<FunctionPageMeta[]>, menu?: Ref<UsagiCardStorage['menu'] | undefined>) {
    const allPageItems = computed<FunctionNavItem[]>(() => {
        const items = pageItems.value.map(item => ({
            ...item,
            configurable: item.configurable ?? true,
        }))
        return movePinnedItemsToEnd(items)
    })

    const configurablePageItems = computed(() => allPageItems.value.filter(item => item.configurable))

    const customMenuKeys = computed(() => {
        const availableKeys = new Set(configurablePageItems.value.map(item => item.key))
        return normalizeMenuKeys(menu?.value?.menu_tabs, availableKeys)
    })

    const userCustomized = computed(() => customMenuKeys.value.length > 0)

    const visibleNavItems = computed(() => {
        const fixedItems = allPageItems.value.filter(item => !item.configurable)
        if (!userCustomized.value)
            return movePinnedItemsToEnd(allPageItems.value)

        const itemMap = new Map(configurablePageItems.value.map(item => [item.key, item]))
        const customItems = customMenuKeys.value
            .map(key => itemMap.get(key))
            .filter((item): item is FunctionNavItem => Boolean(item))
        return [...customItems, ...fixedItems]
    })

    function resolveValidPage(key?: string | null) {
        if (key && visibleNavItems.value.some(item => item.key === key))
            return visibleNavItems.value.find(item => item.key === key)
        return visibleNavItems.value[0]
    }

    return {
        allPageItems,
        configurablePageItems,
        customMenuKeys,
        userCustomized,
        visibleNavItems,
        resolveValidPage,
    }
}
