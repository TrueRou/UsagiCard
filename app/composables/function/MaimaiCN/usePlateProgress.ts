import type { ChartEntry, ScoreExtend, Song } from './useMaimaiTypes'
import { FCType, FSType, getRateByAchievement, LevelIndex, RateType, SongType } from './useMaimaiUtils'
import { entryLevelValue } from './useScoreView'

/**
 * 牌子进度：基于全量谱面库（buildChartEntries 的结果）在前端实时计算。
 * 纯函数模块，不依赖 Nuxt，便于单测。
 *
 * 规则来自 maimai.py 的 MaimaiPlates，并按谱面逐张判定：
 * 谱面的类型、版本、难度都符合才计入牌子；已删除歌曲与宴谱不计入。
 */

export type PlateKind = '极' | '将' | '神' | '舞舞' | '者'
export type PlateGroup = 'old' | 'dx' | 'all'

export interface PlateVersion {
    /** URL 与牌子名中使用的规范字 */
    key: string
    /** 可识别的别名（国服 DX 双版本共用一套曲目） */
    aliases: string[]
    label: string
    /** 谱面版本区间 [start, end) */
    start: number
    end: number
    group: PlateGroup
    kinds: PlateKind[]
}

export interface PlateDef {
    /** 规范牌子名，如「桃将」「熊极」「舞舞舞」 */
    id: string
    /** 展示名，如「熊/华将」 */
    label: string
    version: PlateVersion
    kind: PlateKind
    majorType: SongType.STANDARD | SongType.DX
    withReMaster: boolean
}

export const PLATE_KINDS: readonly { kind: PlateKind, hint: string }[] = [
    { kind: '极', hint: 'FC' },
    { kind: '将', hint: 'SSS' },
    { kind: '神', hint: 'AP' },
    { kind: '舞舞', hint: 'FDX' },
    { kind: '者', hint: 'A' },
]

const FOUR: PlateKind[] = ['极', '将', '神', '舞舞']

function ver(key: string, start: number, end: number, group: PlateGroup, extra: Partial<PlateVersion> = {}): PlateVersion {
    return { key, aliases: [key], label: key, start, end, group, kinds: FOUR, ...extra }
}

function pair(a: string, b: string, start: number, end: number): PlateVersion {
    return ver(a, start, end, 'dx', { aliases: [a, b], label: `${a}/${b}` })
}

/** 版本边界取自 maimai.py 的 Version 枚举；彩止于 CiRCLE（26000） */
export const PLATE_VERSIONS: readonly PlateVersion[] = [
    // 真系包含初代曲目，且没有真将
    ver('真', 10000, 12000, 'old', { kinds: ['极', '神', '舞舞'] }),
    ver('超', 12000, 13000, 'old'),
    ver('檄', 13000, 14000, 'old'),
    ver('橙', 14000, 15000, 'old'),
    ver('晓', 15000, 16000, 'old'),
    ver('桃', 16000, 17000, 'old'),
    ver('樱', 17000, 18000, 'old'),
    ver('紫', 18000, 18500, 'old'),
    ver('堇', 18500, 19000, 'old'),
    ver('白', 19000, 19500, 'old'),
    ver('雪', 19500, 19900, 'old'),
    ver('辉', 19900, 20000, 'old'),
    pair('熊', '华', 20000, 21000),
    pair('爽', '煌', 21000, 22000),
    pair('宙', '星', 22000, 23000),
    pair('祭', '祝', 23000, 24000),
    pair('双', '宴', 24000, 25000),
    ver('镜', 25000, 25500, 'dx'),
    ver('彩', 25500, 26000, 'dx'),
    ver('舞', 10000, 20000, 'all'),
    ver('霸', 10000, 20000, 'all', { kinds: ['者'] }),
]

export const PLATE_DEFS: readonly PlateDef[] = PLATE_VERSIONS.flatMap(version => version.kinds.map(kind => ({
    id: `${version.key}${kind}`,
    label: `${version.label}${kind}`,
    version,
    kind,
    majorType: version.start >= 20000 ? SongType.DX : SongType.STANDARD,
    withReMaster: version.group === 'all',
} satisfies PlateDef)))

