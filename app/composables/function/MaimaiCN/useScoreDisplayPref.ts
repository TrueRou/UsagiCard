import type { ComputedRef } from 'vue'
import type { LocalViewPref, ViewSyncState } from './useScoreDisplay'
import type { LocalScoresPref } from './useScorePreferences'
import type { StorageSaveFn } from '~/composables/useArtifact'
import type { ArtifactStorage, ArtifactUserResponse, MaimaiTileContent, MaimaiViewMode, MaimaiViewStorage } from '~/types/api'
import { StorageSerializers } from '@vueuse/core'
import { isSameView, normalizeView, resolveDisplayPref } from './useScoreDisplay'
import { createPreferenceQueue, isSameScores, normalizeScores, resolveScoresPref, scoresFromStorage, scoresToStorage } from './useScorePreferences'
import { cloneFilter, DEFAULT_FILTER, DEFAULT_SORT } from './useScoreView'

const SYNC_DEBOUNCE_MS = 800
// 以 Nuxt app 隔离 SSR 请求；离开页面后的提交也与下一页的写入共用队列。
const queues = new WeakMap<object, Map<string, ReturnType<typeof createPreferenceQueue>>>()

/**
 * 视图及可选的「全部成绩」偏好：立即本地生效，防抖保存到卡片。
 * 本地缓存按卡片隔离，失败保留 dirty，支持手动及下次进入重试。
 * bests 只更新 view；全部成绩通过同一个请求提交 view/filter/sort，避免相互覆盖。
 */
