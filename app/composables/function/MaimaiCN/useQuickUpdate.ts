interface UpdatesChainEntryResult {
    errors: string | null
    scores_num: number
    scores_rating: number
}

interface UpdatesChainResult {
    source: Record<string, UpdatesChainEntryResult>
    target: Record<string, UpdatesChainEntryResult>
    stores: Record<string, { message: string, data: any | null }>
}

const SERVER_TO_CHAIN_LABEL: Record<string, string> = {
    diving_fish: 'divingfish',
    lxns: 'lxns',
    arcade_legacy: 'arcade_legacy',
}

export const QUICK_UPDATE_COOLDOWN_MS = 15 * 60 * 1000

export function useQuickUpdate(
    artifactId: string,
    storage: ComputedRef<MaimaiStorage | undefined>,
    nsStorage: ComputedRef<ArtifactStorage | undefined>,
) {
    onMounted(async () => {
        if (!storage.value?.quick_update)
            return

        if (storage.value.updating_at) {
            const elapsed = Date.now() - new Date(storage.value.updating_at).getTime()
            if (elapsed < QUICK_UPDATE_COOLDOWN_MS)
                return
        }

        const remAccounts = storage.value.rem_accounts ?? []
        if (remAccounts.length === 0)
            return

        const dict: Record<string, { credentials: string }> = {
            usagicard: { credentials: artifactId },
        }

        for (const account of remAccounts) {
            const chainLabel = SERVER_TO_CHAIN_LABEL[account.server]
            if (chainLabel && account.credential) {
                dict[chainLabel] = { credentials: account.credential }
            }
        }

        try {
            const res = await useNuxtApp().$leporid<UpdatesChainResult>(
                '/api/nuxt/maimai/update',
                {
                    method: 'POST',
                    body: { source: dict, target: dict },
                },
            )

            const updatedStorage: MaimaiStorage = { ...storage.value }
            if (res.stores?.user_player?.data?.name)
                updatedStorage.player_name = res.stores.user_player.data.name
            if (res.stores?.user_player?.data?.rating)
                updatedStorage.player_rating = res.stores.user_player.data.rating
            updatedStorage.updating_at = new Date().toISOString()

            const targetRating = res.target?.usagicard?.scores_rating ?? 0

            await useNuxtApp().$leporid(`/api/artifacts/${artifactId}/storage`, {
                method: 'PATCH',
                body: {
                    storage: {
                        ...nsStorage.value,
                        MaimaiCN: updatedStorage,
                    },
                },
                showSuccessToast: true,
                successMessage: `快速更新完成（Rating -> ${targetRating}）`,
            } as any)
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