const PLATE_MAP = new Map(PLATE_DEFS.map(def => [def.id, def]))
const VERSION_BY_ALIAS = new Map(PLATE_VERSIONS.flatMap(version => version.aliases.map(alias => [alias, version] as const)))

/** 繁体 / 日文字形归一为简体 */
const CHAR_ALIASES: Record<string, string> = {
    暁: '晓',
    櫻: '樱',
    菫: '堇',
    輝: '辉',
    華: '华',
    極: '极',
    覇: '霸',
    將: '将',
}

/** 解析牌子名（首字为版本，其余为种类）；不存在的组合返回 null */
export function parsePlateId(raw: unknown): PlateDef | null {
    if (typeof raw !== 'string')
        return null
    const name = [...raw.trim()].map(char => CHAR_ALIASES[char] ?? char).join('')
    const version = VERSION_BY_ALIAS.get(name.slice(0, 1))
    if (!version)
        return null
    return PLATE_MAP.get(`${version.key}${name.slice(1)}`) ?? null
}

// ===== 判定 =====

export function isChartQualified(kind: PlateKind, score: ScoreExtend | null): boolean {
    if (!score)
        return false
    // FCType.APP 与 FSType.SYNC 都是 0，不能用真值判断
    switch (kind) {
        case '将':
            return getRateByAchievement(score.achievements) <= RateType.SSS
        case '者':
            return getRateByAchievement(score.achievements) <= RateType.A
        case '极':
            return score.fc != null && score.fc <= FCType.FC
        case '神':
            return score.fc != null && score.fc <= FCType.AP
        case '舞舞':
            return score.fs != null && score.fs >= FSType.FSD
    }
}

function inVersion(version: PlateVersion, entry: ChartEntry) {
    if (entry.song.disabled || entry.levelIndex < 0)
        return false
    const type = version.start >= 20000 ? SongType.DX : SongType.STANDARD
    if (entry.type !== type)
        return false
    if (entry.levelIndex === LevelIndex.ReMASTER && version.group !== 'all')
        return false
    return entry.difficulty.version >= version.start && entry.difficulty.version < version.end
}

export function isChartInPlate(def: PlateDef, entry: ChartEntry): boolean {
    return inVersion(def.version, entry)
}

// ===== 计算 =====

export interface PlateCount {
    done: number
    total: number
}

export interface PlateChart {
    entry: ChartEntry
    qualified: boolean
}

export interface PlateSong {
    song: Song
    /** 按难度升序，只含计入牌子的谱面 */
    charts: PlateChart[]
    /** 要求的最高难度（舞/霸有 Re:MASTER 时为 Re:MASTER） */
    top: PlateChart
    complete: boolean
}

export interface PlateLevelStat extends PlateCount {
    levelIndex: number
}

export interface PlateProgress {
    plate: PlateDef
    songs: PlateSong[]
    /** 全部要求难度都达成的曲目 */
    songCount: PlateCount
    /** 最高要求难度（MASTER，舞/霸有 Re:MASTER 时为 Re:MASTER）达成的曲目，总览按此计算 */
    topCount: PlateCount
    chartCount: PlateCount
    /** 难度顺序 [Re:MASTER,] MASTER … BASIC；没有谱面的难度省略 */
    levels: PlateLevelStat[]
}

const LEVEL_ORDER = [LevelIndex.ReMASTER, LevelIndex.MASTER, LevelIndex.EXPERT, LevelIndex.ADVANCED, LevelIndex.BASIC]

function byLevelDesc(a: ChartEntry, b: ChartEntry) {
    return entryLevelValue(b) - entryLevelValue(a) || a.song.id - b.song.id
}