export function useScoreDisplayPref(
    artifactId: string,
    artifact: ComputedRef<ArtifactUserResponse & { storage: ArtifactStorage }>,
    storageSave: StorageSaveFn,
    includeScores = false,
) {
    const app = useNuxtApp()
    let appQueues = queues.get(app)
    if (!appQueues) {
        appQueues = new Map()
        queues.set(app, appQueues)
    }
    if (!appQueues.has(artifactId))
        appQueues.set(artifactId, createPreferenceQueue())
    const enqueue = appQueues.get(artifactId)!

    const local = useLocalStorage<LocalViewPref | null>(`maicn:${artifactId}:view`, null, {
        serializer: StorageSerializers.object,
        initOnMounted: true,
    })
    const localScores = useLocalStorage<LocalScoresPref | null>(`maicn:${artifactId}:scores`, null, {
        serializer: StorageSerializers.object,
        initOnMounted: true,
    })
    const cardView = computed(() => artifact.value.storage.MaimaiCN?.view)
    const cardScores = computed(() => artifact.value.storage.MaimaiCN?.scores)
    const current = computed(() => resolveDisplayPref(cardView.value, local.value))
    const currentScores = computed(() => resolveScoresPref(cardScores.value, localScores.value))
    const scoreState = computed(() => scoresFromStorage(currentScores.value))
    const syncState = ref<ViewSyncState>('synced')
    const dirty = () => Boolean(local.value?.dirty || (includeScores && localScores.value?.dirty))

    let timer: ReturnType<typeof setTimeout> | undefined
    let running: Promise<void> | undefined
    let mounted = false
    let disposed = false

    function clearTimer() {
        if (timer !== undefined) {
            clearTimeout(timer)
            timer = undefined
        }
    }

    function schedule() {
        clearTimer()
        syncState.value = 'syncing'
        if (disposed)
            void sync(true)
        else
            timer = setTimeout(() => void sync(true), SYNC_DEBOUNCE_MS)
    }

    async function sync(silent: boolean): Promise<void> {
        clearTimer()
        if (running) {
            await running
            if (!silent && dirty())
                return sync(false)
            return
        }
        if (!dirty()) {
            syncState.value = 'synced'
            return
        }
        syncState.value = 'syncing'
        let failed = false
        running = enqueue(async () => {
            // 只提交本次修改的设置，不再拼接 bio/update 或其他无关内容。
            const storage = artifact.value.storage.MaimaiCN
            if (!storage)
                throw new Error('卡片未启用 MaimaiCN')
            const view = local.value?.dirty ? normalizeView(current.value) : undefined
            const scores = includeScores && localScores.value?.dirty ? normalizeScores(currentScores.value) : undefined
            if (!view && !scores)
                return
            await storageSave('MaimaiCN', {
                ...(view ? { view } : {}),
                ...(scores ? { scores } : {}),
            }, {
                showSuccessToast: !silent,
                showErrorToast: !silent,
                successMessage: includeScores ? '成绩页设置已保存到卡片' : '视图已保存到卡片',
            })
            // 请求期间的新修改不能被旧响应清除，完成后继续提交最新值。
            if (view && local.value && isSameView(local.value, view))
                local.value = { ...view, dirty: false }
            if (scores && localScores.value && isSameScores(localScores.value, scores))
                localScores.value = { ...scores, dirty: false }
        }).catch(() => {
            failed = true
            syncState.value = 'error'
        })
        await running
        running = undefined
        if (!failed) {
            if (dirty())
                schedule()
            else
                syncState.value = 'synced'
        }
    }

    function update(patch: Partial<MaimaiViewStorage>) {
        const next = normalizeView({ ...current.value, ...patch })
        if (isSameView(next, current.value))
            return
        const matchesCard = !enqueue.isPending() && Boolean(cardView.value) && isSameView(next, normalizeView(cardView.value))
        local.value = { ...next, dirty: !matchesCard }
    }

    function updateScores(patch: Partial<typeof scoreState.value>) {
        const next = scoresToStorage(patch.filter ?? scoreState.value.filter, patch.sort ?? scoreState.value.sort)
        if (isSameScores(next, currentScores.value))
            return
        const matchesCard = !enqueue.isPending() && Boolean(cardScores.value) && isSameScores(next, normalizeScores(cardScores.value))
        localScores.value = { ...next, dirty: !matchesCard }
    }

    const mode = computed<MaimaiViewMode>({
        get: () => current.value.mode,
        set: value => update({ mode: value }),
    })
    const tileContent = computed<MaimaiTileContent>({
        get: () => current.value.tile_content,
        set: value => update({ tile_content: value }),
    })
    const filter = computed({
        get: () => scoreState.value.filter,
        set: value => updateScores({ filter: value }),
    })
    const sort = computed({
        get: () => scoreState.value.sort,
        set: value => updateScores({ sort: value }),
    })

    watch([local, localScores], () => {
        if (!mounted || disposed)
            return
        if (dirty()) {
            schedule()
        }
        else if (!running) {
            clearTimer()
            syncState.value = 'synced'
        }
    }, { deep: true, flush: 'sync' })

    onMounted(() => {
        // 旧全局筛选/排序仅迁入第一张没有卡片配置的卡片；不覆盖卡片或按卡片缓存。
        if (includeScores && !cardScores.value && !localScores.value) {
            try {
                const storage = window.localStorage
                if (!storage.getItem('maicn:score-view:migrated-to')) {
                    const filter = storage.getItem('maicn:score-view:filter')
                    const sort = storage.getItem('maicn:score-view:sort')
                    if (filter || sort) {
                        // 通过同一规范化入口校验旧 camelCase 数据。
                        const oldFilter = filter ? JSON.parse(filter) : DEFAULT_FILTER
                        const oldSort = sort ? JSON.parse(sort) : DEFAULT_SORT
                        localScores.value = { ...scoresToStorage(oldFilter, oldSort), dirty: true }
                        storage.setItem('maicn:score-view:migrated-to', artifactId)
                    }
                }
            }
            catch {
                // 损坏或不可访问的旧缓存不影响页面使用。
            }
        }
        mounted = true
        if (dirty())
            schedule()
    })

    onScopeDispose(() => {
        disposed = true
        clearTimer()
        if (dirty())
            void sync(true)
    })

    return {
        mode,
        tileContent,
        filter,
        sort,
        resetFilter: () => updateScores({ filter: cloneFilter(DEFAULT_FILTER) }),
        resetSort: () => updateScores({ sort: { ...DEFAULT_SORT } }),
        syncState: readonly(syncState),
        saveToCard: () => sync(false),
    }
}
