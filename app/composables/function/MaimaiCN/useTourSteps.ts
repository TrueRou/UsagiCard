type MaimaiAccount = NonNullable<MaimaiStorage['rem_accounts']>[number]

const SERVER_NAME: Record<MaimaiAccount['server'], string> = {
    diving_fish: '水鱼查分器',
    lxns: '落雪查分器',
}

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
            intro: '最佳成绩展示您的 Best 35 + 15 成绩列表，以及各难度的代表曲目和综合 Rating 分析。',
            title: '🏆 最佳成绩',
        },
        {
            element: '[data-tour="tab-maicn-minfo"]',
            intro: '单曲查询允许您搜索任意曲目，查看该曲目各难度的详细成绩和达成情况。',
            title: '🔍 单曲查询',
        },
        {
            element: '[data-tour="tab-maicn-update"]',
            intro: '数据更新用于从绑定的查分器账号同步最新成绩到您的卡片，成绩更新后 DX Rating 也会随之刷新。',
            title: '🔄 数据更新',
        },
        {
            element: '[data-tour="tab-maicn-pref"]',
            intro: '账号设置用于管理绑定的查分器账号（水鱼、落雪等）和配置成绩更新行为。',
            title: '🔗 账号设置',
        },
    ]

    if (accounts.length === 0) {
        // 尚无绑定账号：引导添加
        steps.push({
            element: '[data-tour="maicn-add-account"]',
            intro: '您还没有绑定任何查分器账号。点击"添加"按钮，绑定水鱼或落雪查分器，即可同步您的 maimai 成绩到卡片。',
            title: '➕ 添加查分账号',
        })
    }
    else {
        // 逐一介绍每个已绑定的账号
        accounts.forEach((account, index) => {
            steps.push({
                element: `[data-tour="maicn-account-${index}"]`,
                intro: `这是您已绑定的账号「${account.label}」，数据来源为 ${SERVER_NAME[account.server]}。您可以在此管理或移除该账号。`,
                title: `📌 账号：${account.label}`,
            })
        })
    }

    return steps
}
