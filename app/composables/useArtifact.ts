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
    const { withSecondaryPin } = useArtifactPin(artifactId)

    /*
    / 工件元数据相关
    */

    const artifactAsyncData = await useLeporidae<ArtifactUserResponse>(`/api/artifacts/${artifactId}`)
    const { data, error } = artifactAsyncData

    const artifact = computed((): ArtifactUserResponse & { storage: ArtifactStorage } => {
        if (!data.value) {
            throw createError({ statusCode: error.value?.statusCode || 404, statusMessage: '工件获取失败', message: error.value?.message })
        }
        return data.value as ArtifactUserResponse & { storage: ArtifactStorage }
    })

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
        return computed(() => {
            const storage = artifact.value.storage[ns]
            if (!storage)
                throw createError({ statusCode: 404, message: `卡片未启用 ${ns} 功能` })
            return cloneStorageData(storage)
        })
    }

    const storageSaving = ref(false)

    const storageSave: StorageSaveFn = async (namespace, newData, options) => {
        const currentStorage = cloneStorageData(artifact.value.storage[namespace])
        const fullStorage = cloneStorageData({ ...artifact.value.storage, [namespace]: newData })
        let saved = false

        storageSaving.value = true
        try {
            const feedback = { showSuccessToast: options?.showSuccessToast ?? true, successMessage: options?.successMessage ?? '保存成功' }
            const result = await withSecondaryPin(headers => nuxtApp.$leporidae<ArtifactUserResponse>(`/api/artifacts/${artifactId}/storage`, {
                method: 'PATCH',
                body: { storage: fullStorage },
                headers,
                ...feedback,
            }))
            if (!result)
                return
            data.value = result
            saved = true
        }
        finally {
            if (!saved) {
                for (const key of Object.keys(newData))
                    Reflect.deleteProperty(newData, key)
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
