import type { MaimaiBests, ParsedQueryCommand, PlateAttr, PlateObject, QueryScoreFilter, QueryState, ScoreExtend, ScoreFilterKey, Song } from './useMaimaiTypes'
import type { FSType, RateType } from './useMaimaiUtils'
import { FCType, MaimaiVersionAliasMap, MaimaiVersionAliasOptions, MaimaiVersionOptions } from './useMaimaiUtils'

type SongSearch = ReturnType<typeof import('./useSongSearch.client')['useSongSearch']>

const PLATE_REGEX = /^[真超檄橙晓桃樱紫堇白雪辉熊华爽煌星宙祭祝双宴镜彩](?:[极将神]|舞舞)(?:进度)?$/
const PLATE_CAPTURE = /^([真超檄橙晓桃樱紫堇白雪辉熊华爽煌星宙祭祝双宴镜彩])([极将神]|舞舞)(?:进度)?$/
const LEVEL_REGEX = /^\d{1,2}\+?$/
const LEVEL_VALUE_MIN_REGEX = /^lv>(\d{2}(?:\.\d)?)$/
const LEVEL_VALUE_MAX_REGEX = /^lv<(\d{2}(?:\.\d)?)$/
const B50_REGEX = /^b50$/i
const SCORE_TOP_REGEX = /^(pc50|fc50|ap50)$/i

const versionAliasTokenMap: Record<string, number> = Object.fromEntries(
    Object.entries(MaimaiVersionAliasMap)
        .flatMap(([value, aliases]) => aliases.map((alias: string) => [alias, Number(value)] as const)),
)

const fcTokenMap = {
    'fc': 3,
    'fc+': 2,
    'fcp': 2,
    'ap': 1,
    'ap+': 0,
    'app': 0,
} as const satisfies Record<string, FCType>

const fsTokenMap = {
    'sync': 0,
    'fs': 1,
    'fs+': 2,
    'fsp': 2,
    'fsd': 3,
    'fsd+': 4,
    'fsdp': 4,
} as const satisfies Record<string, FSType>

const rateTokenMap = {
    'sss+': 0,
    'sss': 1,
    'ss+': 2,
    'ss': 3,
    's+': 4,
    's': 5,
    'aaa': 6,
    'aa': 7,
    'a': 8,
    'bbb': 9,
    'bb': 10,
    'b': 11,
    'c': 12,
    'd': 13,
} as const satisfies Record<string, RateType>

function splitQueryTokens(input: string) {
    return input
        .trim()
        .split(/[\s,，、|/]+/)
        .map(token => token.trim().toLowerCase())
        .filter(Boolean)
}

function formatLevelValue(value: number) {
    return value.toFixed(1)
}

function hasScoreFilter(filter: QueryScoreFilter) {
    return filter.level !== undefined
        || filter.levelValueMin !== undefined
        || filter.levelValueMax !== undefined
        || filter.version !== undefined
        || filter.fc !== undefined
        || filter.fs !== undefined
        || filter.rate !== undefined
}

function buildScoreFilterQuery(filter: QueryScoreFilter) {
    const parts: string[] = []

    if (filter.level)
        parts.push(filter.level)

    if (filter.levelValueMin !== undefined)
        parts.push(`lv>${formatLevelValue(filter.levelValueMin)}`)

    if (filter.levelValueMax !== undefined)
        parts.push(`lv<${formatLevelValue(filter.levelValueMax)}`)

    if (filter.version !== undefined) {
        const alias = MaimaiVersionAliasOptions.find((option: { value: number, token: string }) => option.value === filter.version)?.token
        if (alias)
            parts.push(alias)
    }

    if (filter.fc !== undefined) {
        const fcToken = Object.entries(fcTokenMap).find(([, value]) => value === filter.fc)?.[0]
        if (fcToken)
            parts.push(fcToken)
    }

    if (filter.fs !== undefined) {
        const fsToken = Object.entries(fsTokenMap).find(([, value]) => value === filter.fs)?.[0]
        if (fsToken)
            parts.push(fsToken)
    }

    if (filter.rate !== undefined) {
        const rateToken = Object.entries(rateTokenMap).find(([, value]) => value === filter.rate)?.[0]
        if (rateToken)
            parts.push(rateToken)
    }

    return parts.join(' ')
}

