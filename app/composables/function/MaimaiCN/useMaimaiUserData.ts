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

export async function useMaimaiUserData(artifactId: string) {
    const { data, error } = await useLeporid<StoreLatestResponse>(
        '/api/otoge/maimai/usagicard/user_data/latest',
        { query: { uuid: artifactId } },
    )
    return { userData: data, userDataError: error }
}

export async function useMaimaiUserRegion(artifactId: string) {
    const { data, error } = await useLeporid<StoreLatestResponse>(
        '/api/otoge/maimai/usagicard/user_region/latest',
        { query: { uuid: artifactId } },
    )
    return { regionData: data, regionError: error }
}

export async function fetchUserDataCurves(
    artifactId: string,
    fields: string[],
    startTime?: string,
    endTime?: string,
): Promise<StoreCurvesResponse> {
    const { $leporid } = useNuxtApp()
    return $leporid<StoreCurvesResponse>('/api/otoge/maimai/usagicard/user_data/curves', {
        method: 'POST',
        body: {
            uuid: artifactId,
            fields,
            start_time: startTime,
            end_time: endTime,
        },
    })
}

export async function fetchUserRegionCurves(
    artifactId: string,
    startTime?: string,
    endTime?: string,
): Promise<StoreCurvesResponse> {
    const { $leporid } = useNuxtApp()
    return $leporid<StoreCurvesResponse>('/api/otoge/maimai/usagicard/user_region/curves', {
        method: 'POST',
        body: {
            uuid: artifactId,
            start_time: startTime,
            end_time: endTime,
        },
    })
}

export async function fetchUserRegionFields(): Promise<string[]> {
    const { $leporid } = useNuxtApp()
    const response = await $leporid<StoreFieldsResponse>('/api/otoge/maimai/usagicard/user_region/fields')
    return response.fields
}
