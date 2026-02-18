export type TabKey = 'uc-pref'

export interface FunctionTabItem {
    key: TabKey
    label: string
    component: string
    icon?: string
}

export function useFunctionTabs(): UseFunctionTabsCtx {
    return {
        tabConfig: {
            label: 'UsagiCard',
            items: {
                'uc-pref': { label: '卡片设置', component: 'FunctionUsagiCardPreference' },
            },
        },
        defaultTabKey: 'uc-pref',
    }
}
