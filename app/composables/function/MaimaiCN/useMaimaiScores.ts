import type { MaimaiBests } from './useMaimaiUtils'

export async function useMaimaiScores(artifact: ArtifactUserResponse) {
    const { data, error } = await useLeporid<MaimaiBests>('/api/otoge/maimai/usagicard/bests', { query: { uuid: artifact.id } })

    if (data.value === undefined) {
        createError({ statusCode: 404, statusMessage: '当前兔卡账户数据不正确', fatal: true, data: error.value })
    }

    return {
        bests: data as Ref<MaimaiBests>,
    }
}
