export type TabKey = 'maicn-bests' | 'maicn-minfo'

export interface FunctionTabItem {
    key: TabKey
    label: string
    component: string
    icon?: string
}

export function useFunctionTabs(): UseFunctionTabsCtx {
    return {
        tabConfig: {
            label: 'MaimaiCN',
            items: {
                'maicn-bests': { label: 'BEST50', component: 'FunctionMaimaiCNBests' },
                'maicn-minfo': { label: 'MINFO', component: 'FunctionMaimaiCNMinfo' },
            },
        },
        defaultTabKey: 'maicn-bests',
    }
}
