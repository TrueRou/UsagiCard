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
                'maicn-bests': { label: '最佳成绩', component: 'FunctionMaimaiCNBests' },
                'maicn-minfo': { label: '单曲查询', component: 'FunctionMaimaiCNMinfo' },
                'maicn-pref': { label: '账号设置', component: 'FunctionMaimaiCNPreference' },
            },
        },
        defaultTabKey: 'maicn-bests',
    }
}
