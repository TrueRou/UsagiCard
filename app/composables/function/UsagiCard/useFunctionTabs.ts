export type TabKey = 'uc-home' | 'uc-pref'

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
                'uc-home': { label: '卡片主页', component: 'FunctionUsagiCardHome' },
                'uc-pref': { label: '卡片设置', component: 'FunctionUsagiCardPreference' },
            },
        },
        defaultTabKey: 'uc-home',
        qButtonTabKey: 'uc-home',
    }
}
