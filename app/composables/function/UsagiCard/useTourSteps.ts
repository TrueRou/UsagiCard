/**
 * UsagiCard 功能模块步骤
 * 介绍卡片主页和卡片设置两个 tab
 */
export function getSteps(_artifact: ArtifactUserResponse): TourStepConfig[] {
    return [
        {
            element: '[data-tour="tab-uc-home"]',
            intro: '卡片主页展示您的卡片封面预览、个人简介等基本信息，您的访客也会看到这个页面。',
            title: '🏠 卡片主页',
        },
        {
            element: '[data-tour="tab-uc-pref"]',
            intro: '卡片设置允许您配置默认打开的标签页、访问权限控制，以及管理派生卡片的行为。',
            title: '⚙️ 卡片设置',
        },
    ]
}