function buildProgress(plate: PlateDef, entries: Iterable<ChartEntry>): PlateProgress {
    const grouped = new Map<number, PlateChart[]>()
    for (const entry of entries) {
        const list = grouped.get(entry.song.id)
        const chart = { entry, qualified: isChartQualified(plate.kind, entry.score) }
        if (list)
            list.push(chart)
        else
            grouped.set(entry.song.id, [chart])
    }

    const songs: PlateSong[] = []
    const levelMap = new Map<number, PlateLevelStat>()
    let doneCharts = 0
    let totalCharts = 0
    for (const charts of grouped.values()) {
        charts.sort((a, b) => a.entry.levelIndex - b.entry.levelIndex)
        for (const chart of charts) {
            const stat = levelMap.get(chart.entry.levelIndex) ?? { levelIndex: chart.entry.levelIndex, done: 0, total: 0 }
            stat.total++
            totalCharts++
            if (chart.qualified) {
                stat.done++
                doneCharts++
            }
            levelMap.set(chart.entry.levelIndex, stat)
        }
        songs.push({
            song: charts[0]!.entry.song,
            charts,
            top: charts[charts.length - 1]!,
            complete: charts.every(chart => chart.qualified),
        })
    }

    return {
        plate,
        songs,
        songCount: { done: songs.filter(song => song.complete).length, total: songs.length },
        topCount: { done: songs.filter(song => song.top.qualified).length, total: songs.length },
        chartCount: { done: doneCharts, total: totalCharts },
        levels: LEVEL_ORDER.flatMap(level => levelMap.get(level) ?? []),
    }
}

export function computePlate(entries: ChartEntry[], plate: PlateDef): PlateProgress {
    return buildProgress(plate, entries.filter(entry => isChartInPlate(plate, entry)))
}

export interface PlateOverviewItem {
    plate: PlateDef
    topCount: PlateCount
    songCount: PlateCount
}

/** 所有牌子的完成情况：谱面按版本分桶一次，再逐个牌子统计 */
export function computeOverview(entries: ChartEntry[]): Map<string, PlateOverviewItem> {
    const buckets = new Map<string, ChartEntry[]>(PLATE_VERSIONS.map(version => [version.key, []]))
    for (const entry of entries) {
        for (const version of PLATE_VERSIONS) {
            if (inVersion(version, entry))
                buckets.get(version.key)!.push(entry)
        }
    }
    const result = new Map<string, PlateOverviewItem>()
    for (const plate of PLATE_DEFS) {
        const { topCount, songCount } = buildProgress(plate, buckets.get(plate.version.key)!)
        result.set(plate.id, { plate, topCount, songCount })
    }
    return result
}

// ===== 完成表 =====

/** 等级标签转排序值：14+ → 14.5，无法解析时为 -1 */
export function levelLabelValue(label: string): number {
    const match = label.match(/^(\d+)(\+)?/)
    if (!match)
        return -1
    return Number(match[1]) + (match[2] ? 0.5 : 0)
}

/** 当前难度下展示的谱面：diff 为 null 时取最高要求难度 */
export function chartAt(song: PlateSong, diff: number | null): PlateChart | undefined {
    if (diff === null)
        return song.top
    return song.charts.find(chart => chart.entry.levelIndex === diff)
}

/**
 * 完成度口径：all 为全部要求难度都达成才算完成；
 * top 只看 MASTER（舞/霸有 Re:MASTER 的曲目看 Re:MASTER）
 */
export type PlateCompletionMode = 'all' | 'top'

export const COMPLETION_MODES: readonly { value: PlateCompletionMode, label: string, description: string }[] = [
    { value: 'all', label: '全部难度', description: '所有要求难度都达成才算完成' },
    { value: 'top', label: '仅 MASTER', description: '只看 MASTER，舞 / 霸者中带 Re:MASTER 的曲目看 Re:MASTER' },
]

export function normalizeCompletionMode(value: unknown): PlateCompletionMode {
    return value === 'top' ? 'top' : 'all'
}

/** 按口径判断曲目是否完成 */
export function isSongDone(song: PlateSong, mode: PlateCompletionMode): boolean {
    return mode === 'all' ? song.complete : song.top.qualified
}

