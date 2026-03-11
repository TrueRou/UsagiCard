/**
 * MaimaiCN 功能模块步骤
 * 介绍成绩、单曲查询、数据更新、账号设置四个 tab
 * 若有多个已绑定账号，为每个账号生成独立介绍步骤（排队逐一介绍）
 * 若尚无账号，引导用户点击添加按钮
 *
 * 账号相关步骤需要 maicn-pref tab 处于激活状态，
 * 由 useTour/index.ts 的 onBeforeChange 回调负责切换
 */
export function getSteps(_artifact: ArtifactUserResponse): TourStepConfig[] {
    const maimaiStorage = _artifact.storage as MaimaiStorage
    const accounts = maimaiStorage?.rem_accounts ?? []

    const steps: TourStepConfig[] = [
        {
            element: '[data-tour="tab-maicn-bests"]',
            intro: '最佳成绩展示您的 B50 成绩列表，在完成数据更新后可以查看。',
            title: '🏆 最佳成绩',
        },
        {
            element: '[data-tour="tab-maicn-minfo"]',
            intro: '单曲查询允许您搜索任意曲目，查看您在该曲目各难度的详细成绩和达成情况。',
            title: '🔍 单曲查询',
        },
        {
            element: '[data-tour="tab-maicn-update"]',
            intro: '数据更新用于从绑定的查分器账号同步最新成绩到您的卡片，成绩更新后相关数据也会随之刷新。',
            title: '🔄 数据更新',
        },
        {
            element: '[data-tour="tab-maicn-pref"]',
            intro: '账号设置可以设置成绩更新行为，也可以记住并保存您的水鱼和落雪密钥。',
            title: '🔗 账号设置',
        },
    ]

    if (accounts.length === 0) {
        // 尚无绑定账号：引导添加
        steps.push({
            element: '[data-tour="maicn-add-account"]',
            intro: '在记住查分账号以后，下一次在数据更新菜单中就不必重复多次输入账号信息了。',
            title: '➕ 记住查分账号',
        })
    }

    return steps
}
