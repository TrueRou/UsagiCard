import type { FCType, FSType, LevelIndex, RateType, SongType } from './useMaimaiUtils'

export interface SongDifficulty {
    type: SongType
    level: string
    level_value: number
    level_index: LevelIndex
    note_designer: string
    version: number
    tap_num: number
    hold_num: number
    slide_num: number
    touch_num: number
    break_num: number
    curve: any | null
}

export interface SongDifficultyUtage extends SongDifficulty {
    kanji: string
    description: string
    diff_id: number
    is_buddy: boolean
}

export interface SongDifficulties {
    standard: SongDifficulty[]
    dx: SongDifficulty[]
    utage: SongDifficulty[]
}

export interface Song {
    id: number
    title: string
    artist: string
    genre: string
    bpm: number
    map: string | null
    version: number
    rights: string | null
    aliases: string[] | null
    disabled: boolean
    difficulties: SongDifficulties
}

export interface MaimaiScore {
    id: number
    title: string
    level: string
    level_index: LevelIndex
    level_value: number
    fc: FCType | null
    fs: FSType | null
    achievements: number
    dx_score: number
    dx_rating: number
    play_count: number
    rate: RateType
    type: SongType
}

export interface MaimaiBests {
    scores_b35: MaimaiScore[]
    scores_b15: MaimaiScore[]
    rating_b35: number
    rating_b15: number
    rating: number
}

export interface ScoreExtend extends MaimaiScore {
    dx_star: number | null
    version: number
    level_dx_score: number
    play_time: string | null
}

export interface PlateObject {
    song: Song
    levels: LevelIndex[]
    scores: ScoreExtend[]
}

export interface StoreLatestResponse {
    uuid: string
    version: number | null
    created_at: string | null
    updated_at: string | null
    snapshot: Record<string, unknown>
}

export interface StoreFieldsResponse {
    fields: string[]
}

export interface StoreCurvesResponse {
    uuid: string
    start_time: string | null
    end_time: string | null
    points: Record<string, Record<string, unknown>>
}

export interface UserDataSnapshot {
    username?: string
    player_rating?: number
    player_rating_b35?: number
    player_rating_b15?: number
    highest_rating?: number
    play_count?: number
    current_play_count?: number
    total_deluxscore?: number
    total_basic_deluxscore?: number
    total_advanced_deluxscore?: number
    total_expert_deluxscore?: number
    total_master_deluxscore?: number
    total_re_master_deluxscore?: number
    total_sync?: number
    total_basic_sync?: number
    total_advanced_sync?: number
    total_expert_sync?: number
    total_master_sync?: number
    total_re_master_sync?: number
    total_achievement?: number
    total_basic_achievement?: number
    total_advanced_achievement?: number
    total_expert_achievement?: number
    total_master_achievement?: number
    total_re_master_achievement?: number
    last_play_date?: string
    first_play_date?: string
    last_region_name?: string
    total_awake?: number
}

export interface RegionEntry {
    play_count: number
    created_at: string
}

export type UserRegionSnapshot = Record<string, RegionEntry>

export interface UpdatesChainEntryResult {
    errors: string | null
    scores_num: number
    scores_rating: number
}

export interface UpdatesChainResult {
    source: Record<string, UpdatesChainEntryResult>
    target: Record<string, UpdatesChainEntryResult>
    stores: Record<string, { message: string, data: any | null }>
}

export type PlateAttr = 'remained' | 'cleared' | 'played' | 'all'

/** 单张谱面：歌曲 + 难度 + 可能存在的成绩 */
export interface ChartEntry {
    /** `${songId}_${type}_${levelIndex}`，utage 使用 diff_id 作为最后一段 */
    key: string
    song: Song
    type: SongType
    difficulty: SongDifficulty
    /** utage 难度时为 -1 */
    levelIndex: number
    score: ScoreExtend | null
    /** 物量 * 3 */
    maxDxScore: number
}

export type FilterDifficulty = 0 | 1 | 2 | 3 | 4 | -1
/** 'none' 表示未达成 FC/FS */
export type FilterFC = FCType | 'none'
export type FilterFS = FSType | 'none'
/** 'unplayed' 不在评级档内 */
export type FilterRank = RateType

export interface ScoreFilterState {
    difficulties: FilterDifficulty[]
    levelRange: [number, number]
    versions: number[]
    genres: string[]
    types: SongType[]
    rates: FilterRank[]
    fc: FilterFC[]
    fs: FilterFS[]
    dxStars: number[]
    showUnplayed: boolean
}

export type SortField = 'level' | 'achievement' | 'rating' | 'dxScore' | 'playCount' | 'title'
export type SortDirection = 'asc' | 'desc'

export interface ScoreSortState {
    primary: SortField
    primaryDir: SortDirection
    secondary: SortField
    secondaryDir: SortDirection
    unplayedToBottom: boolean
    /** 排序后仅保留前 N 条，null 表示不限制 */
    limit: number | null
}

export interface ScoreMetrics {
    total: number
    played: number
    avgAchievement: number
    aboveAvg: number
    sssp: number
    sss: number
    ap: number
    fc: number
    playCount: number
}

export interface DistributionBucket {
    key: string
    label: string
    count: number
    pct: number
    color: string
}

export interface ScoreAnalytics {
    metrics: ScoreMetrics
    ranks: DistributionBucket[]
    fc: DistributionBucket[]
    fs: DistributionBucket[]
    dxStars: DistributionBucket[]
}