function parseScoreFilter(tokens: string[]): QueryScoreFilter | null {
    if (!tokens.length)
        return null

    const filter: QueryScoreFilter = {}

    for (const token of tokens) {
        if (LEVEL_REGEX.test(token)) {
            filter.level = token
            continue
        }

        const levelValueMinMatch = token.match(LEVEL_VALUE_MIN_REGEX)
        if (levelValueMinMatch?.[1]) {
            filter.levelValueMin = Number(levelValueMinMatch[1])
            continue
        }

        const levelValueMaxMatch = token.match(LEVEL_VALUE_MAX_REGEX)
        if (levelValueMaxMatch?.[1]) {
            filter.levelValueMax = Number(levelValueMaxMatch[1])
            continue
        }

        if (token in versionAliasTokenMap) {
            filter.version = versionAliasTokenMap[token]
            continue
        }

        if (token in fcTokenMap) {
            filter.fc = fcTokenMap[token as keyof typeof fcTokenMap]
            continue
        }

        if (token in fsTokenMap) {
            filter.fs = fsTokenMap[token as keyof typeof fsTokenMap]
            continue
        }

        if (token in rateTokenMap) {
            filter.rate = rateTokenMap[token as keyof typeof rateTokenMap]
            continue
        }

        return null
    }

    if (!hasScoreFilter(filter))
        return null

    return filter
}

function parseQueryCommand(input: string): ParsedQueryCommand {
    const raw = input.trim()

    if (!raw) {
        return {
            mode: 'idle',
            raw,
            displayLabel: '',
        }
    }

    if (B50_REGEX.test(raw)) {
        return {
            mode: 'b50',
            raw,
            displayLabel: 'B50',
        }
    }

    const topMatch = raw.match(SCORE_TOP_REGEX)
    if (topMatch) {
        const cmd = topMatch[1]!.toLowerCase() as 'pc50' | 'fc50' | 'ap50'
        return {
            mode: 'score-top',
            raw,
            displayLabel: cmd.toUpperCase(),
            topCommand: cmd,
        }
    }

    if (PLATE_REGEX.test(raw)) {
        const match = raw.match(PLATE_CAPTURE)!
        const version = match[1]!
        const plan = match[2]!
        return {
            mode: 'plate',
            raw,
            displayLabel: `${version}${plan}`,
            plate: { version, plan },
        }
    }

    const tokens = splitQueryTokens(raw)
    const scoreFilter = parseScoreFilter(tokens)
    if (scoreFilter) {
        return {
            mode: 'score-filter',
            raw,
            displayLabel: buildScoreFilterQuery(scoreFilter),
            scoreFilter,
        }
    }

    return {
        mode: 'song',
        raw,
        displayLabel: raw,
    }
}

