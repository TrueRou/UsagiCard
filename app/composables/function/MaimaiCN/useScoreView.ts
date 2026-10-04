import type {
    ChartEntry,
    DistributionBucket,
    FilterDifficulty,
    ScoreAnalytics,
    ScoreExtend,
    ScoreFilterState,
    ScoreMetrics,
    ScoreSortState,
    Song,
    SongDifficulty,
    SongDifficultyUtage,
    SortDirection,
    SortField,
} from './useMaimaiTypes'
import { FCType, FSType, getDxStar, getRateByAchievement, MaimaiVersionOptions, RateType, SongType } from './useMaimaiUtils'

// ===== 构建谱面列表 =====

export function chartKey(songId: number, type: SongType, levelIndexOrDiffId: number) {
    return `${songId}_${type}_${levelIndexOrDiffId}`
}

function scoreLookupKey(type: SongType, id: number, levelIndex: number) {
    // utage 成绩的 id 即 diff_id；普通谱面按 LXNS 风格 id 归一
    return type === SongType.UTAGE ? `utage_${id}` : `${type}_${id % 10000}_${levelIndex}`
}

function difficultyNotes(difficulty: SongDifficulty) {
    return difficulty.tap_num + difficulty.hold_num + difficulty.slide_num + difficulty.touch_num + difficulty.break_num
}

/**
 * 将歌曲库与成绩合并为谱面列表；没有成绩的谱面 score 为 null。
 * 已删除（disabled）的歌曲只在存在成绩时保留。
 */
export function buildChartEntries(songs: Iterable<Song>, scores: ScoreExtend[]): ChartEntry[] {
    const scoreMap = new Map<string, ScoreExtend>()
    for (const score of scores)
        scoreMap.set(scoreLookupKey(score.type, score.id, score.level_index), score)

    const entries: ChartEntry[] = []
    for (const song of songs) {
        const groups: [SongType, SongDifficulty[]][] = [
            [SongType.DX, song.difficulties.dx ?? []],
            [SongType.STANDARD, song.difficulties.standard ?? []],
            [SongType.UTAGE, song.difficulties.utage ?? []],
        ]
        for (const [type, difficulties] of groups) {
            for (const difficulty of difficulties) {
                const isUtage = type === SongType.UTAGE
                const diffId = isUtage ? (difficulty as SongDifficultyUtage).diff_id : difficulty.level_index
                const score = scoreMap.get(isUtage ? `utage_${diffId}` : scoreLookupKey(type, song.id, difficulty.level_index)) ?? null
                if (song.disabled && !score)
                    continue
                entries.push({
                    key: chartKey(song.id, type, diffId),
                    song,
                    type,
                    difficulty,
                    levelIndex: isUtage ? -1 : difficulty.level_index,
                    score,
                    maxDxScore: difficultyNotes(difficulty) * 3,
                })
            }
        }
    }
    return entries
}

// ===== 默认状态与选项 =====

export const LEVEL_RANGE_LIMIT: [number, number] = [1, 15]

export const DEFAULT_FILTER: ScoreFilterState = {
    difficulties: [],
    levelRange: [...LEVEL_RANGE_LIMIT],
    versions: [],
    genres: [],
    types: [],
    rates: [],
    fc: [],
    fs: [],
    dxStars: [],
    showUnplayed: false,
}

export const DEFAULT_SORT: ScoreSortState = {
    primary: 'achievement',
    primaryDir: 'desc',
    secondary: 'level',
    secondaryDir: 'desc',
    unplayedToBottom: true,
    limit: null,
}

export function cloneFilter(filter: ScoreFilterState): ScoreFilterState {
    return {
        ...filter,
        difficulties: [...filter.difficulties],
        levelRange: [...filter.levelRange],
        versions: [...filter.versions],
        genres: [...filter.genres],
        types: [...filter.types],
        rates: [...filter.rates],
        fc: [...filter.fc],
        fs: [...filter.fs],
        dxStars: [...filter.dxStars],
    }
}

export const LEVEL_PRESETS: { label: string, range: [number, number] }[] = [
    { label: '15', range: [15.0, 15.0] },
    { label: '14+', range: [14.6, 14.9] },
    { label: '14', range: [14.0, 14.5] },
    { label: '13+', range: [13.6, 13.9] },
    { label: '13', range: [13.0, 13.5] },
    { label: '12+', range: [12.6, 12.9] },
    { label: '12', range: [12.0, 12.5] },
]

