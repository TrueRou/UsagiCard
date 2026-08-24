import type { UpdatesChainResult } from './useMaimaiTypes'
import { buildMaimaiUpdatePayload } from './useMaimaiUpdatePlan'

export const QUICK_UPDATE_COOLDOWN_MS = 15 * 60 * 1000

export function applyMaimaiUpdateResult(storage: MaimaiStorage, result: UpdatesChainResult): MaimaiStorage {
    const updatedStorage: MaimaiStorage = { ...storage }
    const bioUpdate: typeof updatedStorage.bio = { ...updatedStorage.bio }
    const playerData = result.stores?.user_player?.data

    if (playerData?.name)
        bioUpdate.player_name = playerData.name
    if (playerData?.rating !== undefined && playerData?.rating !== null)
        bioUpdate.player_rating = playerData.rating

    updatedStorage.bio = bioUpdate
    updatedStorage.update = {
        ...updatedStorage.update,
        last_updated_at: new Date().toISOString(),
    }
    return updatedStorage
}

export function useQuickUpdate(
    artifactId: string,
    storage: ComputedRef<MaimaiStorage>,
    storageSave: StorageSaveFn,
    onUpdated?: () => void | Promise<void>,
) {
    onMounted(async () => {
        if (storage.value.update?.enabled_mode !== 'on')
            return

        if (storage.value.update?.last_updated_at) {
            const elapsed = Date.now() - new Date(storage.value.update.last_updated_at).getTime()
            if (elapsed < QUICK_UPDATE_COOLDOWN_MS)
                return
        }

        const payload = buildMaimaiUpdatePayload(storage.value.update?.strategy, artifactId, { includeTransient: false })

        if (Object.keys(payload.source).length === 0)
            return

        try {
            const res = await useNuxtApp().$leporid<UpdatesChainResult>(
                '/api/nuxt/maimai/update',
                {
                    method: 'POST',
                    body: payload,
                },
            )

            const updatedStorage = applyMaimaiUpdateResult(storage.value, res)

            const targetRating = Object.values(res.target).find(v => v.scores_rating)?.scores_rating

            await storageSave('MaimaiCN', updatedStorage, {
                successMessage: `快速更新完成（Rating -> ${targetRating}）`,
            })
            await onUpdated?.()
        }
        catch (e: any) {
            const { addNotification } = useNotificationsStore()
            addNotification({
                type: 'error',
                message: e?.message ?? '快速更新失败',
            })
        }
    })
}