export function useQueryCommand(artifactId: string) {
    const state = reactive<QueryState>({
        type: 'typing',
        data: null,
        meta: {},
        loading: false,
        error: null,
        draft: 'b50',
        hint: 'b50',
        previewResults: [],
        scoreFilter: null,
        plateAttr: 'remained',
    })

    let autoExecuteTimer: ReturnType<typeof setTimeout> | null = null
    let lastExecutedCommand = ''
    let latestExecutionId = 0
    let allScoresCache: ScoreExtend[] | null = null
    let allScoresPromise: Promise<ScoreExtend[]> | null = null
    let songSearch: SongSearch | null = null

    const ensureSongSearch = async () => {
        if (!songSearch) {
            const { useSongSearch } = await import('./useSongSearch.client')
            songSearch = useSongSearch()
        }
        return songSearch
    }

    const searchSong = (keyword: string) => {
        return songSearch?.searchSong(keyword) ?? []
    }

    const fetchBests = async () => {
        return await useNuxtApp().$leporid<MaimaiBests>(`/api/otoge/maimai/usagicard/bests?uuid=${artifactId}`)
    }

    const fetchPlate = async (plate: string, attr: PlateAttr) => {
        const params = new URLSearchParams({
            uuid: artifactId,
            plate,
            attr,
        })
        return await useNuxtApp().$leporid<PlateObject[]>(`/api/otoge/maimai/usagicard/plates?${params.toString()}`)
    }

    const fetchAllScores = async () => {
        if (allScoresCache)
            return allScoresCache

        if (!allScoresPromise) {
            const params = new URLSearchParams({ uuid: artifactId })
            allScoresPromise = useNuxtApp().$leporid<ScoreExtend[]>(`/api/otoge/maimai/usagicard/scores?${params.toString()}`).then((data) => {
                allScoresCache = data
                return data
            }).finally(() => {
                allScoresPromise = null
            })
        }

        return await allScoresPromise
    }

    const filterScores = (scores: ScoreExtend[], filter: QueryScoreFilter) => {
        return [...scores]
            .filter((score) => {
                if (filter.level && score.level !== filter.level)
                    return false
                if (filter.levelValueMin !== undefined && score.level_value < filter.levelValueMin)
                    return false
                if (filter.levelValueMax !== undefined && score.level_value > filter.levelValueMax)
                    return false
                if (filter.version !== undefined) {
                    const idx = MaimaiVersionOptions.findIndex(v => v.value === filter.version)
                    const nextVersion = idx >= 0 && idx < MaimaiVersionOptions.length - 1
                        ? MaimaiVersionOptions[idx + 1]?.value
                        : undefined
                    if (score.version < filter.version || (nextVersion !== undefined && score.version >= nextVersion))
                        return false
                }
                if (filter.fc !== undefined && score.fc !== filter.fc)
                    return false
                if (filter.fs !== undefined && score.fs !== filter.fs)
                    return false
                if (filter.rate !== undefined && score.rate !== filter.rate)
                    return false
                return true
            })
            .sort((a, b) => {
                const achievementDiff = (b.achievements ?? 0) - (a.achievements ?? 0)
                if (achievementDiff !== 0)
                    return achievementDiff
                return (b.dx_rating ?? 0) - (a.dx_rating ?? 0)
            })
    }

    const searchAndSelect = async (keyword: string) => {
        await ensureSongSearch()
        const results = searchSong(keyword)
        state.previewResults = results.slice(0, 6)
        state.meta = {}
        if (results.length === 0) {
            state.error = '未找到匹配的指令或歌曲'
            state.type = 'typing'
            state.data = null
        }
        else if (results.length === 1) {
            state.type = 'song'
            state.data = results[0]!
        }
        else {
            state.type = 'song-select'
            state.data = results
        }
    }

    const initSearch = async () => {
        const { indexSongs } = await ensureSongSearch()
        await indexSongs()
        if (state.draft)
            execute(state.draft)
    }

    const scheduleAutoExecute = (input: string) => {
        if (autoExecuteTimer)
            clearTimeout(autoExecuteTimer)

        autoExecuteTimer = setTimeout(() => {
            execute(input)
        }, 220)
    }

    const syncDraftState = (input: string) => {
        const parsed = parseQueryCommand(input)
        state.draft = input
        state.error = null
        state.hint = parsed.mode === 'invalid' ? 'idle' : parsed.mode
        state.scoreFilter = parsed.scoreFilter || null

        if (!parsed.raw) {
            state.previewResults = []
            state.type = 'idle'
            state.data = null
            state.meta = {}
            return parsed
        }

        if (parsed.mode === 'song') {
            state.previewResults = searchSong(parsed.raw).slice(0, 6)
            state.meta = {}
            if (state.type !== 'song') {
                state.type = 'typing'
                state.data = null
            }
        }
        else {
            state.previewResults = []
            state.type = 'typing'
        }

        return parsed
    }

    function updateDraft(input: string) {
        const parsed = syncDraftState(input)

        if (!parsed.raw) {
            if (autoExecuteTimer)
                clearTimeout(autoExecuteTimer)
            return
        }

        scheduleAutoExecute(input)
    }

    async function execute(input: string, force = false) {
        const parsed = parseQueryCommand(input)
        if (!parsed.raw)
            return

        if (!force && parsed.raw === lastExecutedCommand && parsed.mode !== 'song')
            return

        const executionId = ++latestExecutionId
        state.loading = true
        lastExecutedCommand = parsed.raw

        try {
            if (parsed.mode === 'b50') {
                const data = await fetchBests()
                if (executionId !== latestExecutionId)
                    return
                state.type = 'bests'
                state.data = data
                state.meta = {}
            }
            else if (parsed.mode === 'plate' && parsed.plate) {
                const data = await fetchPlate(parsed.plate.version + parsed.plate.plan, state.plateAttr)
                if (executionId !== latestExecutionId)
                    return
                state.type = 'plate'
                state.data = data
                state.meta = { plateName: parsed.displayLabel }
            }
            else if (parsed.mode === 'score-filter' && parsed.scoreFilter) {
                const allScores = await fetchAllScores()
                if (executionId !== latestExecutionId)
                    return
                state.type = 'scores'
                state.data = filterScores(allScores, parsed.scoreFilter)
                state.meta = { queryLabel: parsed.displayLabel }
            }
            else if (parsed.mode === 'score-top' && parsed.topCommand) {
                const allScores = await fetchAllScores()
                if (executionId !== latestExecutionId)
                    return

                let filtered: ScoreExtend[]
                switch (parsed.topCommand) {
                    case 'pc50':
                        filtered = [...allScores]
                            .sort((a, b) => b.play_count - a.play_count)
                            .slice(0, 50)
                        break
                    case 'fc50':
                        filtered = [...allScores]
                            .filter(s => s.fc !== null)
                            .sort((a, b) => b.dx_rating - a.dx_rating)
                            .slice(0, 50)
                        break
                    case 'ap50':
                        filtered = [...allScores]
                            .filter(s => s.fc === FCType.AP || s.fc === FCType.APP)
                            .sort((a, b) => b.dx_rating - a.dx_rating)
                            .slice(0, 50)
                        break
                }

                state.type = 'scores'
                state.data = filtered
                state.meta = { queryLabel: parsed.displayLabel }
            }
            else {
                await searchAndSelect(parsed.raw)
            }
        }
        catch (e: any) {
            if (executionId !== latestExecutionId)
                return
            state.error = e?.message || '查询失败，请稍后重试'
            state.type = 'typing'
        }
        finally {
            if (executionId === latestExecutionId)
                state.loading = false
        }
    }

    const selectSong = (song: Song) => {
        if (autoExecuteTimer)
            clearTimeout(autoExecuteTimer)
        state.type = 'song'
        state.data = song
        state.previewResults = []
        state.error = null
        state.meta = {}
        state.draft = song.title
        state.hint = 'song'
        state.scoreFilter = null
    }

    const applyScoreFilterToken = (key: ScoreFilterKey, value: string) => {
        const nextFilter: QueryScoreFilter = { ...(state.scoreFilter || {}) }

        if (key === 'level') {
            nextFilter.level = value || undefined
        }
        else if (key === 'levelValueMin') {
            nextFilter.levelValueMin = value ? Number(value) : undefined
        }
        else if (key === 'levelValueMax') {
            nextFilter.levelValueMax = value ? Number(value) : undefined
        }
        else if (key === 'version') {
            nextFilter.version = value ? Number(value) : undefined
        }
        else if (key === 'fc') {
            nextFilter.fc = value ? fcTokenMap[value as keyof typeof fcTokenMap] : undefined
        }
        else if (key === 'fs') {
            nextFilter.fs = value ? fsTokenMap[value as keyof typeof fsTokenMap] : undefined
        }
        else if (key === 'rate') {
            nextFilter.rate = value ? rateTokenMap[value as keyof typeof rateTokenMap] : undefined
        }

        const nextDraft = buildScoreFilterQuery(nextFilter)
        updateDraft(nextDraft)
    }

    const resetScoreFilter = () => {
        updateDraft('')
    }

    const setPlateAttr = (attr: PlateAttr) => {
        state.plateAttr = attr
        if (state.type === 'plate' && state.draft)
            execute(state.draft, true)
    }

    return {
        state,
        initSearch,
        updateDraft,
        execute,
        selectSong,
        applyScoreFilterToken,
        resetScoreFilter,
        setPlateAttr,
    }
}
