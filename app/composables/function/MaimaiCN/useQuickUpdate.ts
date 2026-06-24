import type { UpdatesChainResult } from './useMaimaiTypes'

const SERVER_TO_CHAIN_LABEL: Record<string, string> = {
    diving_fish: 'divingfish',
    lxns: 'lxns',
    arcade_legacy: 'arcade_legacy',
    arcade: 'arcade',
    usagi_card: 'usagicard',
}

export const QUICK_UPDATE_COOLDOWN_MS = 15 * 60 * 1000

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

        const strategy = storage.value.update?.strategy
        if (!strategy || (strategy.sources.length === 0 && strategy.targets.length === 0))
            return

        const sources = strategy.sources.filter(node => !node.transient)
        const targets = strategy.targets.filter(node => !node.transient)

        // 构建 source/target 字典
        const sourceDict: Record<string, { credentials: string }> = {}
        const targetDict: Record<string, { credentials: string }> = {}

        for (const node of sources) {
            const chainLabel = SERVER_TO_CHAIN_LABEL[node.server]
            if (!chainLabel)
                continue
            const credential = node.server === 'usagi_card' ? artifactId : (node.credential ?? '')
            if (!credential)
                continue
            sourceDict[chainLabel] = { credentials: credential }
        }

        for (const node of targets) {
            const chainLabel = SERVER_TO_CHAIN_LABEL[node.server]
            if (!chainLabel)
                continue
            const credential = node.server === 'usagi_card' ? artifactId : (node.credential ?? '')
            if (!credential)
                continue
            targetDict[chainLabel] = { credentials: credential }
        }

        if (Object.keys(sourceDict).length === 0 || Object.keys(targetDict).length === 0)
            return

        try {
            const res = await useNuxtApp().$leporid<UpdatesChainResult>(
                '/api/nuxt/maimai/update',
                {
                    method: 'POST',
                    body: { source: sourceDict, target: targetDict },
                },
            )

            const updatedStorage: MaimaiStorage = { ...storage.value }
            const bioUpdate: typeof updatedStorage.bio = { ...updatedStorage.bio }
            if (res.stores?.user_player?.data?.name)
                bioUpdate.player_name = res.stores.user_player.data.name
            if (res.stores?.user_player?.data?.rating)
                bioUpdate.player_rating = res.stores.user_player.data.rating
            updatedStorage.bio = bioUpdate
            updatedStorage.update = {
                ...updatedStorage.update,
                last_updated_at: new Date().toISOString(),
            }

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
