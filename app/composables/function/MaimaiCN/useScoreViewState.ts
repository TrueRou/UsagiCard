import type { ScoreFilterState, ScoreSortState } from './useMaimaiTypes'
import { cloneFilter, DEFAULT_FILTER, DEFAULT_SORT } from './useScoreView'

/** 「全部成绩」页的筛选与排序状态，持久化到 localStorage */
export function useScoreViewState() {
    const filter = useLocalStorage<ScoreFilterState>('maicn:score-view:filter', cloneFilter(DEFAULT_FILTER), {
        mergeDefaults: true,
        initOnMounted: true,
    })
    const sort = useLocalStorage<ScoreSortState>('maicn:score-view:sort', { ...DEFAULT_SORT }, {
        mergeDefaults: true,
        initOnMounted: true,
    })

    function resetFilter() {
        filter.value = cloneFilter(DEFAULT_FILTER)
    }

    function resetSort() {
        sort.value = { ...DEFAULT_SORT }
    }

    return { filter, sort, resetFilter, resetSort }
}