export const SORT_FIELD_OPTIONS: { value: SortField, label: string, description: string }[] = [
    { value: 'level', label: '谱面定数', description: '按官方定数高低排序' },
    { value: 'achievement', label: '达成率', description: '按历史最高达成率排序' },
    { value: 'rating', label: '单曲 DX Rating', description: '按成绩 Rating 贡献值排序' },
    { value: 'dxScore', label: 'DX 分数', description: '按 DX Score 占理论值的比例排序' },
    { value: 'playCount', label: '游玩次数', description: '按历史游玩次数排序' },
    { value: 'title', label: '曲名', description: '按曲名字典序排序' },
]

export interface SortPreset {
    key: string
    label: string
    description: string
    apply: (filter: ScoreFilterState) => { filter: ScoreFilterState, sort: ScoreSortState }
}

export const SORT_PRESETS: SortPreset[] = [
    {
        key: 'pc50',
        label: 'PC50',
        description: '游玩次数最多的 50 张谱面',
        apply: filter => ({
            filter: { ...cloneFilter(filter), fc: [] },
            sort: { ...DEFAULT_SORT, primary: 'playCount', secondary: 'achievement', limit: 50 },
        }),
    },
    {
        key: 'fc50',
        label: 'FC50',
        description: 'FC 及以上成绩中 Rating 最高的 50 张',
        apply: filter => ({
            filter: { ...cloneFilter(filter), fc: [FCType.APP, FCType.AP, FCType.FCP, FCType.FC] },
            sort: { ...DEFAULT_SORT, primary: 'rating', secondary: 'achievement', limit: 50 },
        }),
    },
    {
        key: 'ap50',
        label: 'AP50',
        description: 'AP 及以上成绩中 Rating 最高的 50 张',
        apply: filter => ({
            filter: { ...cloneFilter(filter), fc: [FCType.APP, FCType.AP] },
            sort: { ...DEFAULT_SORT, primary: 'rating', secondary: 'achievement', limit: 50 },
        }),
    },
]

// ===== 取值工具 =====

/** utage 难度没有定数，按标级推算（13+ → 13.6，去掉末尾的 ?） */
export function entryLevelValue(entry: ChartEntry): number {
    if (entry.difficulty.level_value > 0)
        return entry.difficulty.level_value
    const match = entry.difficulty.level.match(/^(\d+)(\+)?/)
    if (!match)
        return 0
    return Number(match[1]) + (match[2] ? 0.6 : 0)
}

/** 将谱面版本号归入版本分组（取不大于该版本的最大分组） */
export function resolveVersionGroup(version: number): number {
    let group = MaimaiVersionOptions[0]?.value ?? 0
    for (const option of MaimaiVersionOptions) {
        if (option.value <= version)
            group = option.value
    }
    return group
}

export function entryDxStar(entry: ChartEntry): number {
    return entry.score ? getDxStar(entry.score.dx_score, entry.maxDxScore) : 0
}

export function entryDxRatio(entry: ChartEntry): number {
    if (!entry.score || entry.maxDxScore <= 0)
        return 0
    return entry.score.dx_score / entry.maxDxScore
}

// ===== 筛选 =====

function isFullRange(range: [number, number]) {
    return range[0] <= LEVEL_RANGE_LIMIT[0] && range[1] >= LEVEL_RANGE_LIMIT[1]
}

/** 统计非默认的筛选维度数量（「包含未游玩」计入） */
export function activeFilterCount(filter: ScoreFilterState): number {
    return [
        filter.difficulties.length > 0,
        !isFullRange(filter.levelRange),
        filter.versions.length > 0,
        filter.genres.length > 0,
        filter.types.length > 0,
        filter.rates.length > 0,
        filter.fc.length > 0,
        filter.fs.length > 0,
        filter.dxStars.length > 0,
        filter.showUnplayed,
    ].filter(Boolean).length
}

