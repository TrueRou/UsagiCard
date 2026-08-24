import type { ArtifactStorage, ArtifactUserResponse } from '~/types/api'

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
    const secondaryPinKey = `artifact:${artifactId}:secondary-pin`
    const secondaryPin = useState<string | null>(secondaryPinKey, () => null)
    const { request: requestSecondaryPin } = useSecondaryPinDialog()

    onMounted(() => {
        secondaryPin.value = sessionStorage.getItem(secondaryPinKey)
    })

    /*
    / 工件元数据相关
    */

    const artifactAsyncData = await useLeporidae<ArtifactUserResponse>(`/api/artifacts/${artifactId}`)
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

    function setSecondaryPin(pin: string | null) {
        secondaryPin.value = pin
        if (!import.meta.client)
            return
        if (pin)
            sessionStorage.setItem(secondaryPinKey, pin)
        else
            sessionStorage.removeItem(secondaryPinKey)
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
                    // 自定义拦截器选项（ofetch 不认识，内联字面量会触发 excess-property 检查），先放入变量再展开
                    const feedback = { showSuccessToast: options?.showSuccessToast ?? true, successMessage: options?.successMessage ?? '保存成功' }
                    data.value = await nuxtApp.$leporidae<ArtifactUserResponse>(`/api/artifacts/${artifactId}/storage`, {
                        method: 'PATCH',
                        body: { storage: fullStorage },
                        headers: secondaryPin.value
                            ? { 'X-Pin': secondaryPin.value }
                            : {},
                        ...feedback,
                    })
                    saved = true
                    return
                }
                catch (error: any) {
                    if (error?.statusCode !== 423 || attempt > 0)
                        throw error

                    setSecondaryPin(null)
                    const pin = await requestSecondaryPin(artifactId)
                    if (!pin)
                        return
                    setSecondaryPin(pin)
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
            computed(() => artifact.value.design),
            computed(() => artifact.value.type.design_type),
            computed(() => artifact.value),
        ),
    }
}
