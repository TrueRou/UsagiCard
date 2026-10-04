import type { ComputedRef } from 'vue'
import type { LocalViewPref, ViewSyncState } from './useScoreDisplay'
import type { StorageSaveFn } from '~/composables/useArtifact'
import type { ArtifactStorage, ArtifactUserResponse, MaimaiTileContent, MaimaiViewMode, MaimaiViewStorage } from '~/types/api'
import { StorageSerializers } from '@vueuse/core'
import { isSameView, normalizeView, resolveDisplayPref } from './useScoreDisplay'

const SYNC_DEBOUNCE_MS = 800

/**
 * 成绩页视图偏好（列表 / 平铺、平铺显示内容）。
 *
 * - 修改立即在本地生效，并写入 localStorage（标记为未同步）。
 * - 防抖后静默写入卡片存储；卡片设置了二级密码时不弹窗，状态变为 locked。
 * - locked 时由用户在视图菜单中点击「保存到卡片」，这时才弹出 PIN 验证。
 *
 * artifact 与 storageSave 由调用方在 script setup 顶层通过 `await useArtifact()` 取得后传入，
 * 这样本函数保持同步，生命周期钩子能正确绑定到组件实例。
 */
export function useScoreDisplayPref(
    artifactId: string,
    artifact: ComputedRef<ArtifactUserResponse & { storage: ArtifactStorage }>,
    storageSave: StorageSaveFn,
) {
    const local = useLocalStorage<LocalViewPref | null>(`maicn:${artifactId}:view`, null, {
        serializer: StorageSerializers.object,
        initOnMounted: true,
    })
    const cardView = computed(() => artifact.value.storage.MaimaiCN?.view)
    const current = computed(() => resolveDisplayPref(cardView.value, local.value))
    const syncState = ref<ViewSyncState>('synced')

    let timer: ReturnType<typeof setTimeout> | undefined

    function clearTimer() {
        if (timer !== undefined) {
            clearTimeout(timer)
            timer = undefined
        }
    }

    function schedule() {
        clearTimer()
        timer = setTimeout(() => void sync('silent'), SYNC_DEBOUNCE_MS)
    }

    async function sync(pinMode: 'silent' | 'prompt') {
        clearTimer()
        const storage = artifact.value.storage.MaimaiCN
        if (!storage)
            return
        const target = normalizeView(current.value)
        syncState.value = 'syncing'
        try {
            const result = await storageSave('MaimaiCN', { ...storage, view: target }, {
                pinMode,
                showSuccessToast: pinMode === 'prompt',
                successMessage: '视图已保存到卡片',
            })
            if (result !== 'saved') {
                syncState.value = 'locked'
                return
            }
            // 同步期间用户可能又改了视图：一致时清除未同步标记，否则继续排队同步
            if (local.value && isSameView(local.value, target))
                local.value = { ...target, dirty: false }
            if (local.value?.dirty)
                schedule()
            else
                syncState.value = 'synced'
        }
        catch {
            syncState.value = 'error'
        }
    }

    function update(patch: Partial<MaimaiViewStorage>) {
        const next = normalizeView({ ...current.value, ...patch })
        if (isSameView(next, current.value))
            return
        const matchesCard = Boolean(cardView.value) && isSameView(next, normalizeView(cardView.value))
        local.value = { ...next, dirty: !matchesCard }
        if (matchesCard) {
            clearTimer()
            syncState.value = 'synced'
            return
        }
        syncState.value = 'syncing'
        schedule()
    }

    const mode = computed<MaimaiViewMode>({
        get: () => current.value.mode,
        set: value => update({ mode: value }),
    })
    const tileContent = computed<MaimaiTileContent>({
        get: () => current.value.tile_content,
        set: value => update({ tile_content: value }),
    })

    // useLocalStorage 的 initOnMounted 先注册，这里执行时本地值已读出；上次未同步成功的修改在此重试
    onMounted(() => {
        if (local.value?.dirty) {
            syncState.value = 'syncing'
            schedule()
        }
    })

    // 离开页面时立刻提交还在防抖中的同步；失败会保留本地标记，下次进入时重试
    onScopeDispose(() => {
        if (timer !== undefined)
            void sync('silent')
    })

    return {
        mode,
        tileContent,
        syncState: readonly(syncState),
        saveToCard: () => sync('prompt'),
    }
}