/** 维度之间 AND，维度内部 OR；空选择表示不限制 */
export function createEntryPredicate(filter: ScoreFilterState, matchedSongIds: Set<number> | null) {
    const difficulties = new Set<FilterDifficulty>(filter.difficulties)
    const versions = new Set(filter.versions)
    const genres = new Set(filter.genres)
    const types = new Set(filter.types)
    const rates = new Set(filter.rates)
    const fc = new Set(filter.fc)
    const fs = new Set(filter.fs)
    const dxStars = new Set(filter.dxStars)
    const checkRange = !isFullRange(filter.levelRange)
    const [minLevel, maxLevel] = filter.levelRange

    return (entry: ChartEntry): boolean => {
        const score = entry.score
        if (matchedSongIds && !matchedSongIds.has(entry.song.id))
            return false
        if (!filter.showUnplayed && !score)
            return false
        if (difficulties.size && !difficulties.has(entry.levelIndex as FilterDifficulty))
            return false
        if (checkRange) {
            const level = entryLevelValue(entry)
            if (level < minLevel - 1e-9 || level > maxLevel + 1e-9)
                return false
        }
        if (versions.size && !versions.has(resolveVersionGroup(entry.difficulty.version)))
            return false
        if (genres.size && !genres.has(entry.song.genre))
            return false
        if (types.size && !types.has(entry.type))
            return false
        if (rates.size && !(score && rates.has(getRateByAchievement(score.achievements))))
            return false
        if (fc.size && !fc.has(score?.fc ?? 'none'))
            return false
        if (fs.size && !fs.has(score?.fs ?? 'none'))
            return false
        if (dxStars.size && !dxStars.has(entryDxStar(entry)))
            return false
        return true
    }
}

export function filterEntries(entries: ChartEntry[], matchedSongIds: Set<number> | null, filter: ScoreFilterState): ChartEntry[] {
    return entries.filter(createEntryPredicate(filter, matchedSongIds))
}

// ===== 排序 =====

const titleCollator = new Intl.Collator('zh')

function numericValue(entry: ChartEntry, field: Exclude<SortField, 'title'>): number {
    const score = entry.score
    switch (field) {
        case 'level':
            return entryLevelValue(entry)
        case 'achievement':
            return score?.achievements ?? -1
        case 'rating':
            return score?.dx_rating ?? -1
        case 'dxScore':
            return score ? entryDxRatio(entry) : -1
        case 'playCount':
            return score?.play_count ?? -1
    }
}

function compareField(a: ChartEntry, b: ChartEntry, field: SortField, direction: SortDirection): number {
    const result = field === 'title'
        ? titleCollator.compare(a.song.title, b.song.title)
        : numericValue(a, field) - numericValue(b, field)
    return direction === 'desc' ? -result : result
}

export function sortEntries(entries: ChartEntry[], sort: ScoreSortState): ChartEntry[] {
    const sorted = [...entries].sort((a, b) => {
        if (sort.unplayedToBottom && Boolean(a.score) !== Boolean(b.score))
            return a.score ? -1 : 1
        return compareField(a, b, sort.primary, sort.primaryDir)
            || compareField(a, b, sort.secondary, sort.secondaryDir)
            || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0)
    })
    return sort.limit && sort.limit > 0 ? sorted.slice(0, sort.limit) : sorted
}

// ===== 统计 =====

function isAP(fc: FCType | null | undefined) {
    return fc === FCType.AP || fc === FCType.APP
}

export function computeMetrics(entries: ChartEntry[]): ScoreMetrics {
    const playedScores = entries.flatMap(entry => entry.score ? [entry.score] : [])
    const played = playedScores.length
    const avgAchievement = played ? playedScores.reduce((sum, score) => sum + score.achievements, 0) / played : 0
    return {
        total: entries.length,
        played,
        avgAchievement,
        aboveAvg: played ? playedScores.filter(score => score.achievements >= avgAchievement).length : 0,
        sssp: playedScores.filter(score => score.achievements >= 100.5).length,
        sss: playedScores.filter(score => score.achievements >= 100).length,
        ap: playedScores.filter(score => isAP(score.fc)).length,
        fc: playedScores.filter(score => score.fc !== null && score.fc !== undefined).length,
        playCount: playedScores.reduce((sum, score) => sum + (score.play_count || 0), 0),
    }
}

function toBuckets(total: number, items: { key: string, label: string, color: string, count: number }[]): DistributionBucket[] {
    return items.map(item => ({
        ...item,
        pct: total > 0 ? Math.round(item.count / total * 1000) / 10 : 0,
    }))
}

