import type { ArtifactStorage, ArtifactUserResponse } from '~/types/api'
import { PIN_LOCKED } from './useArtifactPin'

type StorageNamespace = keyof ArtifactStorage

interface StorageSaveOptions {
    successMessage?: string
    showSuccessToast?: boolean
    /** silent：遇到二级密码保护时不弹窗，返回 'locked'，同时不显示错误提示 */
    pinMode?: 'prompt' | 'silent'
}

/** saved：已写入；locked：静默模式下被二级密码拦截；cancelled：用户取消 PIN 输入 */
export type StorageSaveResult = 'saved' | 'locked' | 'cancelled'

export type StorageSaveFn = <K extends StorageNamespace>(
    namespace: K,
    newData: NonNullable<ArtifactStorage[K]>,
    options?: StorageSaveOptions,
) => Promise<StorageSaveResult>

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

        const silent = options?.pinMode === 'silent'
        storageSaving.value = true
        try {
            const feedback = {
                showSuccessToast: options?.showSuccessToast ?? true,
                successMessage: options?.successMessage ?? '保存成功',
                ...(silent ? { showErrorToast: false } : {}),
            }
            const request = (headers: Record<string, string>) => nuxtApp.$leporidae<ArtifactUserResponse>(`/api/artifacts/${artifactId}/storage`, {
                method: 'PATCH',
                body: { storage: fullStorage },
                headers,
                ...feedback,
            })
            const result = silent
                ? await withSecondaryPin(request, { prompt: false })
                : await withSecondaryPin(request)
            if (result === PIN_LOCKED)
                return 'locked'
            if (!result)
                return 'cancelled'
            data.value = result
            saved = true
            return 'saved'
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
