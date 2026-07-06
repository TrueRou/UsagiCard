import type { UpdatesChainResult } from './useMaimaiTypes'

export type MaimaiUpdateServer = 'diving_fish' | 'lxns' | 'arcade_legacy' | 'arcade' | 'usagi_card'

export interface MaimaiUpdateNode {
    server: MaimaiUpdateServer
    credential?: string | null
    transient?: boolean
}

export interface MaimaiUpdateStrategy {
    sources?: MaimaiUpdateNode[]
    targets?: MaimaiUpdateNode[]
}

export interface MaimaiUpdateDataSourceDef {
    id: MaimaiUpdateServer
    name: string
    description: string
    credentialLabel: string
    chainLabel: string
    isTransient: boolean
}

export const MAIMAI_UPDATE_SOURCE_COLORS: Record<MaimaiUpdateServer, string> = {
    arcade: 'border-primary bg-primary/10 hover:bg-primary/20',
    arcade_legacy: 'border-info bg-info/10 hover:bg-info/20',
    usagi_card: 'border-secondary bg-secondary/10 hover:bg-secondary/20',
    diving_fish: 'border-accent bg-accent/10 hover:bg-accent/20',
    lxns: 'border-warning bg-warning/10 hover:bg-warning/20',
}

export const MAIMAI_UPDATE_DATA_SOURCES: MaimaiUpdateDataSourceDef[] = [
    {
        id: 'arcade',
        chainLabel: 'arcade',
        name: '微信二维码',
        description: '通过微信扫码获取完整成绩',
        credentialLabel: '微信二维码识别内容',
        isTransient: true,
    },
    {
        id: 'arcade_legacy',
        chainLabel: 'arcade_legacy',
        name: '好友对战',
        description: '使用可保存凭据进行快速更新',
        credentialLabel: '凭据',
        isTransient: false,
    },
    {
        id: 'usagi_card',
        chainLabel: 'usagicard',
        name: '兔卡',
        description: '通过绑定的兔卡同步成绩',
        credentialLabel: '留空视为当前卡片',
        isTransient: false,
    },
    {
        id: 'diving_fish',
        chainLabel: 'divingfish',
        name: '水鱼',
        description: 'DivingFish - 舞萌 DX 查分器',
        credentialLabel: 'Import-Token',
        isTransient: false,
    },
    {
        id: 'lxns',
        chainLabel: 'lxns',
        name: '落雪',
        description: '落雪咖啡屋 - maimai DX 查分器',
        credentialLabel: '个人 API 密钥',
        isTransient: false,
    },
]

export const MAIMAI_UPDATE_SERVER_TO_CHAIN_LABEL: Record<MaimaiUpdateServer, string> = {
    diving_fish: 'divingfish',
    lxns: 'lxns',
    arcade_legacy: 'arcade_legacy',
    arcade: 'arcade',
    usagi_card: 'usagicard',
}

export function getMaimaiUpdateSourceDef(id: string) {
    return MAIMAI_UPDATE_DATA_SOURCES.find(source => source.id === id)
}

export function getMaimaiUpdateSourceColor(id: string) {
    return MAIMAI_UPDATE_SOURCE_COLORS[id as MaimaiUpdateServer] || 'border-base-300 bg-base-200 hover:bg-base-300'
}

export function maimaiUpdateChainLabelToName(chainLabel: string) {
    return MAIMAI_UPDATE_DATA_SOURCES.find(source => source.chainLabel === chainLabel)?.name ?? chainLabel
}

export function maimaiUpdateChainLabelToColor(chainLabel: string) {
    const id = MAIMAI_UPDATE_DATA_SOURCES.find(source => source.chainLabel === chainLabel)?.id ?? ''
    return getMaimaiUpdateSourceColor(id)
}

export function sanitizeMaimaiUpdateStrategy(strategy?: MaimaiUpdateStrategy | null): Required<MaimaiUpdateStrategy> {
    return {
        sources: (strategy?.sources ?? []).filter(node => node.server !== 'usagi_card'),
        targets: (strategy?.targets ?? []).filter(node => node.server !== 'usagi_card'),
    }
}

export function upsertMaimaiUpdateNode(
    strategy: MaimaiUpdateStrategy | undefined | null,
    zone: 'sources' | 'targets',
    node: MaimaiUpdateNode,
): Required<MaimaiUpdateStrategy> {
    const next = sanitizeMaimaiUpdateStrategy(strategy)
    const nodes = next[zone].filter(item => item.server !== node.server)
    next[zone] = [...nodes, node]
    return next
}

export function buildMaimaiUpdatePayload(
    strategy: MaimaiUpdateStrategy | undefined | null,
    artifactId: string,
    options: { latestQrCredential?: string | null, includeTransient?: boolean } = {},
) {
    const sanitized = sanitizeMaimaiUpdateStrategy(strategy)
    const source: Record<string, { credentials: string }> = {}
    const target: Record<string, { credentials: string }> = {}
    const includeTransient = options.includeTransient ?? true

    for (const node of sanitized.sources) {
        if (!includeTransient && node.transient)
            continue
        const chainLabel = MAIMAI_UPDATE_SERVER_TO_CHAIN_LABEL[node.server]
        const credential = node.credential ?? ''
        if (!chainLabel || !credential)
            continue
        source[chainLabel] = { credentials: credential }
    }

    const latestQrCredential = options.latestQrCredential?.trim()
    if (latestQrCredential)
        source.arcade = { credentials: latestQrCredential }

    for (const node of sanitized.targets) {
        if (!includeTransient && node.transient)
            continue
        const chainLabel = MAIMAI_UPDATE_SERVER_TO_CHAIN_LABEL[node.server]
        const credential = node.credential ?? ''
        if (!chainLabel || !credential)
            continue
        target[chainLabel] = { credentials: credential }
    }

    target.usagicard = { credentials: artifactId }

    return { source, target }
}

export function getMaimaiUpdateTargetNames(target: Record<string, unknown>) {
    return Object.keys(target).map(maimaiUpdateChainLabelToName)
}

export function getMaimaiUpdateResultTargetNames(result: UpdatesChainResult | null) {
    if (!result)
        return []
    return getMaimaiUpdateTargetNames(result.target)
}
