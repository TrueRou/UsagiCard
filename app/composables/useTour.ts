import type introJs from 'intro.js'
import type { Tour } from 'intro.js/src/packages/tour'

const BASE_OPTIONS = {
    nextLabel: '下一步',
    prevLabel: '上一步',
    skipLabel: 'x',
    showProgress: true,
    showBullets: false,
    exitOnOverlayClick: false,
    scrollToElement: true,
    scrollPadding: 30,
    disableInteraction: true,
}

export type IntroFactory = typeof introJs

export type TourStepConfig = Partial<ConstructorParameters<typeof Tour>[1]> & {
    element?: string | Element | null
    intro: string
    title?: string
}

/**
 * 共通卡面步骤：适用于所有设计变体
 * 包括 QR 码、快捷操作火箭按钮、底部信息栏、进入功能面板按钮
 */
export function getCommonCardSteps(): TourStepConfig[] {
    return [
        {
            element: '[data-tour="card-qrcode"]',
            intro: '这是您的 NFC 卡片二维码，将它印在卡片上，其他人扫描即可查看您的卡片主页。',
            title: '🔲 卡片二维码',
        },
        {
            element: '[data-tour="card-rocket-btn"]',
            intro: '点击火箭按钮可以快速进行常用操作（例如更新成绩）。向右滑动卡片也可以打开此菜单。',
            title: '🚀 快捷操作',
        },
        {
            element: '[data-tour="card-footer-bar"]',
            intro: '底部栏显示您的简化代码和游戏版本信息。',
            title: '📋 底部信息栏',
        },
        {
            element: '[data-tour="card-functions-btn"]',
            intro: '点击此箭头按钮，或向左滑动卡片，即可进入功能面板，管理您的卡片数据。',
            title: '➡️ 进入功能面板',
        },
    ]
}

/**
 * 共通功能面板步骤：适用于所有功能类型
 * 介绍侧边栏整体和导航方式
 */
export function getCommonFunctionSteps(): TourStepConfig[] {
    return [
        {
            element: '[data-tour="fn-sidebar"]',
            intro: '这是功能面板，左侧菜单可以切换不同功能模块。让我们逐一了解各个功能。',
            title: '🗂️ 功能面板',
        },
    ]
}

/**
 * 每个 data-tour key 对应应该切换到的 tab key
 * 在 Phase 2 的 onBeforeChange 回调中使用，确保目标元素存在于 DOM 中
 */
function buildTabSwitchMap(accountCount: number): Record<string, string> {
    const map: Record<string, string> = {
        'tab-uc-home': 'uc-home',
        'tab-uc-pref': 'uc-pref',
        'tab-maicn-bests': 'maicn-bests',
        'tab-maicn-minfo': 'maicn-minfo',
        'tab-maicn-update': 'maicn-update',
        'tab-maicn-pref': 'maicn-pref',
        'maicn-add-account': 'maicn-pref',
    }
    for (let i = 0; i < accountCount; i++) {
        map[`maicn-account-${i}`] = 'maicn-pref'
    }
    return map
}

/**
 * 核心引导 composable
 *
 * 接受工件 ref 和 storageSave 函数（来自 useArtifact），根据工件的
 * design_type 和 function_types 动态组合两阶段引导流程：
 *
 * Phase 1（卡面页）：设计专属步骤 + 共通卡面步骤
 * Phase 2（功能面板页）：共通面板步骤 + 各功能类型专属步骤（含多账号排队）
 */
export function useTour(
    artifact: Ref<ArtifactUserResponse>,
    storageSave: (storage: Record<string, any>) => Promise<void>,
) {
    const { $intro } = useNuxtApp() as { $intro: IntroFactory }
    const router = useRouter()

    const designType = computed(() => artifact.value.product.type.design_type)
    const functionTypes = computed(() => artifact.value.product.type.function_types)

    // ─── 步骤构造 ─────────────────────────────────────────────────────────

    async function buildPhase1Steps(): Promise<TourStepConfig[]> {
        const steps: TourStepConfig[] = []
        const module = await import(`./design/${ProductTypeDesign[designType.value]}/useTourSteps.ts`)
        steps.push(...module.getSteps(artifact.value))
        steps.push(...getCommonCardSteps())
        return steps
    }

    async function buildPhase2Steps(): Promise<TourStepConfig[]> {
        const steps: TourStepConfig[] = [...getCommonFunctionSteps()]
        for (const ft of functionTypes.value) {
            const module = await import(`./function/${ProductTypeFunction[ft]}/useTourSteps.ts`)
            steps.push(...module.getSteps(artifact.value))
        }
        return steps
    }

    // ─── 完成 / 重启 ──────────────────────────────────────────────────────

    async function completeTour() {
        await storageSave({ skip_tour: true })
    }

    async function restartTour() {
        await storageSave({ skip_tour: false })
        router.push(`/artifacts/${artifact.value.id}`)
    }

    // ─── Phase 1 ──────────────────────────────────────────────────────────

    async function startPhase1() {
        const steps = await buildPhase1Steps()
        if (!steps.length)
            return

        const i = $intro()
        i.setOptions({
            ...BASE_OPTIONS,
            steps,
            doneLabel: '进入功能面板 →',
        })

        i.oncomplete(async () => {
            await completeTour()
            router.push(`/artifacts/${artifact.value.id}/functions?tour=continue`)
        })
        i.onexit(() => completeTour())
        i.start()
    }

    // ─── Phase 2 ──────────────────────────────────────────────────────────

    async function startPhase2(setActiveTab: (key: string) => void) {
        const steps = await buildPhase2Steps()
        if (!steps.length) {
            completeTour()
            return
        }

        const maimaiStorage = artifact.value.storage as MaimaiStorage
        const tabSwitchMap = buildTabSwitchMap(maimaiStorage?.rem_accounts?.length ?? 0)

        const i = $intro()
        i.setOptions({
            ...BASE_OPTIONS,
            steps,
            doneLabel: '完成',
        })

        i.onBeforeChange(async (element: Element) => {
            const tourKey = element?.getAttribute?.('data-tour')
            if (tourKey && tabSwitchMap[tourKey]) {
                setActiveTab(tabSwitchMap[tourKey])
                // 等待 Vue 完成 DOM 更新，确保目标元素渲染后 intro.js 才高亮
                await nextTick()
                await nextTick()
            }
            return true
        })

        i.onComplete(() => completeTour())
        i.onExit(() => completeTour())
        i.start()
    }

    return {
        startPhase1,
        startPhase2,
        completeTour,
        restartTour,
    }
}
