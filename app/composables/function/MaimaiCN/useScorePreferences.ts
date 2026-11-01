import type { ScoreFilterState, ScoreSortState } from './useMaimaiTypes'
import type { MaimaiScoresStorage } from '~/types/api'
import { cloneFilter, DEFAULT_FILTER, DEFAULT_SORT, SORT_FIELD_OPTIONS } from './useScoreView'

export interface LocalScoresPref extends MaimaiScoresStorage {
    dirty: boolean
}

function record(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object' ? value as Record<string, unknown> : {}
}

function selection<T>(value: unknown, valid: (item: unknown) => boolean, max: number): T[] {
    return Array.isArray(value) ? [...new Set(value.filter(valid))].slice(0, max) as T[] : []
}

function integer(value: unknown, min: number, max: number): boolean {
    return typeof value === 'number' && Number.isSafeInteger(value) && value >= min && value <= max
}

/** 校验旧本地数据和卡片数据，避免损坏的缓存进入筛选/排序计算。 */
export function normalizeScoreFilter(value: unknown): ScoreFilterState {
    const raw = record(value)
    const range = raw.levelRange
    const validRange = Array.isArray(range) && range.length === 2
        && range.every(n => typeof n === 'number' && Number.isFinite(n) && n >= 1 && n <= 15)
        && range[0] <= range[1]
    return {
        difficulties: selection(raw.difficulties, n => integer(n, -1, 4), 6),
        levelRange: validRange ? [...range] as [number, number] : [...DEFAULT_FILTER.levelRange],
        versions: selection(raw.versions, n => integer(n, 0, Number.MAX_SAFE_INTEGER), 100),
        genres: selection(raw.genres, n => typeof n === 'string' && n.length <= 128, 100),
        types: selection(raw.types, n => n === 'standard' || n === 'dx' || n === 'utage', 3),
        rates: selection(raw.rates, n => integer(n, 0, 13), 14),
        fc: selection(raw.fc, n => n === 'none' || integer(n, 0, 3), 5),
        fs: selection(raw.fs, n => n === 'none' || integer(n, 0, 4), 6),
        dxStars: selection(raw.dxStars, n => integer(n, 0, 5), 6),
        showUnplayed: typeof raw.showUnplayed === 'boolean' ? raw.showUnplayed : DEFAULT_FILTER.showUnplayed,
    }
}

export function normalizeScoreSort(value: unknown): ScoreSortState {
    const raw = record(value)
    const field = (value: unknown, fallback: ScoreSortState['primary']) =>
        SORT_FIELD_OPTIONS.some(option => option.value === value) ? value as ScoreSortState['primary'] : fallback
    return {
        primary: field(raw.primary, DEFAULT_SORT.primary),
        primaryDir: raw.primaryDir === 'asc' || raw.primaryDir === 'desc' ? raw.primaryDir : DEFAULT_SORT.primaryDir,
        secondary: field(raw.secondary, DEFAULT_SORT.secondary),
        secondaryDir: raw.secondaryDir === 'asc' || raw.secondaryDir === 'desc' ? raw.secondaryDir : DEFAULT_SORT.secondaryDir,
        unplayedToBottom: typeof raw.unplayedToBottom === 'boolean' ? raw.unplayedToBottom : DEFAULT_SORT.unplayedToBottom,
        limit: integer(raw.limit, 1, Number.MAX_SAFE_INTEGER) ? raw.limit as number : null,
    }
}

export function scoresToStorage(filter: ScoreFilterState, sort: ScoreSortState): MaimaiScoresStorage {
    const { levelRange, dxStars, showUnplayed, ...restFilter } = normalizeScoreFilter(filter)
    const { primaryDir, secondaryDir, unplayedToBottom, ...restSort } = normalizeScoreSort(sort)
    return {
        filter: { ...restFilter, level_range: levelRange, dx_stars: dxStars, show_unplayed: showUnplayed },
        sort: { ...restSort, primary_dir: primaryDir, secondary_dir: secondaryDir, unplayed_to_bottom: unplayedToBottom },
    }
}

export function scoresFromStorage(value: unknown): { filter: ScoreFilterState, sort: ScoreSortState } {
    const raw = record(value)
    const filter = record(raw.filter)
    const sort = record(raw.sort)
    return {
        filter: normalizeScoreFilter({ ...filter, levelRange: filter.level_range, dxStars: filter.dx_stars, showUnplayed: filter.show_unplayed }),
        sort: normalizeScoreSort({ ...sort, primaryDir: sort.primary_dir, secondaryDir: sort.secondary_dir, unplayedToBottom: sort.unplayed_to_bottom }),
    }
}

export function normalizeScores(value: unknown): MaimaiScoresStorage {
    const { filter, sort } = scoresFromStorage(value)
    return scoresToStorage(filter, sort)
}

export function resolveScoresPref(card: unknown, local: LocalScoresPref | null | undefined): MaimaiScoresStorage {
    return normalizeScores(local?.dirty ? local : card ?? local)
}

export function isSameScores(a: MaimaiScoresStorage, b: MaimaiScoresStorage): boolean {
    return JSON.stringify(normalizeScores(a)) === JSON.stringify(normalizeScores(b))
}

export function defaultScores(): MaimaiScoresStorage {
    return scoresToStorage(cloneFilter(DEFAULT_FILTER), { ...DEFAULT_SORT })
}

/** 同一卡片的偏好写入串行执行，失败不阻塞之后的重试。 */
export function createPreferenceQueue() {
    let tail = Promise.resolve()
    let pending = 0
    const enqueue = <T>(operation: () => Promise<T>): Promise<T> => {
        pending++
        const next = tail.then(operation).finally(() => pending--)
        tail = next.then(() => {}, () => {})
        return next
    }
    return Object.assign(enqueue, { isPending: () => pending > 0 })
}
