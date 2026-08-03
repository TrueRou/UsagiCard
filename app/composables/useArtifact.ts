type StorageNamespace = keyof ArtifactStorage

interface StorageSaveOptions {
    successMessage?: string
    showSuccessToast?: boolean
}

export type StorageSaveFn = <K extends StorageNamespace>(
    namespace: K,
    newData: NonNullable<ArtifactStorage[K]>,
    options?: StorageSaveOptions,
) => Promise<void>

export async function useArtifact(artifactId: string) {
    const nuxtApp = useNuxtApp()
    const secondaryTokenKey = `artifact:${artifactId}:secondary-pin-token`
    const secondaryToken = useState<string | null>(secondaryTokenKey, () => null)
    const { request: requestSecondaryPin } = useSecondaryPinDialog()

    onMounted(() => {
        secondaryToken.value = sessionStorage.getItem(secondaryTokenKey)
    })

    /*
    / 工件元数据相关
    */

    const artifactAsyncData = await useLeporid<ArtifactUserResponse>(`/api/artifacts/${artifactId}`)
    const { data, error } = artifactAsyncData

    const artifact = computed((): ArtifactUserResponse & { storage: ArtifactStorage } => {
        if (data.value === undefined) {
            throw createError({ statusCode: error.value?.statusCode || 404, statusMessage: '工件获取失败', message: error.value?.message })
        }
        return data.value as ArtifactUserResponse & { storage: ArtifactStorage }
    })

    /*
    / 工件二级密码相关
    */

    function setSecondaryToken(token: string | null) {
        secondaryToken.value = token
        if (!import.meta.client)
            return
        if (token)
            sessionStorage.setItem(secondaryTokenKey, token)
        else
            sessionStorage.removeItem(secondaryTokenKey)
    }

    /*
    / 工件存储相关
    */

    function cloneStorageData<T>(value: T): T {
        const raw = toRaw(value)
        if (raw === undefined)
            return raw
        return JSON.parse(JSON.stringify(raw))
    }

    const storageOf = <K extends StorageNamespace>(ns: K) => {
        return computed(() => cloneStorageData(artifact.value.storage[ns]))
    }

    const storageSaving = ref(false)

    const storageSave: StorageSaveFn = async (namespace, newData, options) => {
        const currentStorage = cloneStorageData(artifact.value.storage[namespace])
        const fullStorage = cloneStorageData({ ...artifact.value.storage, [namespace]: newData })
        let saved = false

        storageSaving.value = true
        try {
            for (let attempt = 0; attempt < 2; attempt++) {
                try {
                    data.value = await nuxtApp.$leporid(`/api/artifacts/${artifactId}/storage`, {
                        method: 'PATCH',
                        body: { storage: fullStorage },
                        headers: secondaryToken.value
                            ? { 'X-Secondary-Password': secondaryToken.value }
                            : {},
                        showSuccessToast: options?.showSuccessToast ?? true,
                        successMessage: options?.successMessage ?? '保存成功',
                    } as any)
                    saved = true
                    return
                }
                catch (error: any) {
                    if (error?.statusCode !== 423 || attempt > 0)
                        throw error

                    setSecondaryToken(null)
                    const token = await requestSecondaryPin(artifactId)
                    if (!token)
                        return
                    setSecondaryToken(token)
                }
            }
        }
        finally {
            if (!saved) {
                for (const key of Object.keys(newData) as Array<keyof typeof newData>)
                    delete newData[key]
                Object.assign(newData, currentStorage)
            }
            setTimeout(() => storageSaving.value = false, 500)
        }
    }

    return {
        artifact,
        artifactAsyncData,
        storageOf,
        storageSave,
        storageSaving,
        useDesignCtx: useDesign(
            computed(() => artifact.value.product.design),
            computed(() => artifact.value.product.type.design_type),
            computed(() => artifact.value.product),
            computed(() => artifact.value),
        ),
    }
}
