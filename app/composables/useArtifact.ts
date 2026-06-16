type StorageNamespace = keyof ArtifactStorage

export type StorageSaveFn = <K extends StorageNamespace>(
    namespace: K,
    newData: NonNullable<ArtifactStorage[K]>,
    options?: { successMessage?: string, showSuccessToast?: boolean },
) => Promise<void>

export async function useArtifact(artifactId: string) {
    const artifactAsyncData = await useLeporid<ArtifactUserResponse>(`/api/artifacts/${artifactId}`)
    const { data, error } = artifactAsyncData

    const artifact = computed((): ArtifactUserResponse & { storage: ArtifactStorage } => {
        if (data.value === undefined) {
            throw createError({ statusCode: error.value?.statusCode || 404, statusMessage: '工件获取失败', message: error.value?.message })
        }
        return data.value as ArtifactUserResponse & { storage: ArtifactStorage }
    })

    const storageOf = <K extends StorageNamespace>(ns: K) => {
        return computed(() => artifact.value.storage[ns])
    }

    const storageSaving = ref(false)

    // 二级 PIN token 管理（页面级别）
    const secondaryToken = ref<string | null>(null)
    const secondaryPinDialogOpen = ref(false)
    let pendingPinResolve: ((token: string | null) => void) | null = null

    function requestSecondaryPin(): Promise<string | null> {
        secondaryPinDialogOpen.value = true
        return new Promise((resolve) => {
            pendingPinResolve = resolve
        })
    }

    function handleSecondaryPinVerified(token: string) {
        secondaryToken.value = token
        secondaryPinDialogOpen.value = false
        pendingPinResolve?.(token)
        pendingPinResolve = null
    }

    function handleSecondaryPinClose() {
        secondaryPinDialogOpen.value = false
        pendingPinResolve?.(null)
        pendingPinResolve = null
    }

    async function doSave(fullStorage: Record<string, any>, options?: { successMessage?: string, showSuccessToast?: boolean }) {
        const headers: Record<string, string> = {}
        if (secondaryToken.value) {
            headers['X-Secondary-Password'] = secondaryToken.value
        }

        data.value = await useNuxtApp().$leporid(`/api/artifacts/${artifactId}/storage`, {
            method: 'PATCH',
            body: { storage: fullStorage },
            headers,
            showSuccessToast: options?.showSuccessToast ?? true,
            successMessage: options?.successMessage ?? '保存成功',
        })
    }

    const storageSave: StorageSaveFn = async (namespace, newData, options) => {
        storageSaving.value = true
        try {
            const fullStorage = { ...artifact.value.storage, [namespace]: newData }
            try {
                await doSave(fullStorage, options)
            }
            catch (e: any) {
                // 423: 需要二级密码
                if (e?.statusCode === 423) {
                    const token = await requestSecondaryPin()
                    if (token) {
                        // 重试保存
                        await doSave(fullStorage, options)
                    }
                    else {
                        // 用户取消
                        throw createError({ statusCode: 423, message: '需要二级密码验证' })
                    }
                }
                else {
                    throw e
                }
            }
        }
        finally {
            setTimeout(() => storageSaving.value = false, 500)
        }
    }

    return {
        artifact,
        artifactAsyncData,
        storageOf,
        storageSave,
        storageSaving,
        // 二级 PIN 相关
        secondaryPinDialogOpen,
        secondaryPinArtifactId: artifactId,
        handleSecondaryPinVerified,
        handleSecondaryPinClose,
        useDesignCtx: useDesign(
            computed(() => artifact.value.product.design),
            computed(() => artifact.value.product.type.design_type),
            computed(() => artifact.value.product),
            computed(() => artifact.value),
        ),
    }
}
