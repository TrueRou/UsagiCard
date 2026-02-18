export type TabKey = 'maicn-bests' | 'maicn-minfo' | 'maicn-pref' | 'maicn-update'

export interface FunctionTabItem {
    key: TabKey
    label: string
    component: string
    icon?: string
    hidden?: boolean
}

export function useFunctionTabs(): UseFunctionTabsCtx {
    return {
        tabConfig: {
            label: 'MaimaiCN',
            items: {
                'maicn-bests': { label: '最佳成绩', component: 'FunctionMaimaiCNBests' },
                'maicn-minfo': { label: '单曲查询', component: 'FunctionMaimaiCNMinfo' },
                'maicn-pref': { label: '账号设置', component: 'FunctionMaimaiCNPreference' },
                'maicn-update': { label: '数据更新', component: 'FunctionMaimaiCNUpdate', hidden: true },
            },
        },
        defaultTabKey: 'maicn-bests',
        qButtonTabKey: 'maicn-update',
    }
}