export function computeAnalytics(entries: ChartEntry[]): ScoreAnalytics {
    const metrics = computeMetrics(entries)
    const total = entries.length
    const scores = entries.flatMap(entry => entry.score ? [{ entry, score: entry.score }] : [])
    const unplayed = total - scores.length
    const countBy = (predicate: (item: { entry: ChartEntry, score: ScoreExtend }) => boolean) => scores.filter(predicate).length
    const achievementBetween = (min: number, max = Infinity) => countBy(({ score }) => score.achievements >= min && score.achievements < max)

    // 只使用 daisyUI 语义色与难度色，自定义主题与暗色模式下保持可读
    const ranks = toBuckets(total, [
        { key: 'sssp', label: 'SSS+（100.5%+）', color: 'bg-warning', count: achievementBetween(100.5) },
        { key: 'sss', label: 'SSS（100% ~ 100.4999%）', color: 'bg-warning/60', count: achievementBetween(100, 100.5) },
        { key: 'ssp', label: 'SS+（99.5% ~ 99.9999%）', color: 'bg-diff-master', count: achievementBetween(99.5, 100) },
        { key: 'ss', label: 'SS（99% ~ 99.4999%）', color: 'bg-info', count: achievementBetween(99, 99.5) },
        { key: 's', label: 'S / S+（97% ~ 98.9999%）', color: 'bg-success', count: achievementBetween(97, 99) },
        { key: 'low', label: 'AAA 及以下（< 97%）', color: 'bg-neutral/40', count: achievementBetween(-Infinity, 97) },
        ...(unplayed > 0 ? [{ key: 'unplayed', label: '未游玩', color: 'bg-base-300', count: unplayed }] : []),
    ])

    const fc = toBuckets(total, [
        { key: 'app', label: 'AP+', color: 'bg-warning', count: countBy(({ score }) => score.fc === FCType.APP) },
        { key: 'ap', label: 'AP', color: 'bg-warning/60', count: countBy(({ score }) => score.fc === FCType.AP) },
        { key: 'fcp', label: 'FC+', color: 'bg-success', count: countBy(({ score }) => score.fc === FCType.FCP) },
        { key: 'fc', label: 'FC', color: 'bg-success/60', count: countBy(({ score }) => score.fc === FCType.FC) },
        { key: 'none', label: '未达成', color: 'bg-neutral/30', count: countBy(({ score }) => score.fc === null || score.fc === undefined) },
    ])

    const fs = toBuckets(total, [
        { key: 'fsdp', label: 'FDX+', color: 'bg-warning', count: countBy(({ score }) => score.fs === FSType.FSDP) },
        { key: 'fsd', label: 'FDX', color: 'bg-diff-master', count: countBy(({ score }) => score.fs === FSType.FSD) },
        { key: 'fsp', label: 'FS+', color: 'bg-info', count: countBy(({ score }) => score.fs === FSType.FSP) },
        { key: 'fs', label: 'FS', color: 'bg-info/60', count: countBy(({ score }) => score.fs === FSType.FS) },
        { key: 'sync', label: 'SYNC', color: 'bg-neutral/50', count: countBy(({ score }) => score.fs === FSType.SYNC) },
        { key: 'none', label: '未达成', color: 'bg-neutral/30', count: countBy(({ score }) => score.fs === null || score.fs === undefined) },
    ])

    const starLabels = ['0 星（< 85%）', '1 星（85%+）', '2 星（90%+）', '3 星（93%+）', '4 星（95%+）', '5 星（97%+）']
    const starColors = ['bg-neutral/30', 'bg-success/40', 'bg-success/70', 'bg-success', 'bg-warning/60', 'bg-warning']
    const dxStars = toBuckets(total, [5, 4, 3, 2, 1, 0].map(star => ({
        key: `star${star}`,
        label: starLabels[star]!,
        color: starColors[star]!,
        count: countBy(({ entry }) => entryDxStar(entry) === star),
    })))

    return { metrics, ranks, fc, fs, dxStars }
}

export const GENRE_OPTIONS: { value: string, label: string }[] = [
    { value: 'maimai', label: '舞萌' },
    { value: 'POPSアニメ', label: '流行 & 动漫' },
    { value: 'ゲームバラエティ', label: '其他游戏' },
    { value: 'niconicoボーカロイド', label: 'niconico & VOCALOID' },
    { value: '東方Project', label: '东方 Project' },
    { value: 'オンゲキCHUNITHM', label: '音击 & 中二节奏' },
    { value: '宴会場', label: '宴会场' },
]

export const RATE_FILTER_OPTIONS: { value: RateType, label: string }[] = [
    { value: RateType.SSSP, label: 'SSS+' },
    { value: RateType.SSS, label: 'SSS' },
    { value: RateType.SSP, label: 'SS+' },
    { value: RateType.SS, label: 'SS' },
    { value: RateType.SP, label: 'S+' },
    { value: RateType.S, label: 'S' },
    { value: RateType.AAA, label: 'AAA' },
    { value: RateType.AA, label: 'AA' },
    { value: RateType.A, label: 'A' },
]
