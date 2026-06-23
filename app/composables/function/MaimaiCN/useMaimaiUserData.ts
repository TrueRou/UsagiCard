import type { StoreCurvesResponse, StoreFieldsResponse, StoreLatestResponse } from './useMaimaiTypes'

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
