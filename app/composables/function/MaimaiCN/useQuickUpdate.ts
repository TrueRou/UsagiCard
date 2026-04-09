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

function resolveCredential(
    id: string,
    artifactId: string,
    remAccounts: NonNullable<MaimaiStorage['rem_accounts']>,
): { chainLabel: string, credential: string } | null {
    if (id === 'usagicard')
        return { chainLabel: 'usagicard', credential: artifactId }

    if (id.startsWith('account:')) {
        const index = Number.parseInt(id.slice(8))
        const account = remAccounts[index]
        if (!account?.credential)
            return null
        const chainLabel = SERVER_TO_CHAIN_LABEL[account.server]
        if (!chainLabel)
            return null
        return { chainLabel, credential: account.credential }
    }

    return null
}

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

        const rule = storage.value.quick_update_rule
        let sourceDict: Record<string, { credentials: string }>
        let targetDict: Record<string, { credentials: string }>

        if (rule) {
            // Use saved rule
            sourceDict = {}
            targetDict = {}

            if (rule.mode === 'adhoc') {
                for (const id of (rule.source_ids ?? [])) {
                    const resolved = resolveCredential(id, artifactId, remAccounts)
                    if (resolved)
                        sourceDict[resolved.chainLabel] = { credentials: resolved.credential }
                }
                for (const id of (rule.target_ids ?? [])) {
                    const resolved = resolveCredential(id, artifactId, remAccounts)
                    if (resolved)
                        targetDict[resolved.chainLabel] = { credentials: resolved.credential }
                }
            }
            else {
                const dict: Record<string, { credentials: string }> = {}
                for (const id of (rule.aggregate_ids ?? [])) {
                    const resolved = resolveCredential(id, artifactId, remAccounts)
                    if (resolved)
                        dict[resolved.chainLabel] = { credentials: resolved.credential }
                }
                sourceDict = dict
                targetDict = dict
            }
        }
        else {
            // Default: aggregate all accounts + usagicard
            const dict: Record<string, { credentials: string }> = {
                usagicard: { credentials: artifactId },
            }
            for (const account of remAccounts) {
                const chainLabel = SERVER_TO_CHAIN_LABEL[account.server]
                if (chainLabel && account.credential)
                    dict[chainLabel] = { credentials: account.credential }
            }
            sourceDict = dict
            targetDict = dict
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
