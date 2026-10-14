import type { ArtifactStorage, ArtifactUserResponse } from '~/types/api'

type StorageNamespace = keyof ArtifactStorage

interface StorageSaveOptions {
    successMessage?: string
    showSuccessToast?: boolean
    /** false 时失败不弹出错误提示（调用方自行处理抛出的错误） */
    showErrorToast?: boolean
}

/** 写入成功时 resolve；失败时抛出请求错误，并回滚传入的 newData */
export type StorageSaveFn = <K extends StorageNamespace>(
    namespace: K,
    newData: NonNullable<ArtifactStorage[K]>,
    options?: StorageSaveOptions,
) => Promise<void>

export async function useArtifact(artifactId: string) {
    const nuxtApp = useNuxtApp()

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
            data.value = await nuxtApp.$leporidae<ArtifactUserResponse>(`/api/artifacts/${artifactId}/storage`, {
                method: 'PATCH',
                body: { storage: fullStorage },
                showSuccessToast: options?.showSuccessToast ?? true,
                successMessage: options?.successMessage ?? '保存成功',
                ...(options?.showErrorToast === false ? { showErrorToast: false } : {}),
            })
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

    /*
    / 工件激活相关（SHIPPED -> ACTIVATED）
    */

    /** 已发货但尚未激活：需先申领或跳过申领 */
    const needsActivation = computed(() => artifact.value.status === 'SHIPPED')
    const activating = ref(false)

    /** claim：以当前登录用户申领（需登录）；skip：跳过申领直接激活，此后不可再申领 */
    async function activate(mode: 'claim' | 'skip') {
        activating.value = true
        try {
            data.value = await nuxtApp.$leporidae<ArtifactUserResponse>(`/api/artifacts/${artifactId}/${mode === 'claim' ? 'claim' : 'skip-claim'}`, {
                method: 'POST',
                showSuccessToast: true,
                successMessage: mode === 'claim' ? '申领成功' : '卡片已激活',
            })
        }
        finally {
            activating.value = false
        }
    }

    return {
        artifact,
        artifactAsyncData,
        needsActivation,
        activating,
        activate,
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
