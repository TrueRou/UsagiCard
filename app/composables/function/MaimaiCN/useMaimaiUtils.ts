export enum FCType {
    APP = 0,
    AP = 1,
    FCP = 2,
    FC = 3,
}

export enum FSType {
    SYNC = 0,
    FS = 1,
    FSP = 2,
    FSD = 3,
    FSDP = 4,
}

export enum RateType {
    SSSP = 0,
    SSS = 1,
    SSP = 2,
    SS = 3,
    SP = 4,
    S = 5,
    AAA = 6,
    AA = 7,
    A = 8,
    BBB = 9,
    BB = 10,
    B = 11,
    C = 12,
    D = 13,
}

export enum SongType {
    STANDARD = 'standard',
    DX = 'dx',
    UTAGE = 'utage',
}

export enum LevelIndex {
    BASIC = 0,
    ADVANCED = 1,
    EXPERT = 2,
    MASTER = 3,
    ReMASTER = 4,
}

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

export const FCTypeMap: Record<FCType, string> = {
    [FCType.APP]: 'AP+',
    [FCType.AP]: 'AP',
    [FCType.FCP]: 'FC+',
    [FCType.FC]: 'FC',
}

export const FSTypeMap: Record<FSType, string> = {
    [FSType.SYNC]: 'SYNC',
    [FSType.FS]: 'FS',
    [FSType.FSP]: 'FS+',
    [FSType.FSD]: 'FSD',
    [FSType.FSDP]: 'FSD+',
}

