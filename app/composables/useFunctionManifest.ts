import type { Component } from 'vue'
import { defineAsyncComponent } from 'vue'

const MaimaiCNQuickUpdate = defineAsyncComponent(
    () => import('~/components/function/maimai-cn/quick-action/update.vue'),
)

export interface FunctionPageMeta {
    key: string
    functionType: ProductTypeFunction
    label: string
    icon?: string
    path: (artifactId: string) => string
    configurable?: boolean
    pinned?: 'end'
    order?: number
}

export interface FunctionSettingsMeta {
    key: string
    functionType: ProductTypeFunction
    label: string
    description: string
    icon?: string
    path: (artifactId: string) => string
    order?: number
}

export interface FunctionQuickActionMeta {
    key: string
    functionType: ProductTypeFunction
    label: string
    icon?: string
    component: Component
    order?: number
}

export interface FunctionManifest {
    type: ProductTypeFunction
    key: string
    label: string
    icon?: string
    pages: FunctionPageMeta[]
    settings?: FunctionSettingsMeta[]
    quickActions?: FunctionQuickActionMeta[]
}

export const functionManifests: FunctionManifest[] = [
    {
        type: ProductTypeFunction.UsagiCard,
        key: 'usagicard',
        label: 'UsagiCard',
        icon: 'mdi:account-circle-outline',
        pages: [
            {
                key: 'uc-me',
                functionType: ProductTypeFunction.UsagiCard,
                label: '我的卡片',
                icon: 'mdi:account-circle-outline',
                path: artifactId => `/artifacts/${artifactId}/functions/usagicard/me`,
                configurable: false,
                pinned: 'end',
                order: 1000,
            },
        ],
        settings: [
            {
                key: 'uc-profile',
                functionType: ProductTypeFunction.UsagiCard,
                label: '卡片资料',
                description: '头像、简介和卡片信息',
                icon: 'mdi:card-account-details-outline',
                path: artifactId => `/artifacts/${artifactId}/settings/usagicard/profile`,
                order: 10,
            },
            {
                key: 'uc-security',
                functionType: ProductTypeFunction.UsagiCard,
                label: '安全与隐私',
                description: '二级密码、NFC 和派生行为',
                icon: 'mdi:lock-outline',
                path: artifactId => `/artifacts/${artifactId}/settings/usagicard/security`,
                order: 20,
            },
            {
                key: 'uc-personalization',
                functionType: ProductTypeFunction.UsagiCard,
                label: '个性化设置',
                description: '菜单栏和快捷入口',
                icon: 'mdi:tune-variant',
                path: artifactId => `/artifacts/${artifactId}/settings/usagicard/personalization`,
                order: 30,
            },
        ],
        quickActions: [
            // {
            //     key: 'uc-me',
            //     functionType: ProductTypeFunction.UsagiCard,
            //     label: '我的卡片',
            //     icon: 'mdi:account-circle-outline',
            //     component: UsagiCardQuickMe,
            //     order: 1000,
            // },
        ],
    },
    {
        type: ProductTypeFunction.MaimaiCN,
        key: 'maimai-cn',
        label: 'MaiCN',
        icon: 'mdi:music-circle-outline',
        pages: [
            {
                key: 'maicn-query',
                functionType: ProductTypeFunction.MaimaiCN,
                label: '歌曲成绩',
                icon: 'mdi:music-note',
                path: artifactId => `/artifacts/${artifactId}/functions/maimai-cn/query`,
                configurable: true,
                order: 10,
            },
            {
                key: 'maicn-playdata',
                functionType: ProductTypeFunction.MaimaiCN,
                label: '游玩数据',
                icon: 'mdi:chart-line',
                path: artifactId => `/artifacts/${artifactId}/functions/maimai-cn/playdata`,
                configurable: true,
                order: 20,
            },
        ],
        settings: [
            {
                key: 'maicn-preferences',
                functionType: ProductTypeFunction.MaimaiCN,
                label: 'MaiCN 偏好',
                description: '快速更新、玩家资料和附近的人对战',
                icon: 'mdi:music-circle-outline',
                path: artifactId => `/artifacts/${artifactId}/settings/maimai-cn/preferences`,
                order: 100,
            },
        ],
        quickActions: [
            {
                key: 'maicn-update',
                functionType: ProductTypeFunction.MaimaiCN,
                label: '查分更新',
                icon: 'mdi:sync',
                component: MaimaiCNQuickUpdate,
                order: 10,
            },
        ],
    },
    {
        type: ProductTypeFunction.MaimaiAqua,
        key: 'maimai-aqua',
        label: 'MaiAqua',
        pages: [
            {
                key: 'maiaqua-home',
                functionType: ProductTypeFunction.MaimaiAqua,
                label: '卡片主页',
                path: artifactId => `/artifacts/${artifactId}/functions/maimai-aqua/home`,
                configurable: true,
                order: 10,
            },
        ],
    },
]

export function getEnabledFunctionManifests(functionTypes: ProductTypeFunction[]) {
    const enabledTypes = new Set(functionTypes)
    return functionManifests.filter(manifest => enabledTypes.has(manifest.type))
}

export function getEnabledFunctionPages(functionTypes: ProductTypeFunction[]) {
    return getEnabledFunctionManifests(functionTypes)
        .flatMap(manifest => manifest.pages)
        .sort((left, right) => (left.order ?? 0) - (right.order ?? 0) || left.label.localeCompare(right.label, 'zh-CN'))
}

export function getEnabledFunctionSettings(functionTypes: ProductTypeFunction[]) {
    return getEnabledFunctionManifests(functionTypes)
        .flatMap(manifest => manifest.settings ?? [])
        .sort((left, right) => (left.order ?? 0) - (right.order ?? 0) || left.label.localeCompare(right.label, 'zh-CN'))
}

export function getEnabledQuickActions(functionTypes: ProductTypeFunction[]) {
    return getEnabledFunctionManifests(functionTypes)
        .flatMap(manifest => manifest.quickActions ?? [])
        .sort((left, right) => (left.order ?? 0) - (right.order ?? 0) || left.label.localeCompare(right.label, 'zh-CN'))
}

export function findFunctionPageByKey(functionTypes: ProductTypeFunction[], key?: string | null) {
    if (!key)
        return undefined
    return getEnabledFunctionPages(functionTypes).find(page => page.key === key)
}

export function findQuickActionByKey(functionTypes: ProductTypeFunction[], key?: string | null) {
    if (!key)
        return undefined
    return getEnabledQuickActions(functionTypes).find(action => action.key === key)
}

export function hasFunctionType(artifact: Ref<ArtifactUserResponse>, functionType: ProductTypeFunction) {
    return computed(() => artifact.value.product.type.function_types.includes(functionType))
}

export function requireFunctionType(artifact: Ref<ArtifactUserResponse>, functionType: ProductTypeFunction) {
    if (!artifact.value.product.type.function_types.includes(functionType)) {
        throw createError({ statusCode: 404, statusMessage: '功能未启用' })
    }
}
