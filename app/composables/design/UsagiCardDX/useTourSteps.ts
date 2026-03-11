/**
 * UsagiCardDX 设计专属步骤
 * 介绍 DX Rating、玩家信息等 DX 主题特有 widget
 */
export function getSteps(_artifact: ArtifactUserResponse): TourStepConfig[] {
    return [
        {
            intro: '欢迎使用 Bunny！这是您的 maimai DX 主题 NFC 卡片，让我们来了解一下卡片的各个部分。',
            title: '🐰 欢迎使用 Bunny',
        },
        {
            element: '[data-tour="card-dx-rating"]',
            intro: '这里展示您的 DX Rating，绑定查分器账号并同步成绩后，Rating 会自动更新显示在卡片上。',
            title: '⭐ DX Rating',
        },
        {
            element: '[data-tour="card-player-info"]',
            intro: '这里显示您的游戏昵称和好友码，同样会从查分器账号自动同步更新。',
            title: '👤 玩家信息',
        },
    ]
}
