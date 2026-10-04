import type { MaimaiTileContent, MaimaiViewMode, MaimaiViewStorage } from '~/types/api'

/** 成绩页视图偏好：纯函数部分（不依赖 Nuxt，便于单测） */

export const DEFAULT_VIEW: MaimaiViewStorage = { mode: 'list', tile_content: 'rating' }

export const VIEW_MODE_OPTIONS: { value: MaimaiViewMode, label: string, icon: string }[] = [
    { value: 'list', label: '列表', icon: 'mdi:view-agenda-outline' },
    { value: 'tile', label: '平铺', icon: 'mdi:view-grid-outline' },
]

export const TILE_CONTENT_OPTIONS: { value: MaimaiTileContent, label: string }[] = [
    { value: 'rating', label: '评级' },
    { value: 'achievement', label: '达成率' },
    { value: 'fc', label: '连击' },
    { value: 'fs', label: '同步' },
    { value: 'dx_rating', label: 'Rating' },
    { value: 'level', label: '定数' },
    { value: 'play_count', label: '游玩次数' },
    { value: 'none', label: '仅封面' },
]

/** 本地缓存：dirty 表示本地修改尚未成功同步到卡片 */
export interface LocalViewPref extends MaimaiViewStorage {
    dirty: boolean
}

export type ViewSyncState = 'synced' | 'syncing' | 'locked' | 'error'

const MODES = new Set<string>(VIEW_MODE_OPTIONS.map(option => option.value))
const CONTENTS = new Set<string>(TILE_CONTENT_OPTIONS.map(option => option.value))

/** 把任意来源的数据规范成合法的视图偏好，非法字段回退到默认值 */
export function normalizeView(value: unknown): MaimaiViewStorage {
    const raw = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>
    return {
        mode: typeof raw.mode === 'string' && MODES.has(raw.mode) ? raw.mode as MaimaiViewMode : DEFAULT_VIEW.mode,
        tile_content: typeof raw.tile_content === 'string' && CONTENTS.has(raw.tile_content)
            ? raw.tile_content as MaimaiTileContent
            : DEFAULT_VIEW.tile_content,
    }
}

/**
 * 决定当前生效的视图偏好：
 * 本地有未同步的修改时以本地为准；否则以卡片为准；卡片没有该字段时退回本地缓存，最后是默认值。
 */
export function resolveDisplayPref(cardView: unknown, local: LocalViewPref | null | undefined): MaimaiViewStorage {
    if (local?.dirty)
        return normalizeView(local)
    if (cardView)
        return normalizeView(cardView)
    if (local)
        return normalizeView(local)
    return { ...DEFAULT_VIEW }
}

export function isSameView(a: MaimaiViewStorage, b: MaimaiViewStorage) {
    return a.mode === b.mode && a.tile_content === b.tile_content
}