/** 按口径取曲目完成统计 */
export function songCountFor(item: Pick<PlateProgress, 'songCount' | 'topCount'>, mode: PlateCompletionMode): PlateCount {
    return mode === 'all' ? item.songCount : item.topCount
}

/** 当前难度的完成统计：diff 为 null 时按口径统计曲目 */
export function countAt(progress: PlateProgress, diff: number | null, mode: PlateCompletionMode = 'all'): PlateCount {
    if (diff === null)
        return songCountFor(progress, mode)
    const stat = progress.levels.find(level => level.levelIndex === diff)
    return stat ? { done: stat.done, total: stat.total } : { done: 0, total: 0 }
}

export interface PlateTableItem {
    song: PlateSong
    /** 当前难度下展示的谱面 */
    chart: PlateChart
    /** 未筛选难度时要求所有难度达成，筛选难度时为该难度是否达成 */
    done: boolean
}

export interface PlateTableGroup {
    label: string
    items: PlateTableItem[]
    /** 隐藏已完成之前的统计 */
    count: PlateCount
}

export interface PlateTableOptions {
    diff?: number | null
    hideCompleted?: boolean
}

/**
 * 完成表：按当前难度谱面的等级分组（降序），组内按定数降序。
 * 未筛选难度时按最高要求难度分组，所有要求难度均达成才算完成；
 * 筛选难度时只看该难度是否达成，没有该难度谱面的曲目不显示。
 */
export function groupTableRows(progress: PlateProgress, options: PlateTableOptions = {}): PlateTableGroup[] {
    const diff = options.diff ?? null
    const groups = new Map<string, PlateTableGroup>()
    for (const song of progress.songs) {
        const chart = chartAt(song, diff)
        if (!chart)
            continue
        const label = chart.entry.difficulty.level
        const group = groups.get(label) ?? { label, items: [], count: { done: 0, total: 0 } }
        const done = diff === null ? song.complete : chart.qualified
        group.count.total++
        if (done)
            group.count.done++
        if (!(options.hideCompleted && done))
            group.items.push({ song, chart, done })
        groups.set(label, group)
    }
    return [...groups.values()]
        .filter(group => group.items.length > 0)
        .sort((a, b) => levelLabelValue(b.label) - levelLabelValue(a.label))
        .map(group => ({ ...group, items: group.items.sort((a, b) => byLevelDesc(a.chart.entry, b.chart.entry)) }))
}

export function percent(count: PlateCount): number {
    return count.total > 0 ? count.done / count.total * 100 : 0
}

// ===== URL 状态 =====

export interface PlateRouteState {
    plate: PlateDef | null
    /** URL 中无法识别的牌子名 */
    invalid: string | null
    /** 完成表当前难度，null 为最高要求难度 */
    diff: number | null
}

function first(value: unknown): string | undefined {
    const item = Array.isArray(value) ? value[0] : value
    return typeof item === 'string' && item ? item : undefined
}

function validDiff(plate: PlateDef, value: number) {
    return Number.isInteger(value) && value >= 0 && value <= (plate.withReMaster ? LevelIndex.ReMASTER : LevelIndex.MASTER)
}

export function parsePlateQuery(query: Record<string, unknown>): PlateRouteState {
    const raw = first(query.plate)
    const plate = raw ? parsePlateId(raw) : null
    if (!plate)
        return { plate: null, invalid: raw ?? null, diff: null }
    const diffRaw = first(query.diff)
    const diffValue = diffRaw === undefined ? Number.NaN : Number(diffRaw)
    return { plate, invalid: null, diff: validDiff(plate, diffValue) ? diffValue : null }
}

export function buildPlateQuery(state: Pick<PlateRouteState, 'plate' | 'diff'>): Record<string, string> {
    if (!state.plate)
        return {}
    const query: Record<string, string> = { plate: state.plate.id }
    if (state.diff !== null && validDiff(state.plate, state.diff))
        query.diff = String(state.diff)
    return query
}