export const RateTypeMap: Record<RateType, string> = {
    [RateType.SSSP]: 'SSS+',
    [RateType.SSS]: 'SSS',
    [RateType.SSP]: 'SS+',
    [RateType.SS]: 'SS',
    [RateType.SP]: 'S+',
    [RateType.S]: 'S',
    [RateType.AAA]: 'AAA',
    [RateType.AA]: 'AA',
    [RateType.A]: 'A',
    [RateType.BBB]: 'BBB',
    [RateType.BB]: 'BB',
    [RateType.B]: 'B',
    [RateType.C]: 'C',
    [RateType.D]: 'D',
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

export enum ViewMode {
    LIST = 'list',
    TILE = 'tile',
}

export enum TileDisplayMode {
    NONE = 'none',
    RATING = 'rating',
    ACHIEVEMENT = 'achievement',
    FC = 'fc',
    FS = 'fs',
    DX_RATING = 'dx_rating',
    LEVEL_VALUE = 'level_value',
    PLAY_COUNT = 'play_count',
}

export function useMaimaiUtils() {
    // 获取成绩难度颜色
    const getDifficultyColor = (levelIndex: number, songType?: SongType): string => {
        if (songType === 'utage')
            return '#aa42b1' // UTAGE类型统一使用橙色
        const colors: { [key: number]: string } = {
            0: '#6fe163', // BASIC
            1: '#ffd653', // ADVANCED
            2: '#ff7b7b', // EXPERT
            3: '#9f51dc', // MASTER
            4: '#dbaaff', // Re:MASTER
        }
        return colors[levelIndex] || '#26c9fc'
    }

    // 获取成绩评级样式
    const getAchievementStyle = (achievements: number | null) => {
        if (!achievements)
            return { class: 'bg-gray-500', text: '-', name: '-', color: 'bg-gray-500' }

        if (achievements >= 100.5)
            return { name: 'SSS+', class: 'bg-purple-600', text: 'SSS+', color: 'bg-purple-600' }
        if (achievements >= 100)
            return { name: 'SSS', class: 'bg-purple-500', text: 'SSS', color: 'bg-purple-500' }
        if (achievements >= 99.5)
            return { name: 'SS+', class: 'bg-yellow-500', text: 'SS+', color: 'bg-yellow-500' }
        if (achievements >= 99)
            return { name: 'SS', class: 'bg-yellow-400', text: 'SS', color: 'bg-yellow-400' }
        if (achievements >= 98)
            return { name: 'S+', class: 'bg-green-600', text: 'S+', color: 'bg-green-600' }
        if (achievements >= 97)
            return { name: 'S', class: 'bg-green-500', text: 'S', color: 'bg-green-500' }
        if (achievements >= 94)
            return { name: 'AAA', class: 'bg-blue-600', text: 'AAA', color: 'bg-blue-600' }
        if (achievements >= 90)
            return { name: 'AA', class: 'bg-blue-500', text: 'AA', color: 'bg-blue-500' }
        if (achievements >= 80)
            return { name: 'A', class: 'bg-blue-400', text: 'A', color: 'bg-blue-400' }
        return { name: 'B', class: 'bg-gray-500', text: 'B', color: 'bg-gray-500' }
    }

    // 获取评级图标的URL
    const getAchievementIconSrc = (achievements: number | null) => {
        if (!achievements)
            return undefined

        const rankIcons: { [key: string]: string } = {
            'SSS+': new URL('@/components/global/function/MaimaiCN/assets/UI_TTR_Rank_SSSp.png', import.meta.url).href,
            'SSS': new URL('@/components/global/function/MaimaiCN/assets/UI_TTR_Rank_SSS.png', import.meta.url).href,
            'SS+': new URL('@/components/global/function/MaimaiCN/assets/UI_TTR_Rank_SSp.png', import.meta.url).href,
            'SS': new URL('@/components/global/function/MaimaiCN/assets/UI_TTR_Rank_SS.png', import.meta.url).href,
            'S+': new URL('@/components/global/function/MaimaiCN/assets/UI_TTR_Rank_Sp.png', import.meta.url).href,
            'S': new URL('@/components/global/function/MaimaiCN/assets/UI_TTR_Rank_S.png', import.meta.url).href,
            'AAA': new URL('@/components/global/function/MaimaiCN/assets/UI_TTR_Rank_AAA.png', import.meta.url).href,
            'AA': new URL('@/components/global/function/MaimaiCN/assets/UI_TTR_Rank_AA.png', import.meta.url).href,
            'A': new URL('@/components/global/function/MaimaiCN/assets/UI_TTR_Rank_A.png', import.meta.url).href,
            'BBB': new URL('@/components/global/function/MaimaiCN/assets/UI_TTR_Rank_BBB.png', import.meta.url).href,
            'BB': new URL('@/components/global/function/MaimaiCN/assets/UI_TTR_Rank_BB.png', import.meta.url).href,
            'B': new URL('@/components/global/function/MaimaiCN/assets/UI_TTR_Rank_B.png', import.meta.url).href,
            'C': new URL('@/components/global/function/MaimaiCN/assets/UI_TTR_Rank_C.png', import.meta.url).href,
            'D': new URL('@/components/global/function/MaimaiCN/assets/UI_TTR_Rank_D.png', import.meta.url).href,
        }

        const style = getAchievementStyle(achievements)
        return rankIcons[style.name]
    }

    // 获取歌曲类型标签
    const getSongTypeLabel = (type: string) => {
        const types = {
            standard: { name: 'SD', color: 'bg-blue-500' },
            dx: { name: 'DX', color: 'bg-orange-500' },
            utage: { name: 'UT', color: 'bg-red-800' },
        }

        return types[type as keyof typeof types] || { name: '标准', color: 'bg-blue-500' }
    }

    // 将FC状态转换为显示文本
    const getFCText = (fc: FCType | null, useNoFC = false) => {
        if (fc === null)
            return useNoFC ? 'NO FC' : '无'
        const fcMap = {
            0: 'AP+',
            1: 'AP',
            2: 'FC+',
            3: 'FC',
        }
        return fcMap[fc as FCType] || (useNoFC ? 'NO FC' : '无')
    }

    // 将FS状态转换为显示文本
    const getFSText = (fs: FSType | null, useNoFS = false) => {
        if (fs === null)
            return useNoFS ? 'NO FS' : '无'
        const fsMap = {
            0: 'SYNC',
            1: 'FS',
            2: 'FS+',
            3: 'FSD',
            4: 'FSD+',
        }
        return fsMap[fs as FSType] || (useNoFS ? 'NO FS' : '无')
    }

    // 获取FC图标的URL
    const getFCIconSrc = (fc: FCType | null) => {
        if (fc === null)
            return undefined
        const fcIcons = {
            0: new URL('@/components/global/function/MaimaiCN/assets/UI_MSS_MBase_Icon_APp.png', import.meta.url).href, // APP
            1: new URL('@/components/global/function/MaimaiCN/assets/UI_MSS_MBase_Icon_AP.png', import.meta.url).href, // AP
            2: new URL('@/components/global/function/MaimaiCN/assets/UI_MSS_MBase_Icon_FCp.png', import.meta.url).href, // FCP
            3: new URL('@/components/global/function/MaimaiCN/assets/UI_MSS_MBase_Icon_FC.png', import.meta.url).href, // FC
        }
        return fcIcons[fc]
    }

    // 获取FS图标的URL
    const getFSIconSrc = (fs: FSType | null) => {
        if (fs === null)
            return undefined
        const fsIcons = {
            0: new URL('@/components/global/function/MaimaiCN/assets/UI_MSS_MBase_Icon_Sync.png', import.meta.url).href, // SYNC
            1: new URL('@/components/global/function/MaimaiCN/assets/UI_MSS_MBase_Icon_FS.png', import.meta.url).href, // FS
            2: new URL('@/components/global/function/MaimaiCN/assets/UI_MSS_MBase_Icon_FSp.png', import.meta.url).href, // FSP
            3: new URL('@/components/global/function/MaimaiCN/assets/UI_MSS_MBase_Icon_FSD.png', import.meta.url).href, // FSD
            4: new URL('@/components/global/function/MaimaiCN/assets/UI_MSS_MBase_Icon_FSDp.png', import.meta.url).href, // FSDP
        }
        return fsIcons[fs]
    }

    // 处理封面图加载错误
    const handleImageError = (event: Event) => {
        const target = event.target as HTMLImageElement
        target.src = 'https://assets2.lxns.net/maimai/icon/11.png'
    }

    // 获取歌曲封面URL
    const getSongJacketUrl = (songId: number) => {
        return `https://assets2.lxns.net/maimai/jacket/${songId}.png`
    }

    // 格式化成绩达成率显示
    const formatAchievement = (achievement: number | null): string => {
        if (!achievement)
            return '-'
        const intPart = Number.parseInt(String(achievement))
        const decimalPart = (String(achievement).split('.')[1] || '0').padEnd(4, '0')
        return `${intPart}.${decimalPart}%`
    }

    return {
        getDifficultyColor,
        getAchievementStyle,
        getAchievementIconSrc,
        getSongTypeLabel,
        getFCText,
        getFSText,
        getFCIconSrc,
        getFSIconSrc,
        handleImageError,
        getSongJacketUrl,
        formatAchievement,
    }
}
