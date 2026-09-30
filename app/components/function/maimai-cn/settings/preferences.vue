<script setup lang="ts">
import type { MaimaiStorage } from '~/types/api'
import { QUICK_UPDATE_COOLDOWN_MS } from '~/composables/function/MaimaiCN/useQuickUpdate'

const props = defineProps<{
    artifactId: string
}>()
const {
    storageOf,
    storageSave,
    storageSaving,
} = await useArtifact(props.artifactId)

const storage = ref<MaimaiStorage>(buildStorageSnapshot())

const isInCooldown = computed(() => {
    if (storage.value.update?.enabled_mode !== 'on' || !storage.value.update?.last_updated_at)
        return false
    const elapsed = Date.now() - new Date(storage.value.update.last_updated_at).getTime()
    return elapsed < QUICK_UPDATE_COOLDOWN_MS
})

const nextUpdateTime = computed(() => {
    if (!storage.value.update?.last_updated_at)
        return ''
    const nextAt = new Date(new Date(storage.value.update.last_updated_at).getTime() + QUICK_UPDATE_COOLDOWN_MS)
    return nextAt.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
})

let saveTimer: ReturnType<typeof setTimeout> | null = null
let savingFromAutoSync = false

function buildStorageSnapshot() {
    return storageOf('MaimaiCN').value
}

async function saveAndSync() {
    savingFromAutoSync = true
    try {
        await storageSave('MaimaiCN', storage.value, { showSuccessToast: false })
        storage.value = buildStorageSnapshot()
        await nextTick()
    }
    finally {
        savingFromAutoSync = false
    }
}

function scheduleSave() {
    if (saveTimer)
        clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
        void saveAndSync()
    }, 500)
}

watch(storage, () => {
    if (savingFromAutoSync)
        return
    scheduleSave()
}, { deep: true })

onBeforeUnmount(() => {
    if (saveTimer)
        clearTimeout(saveTimer)
})
</script>

<template>
    <form class="space-y-5" @submit.prevent>
        <section class="grid gap-4 md:grid-cols-2">
            <div class="space-y-2">
                <label>
                    <p class="font-medium text-sm">玩家名称</p>
                    <p class="text-xs text-base-content/60">上次从数据源获取的玩家名称</p>
                </label>
                <input
                    v-model="storage.bio!.player_name"
                    class="input w-full input-bordered input-disabled"
                    type="text"
                    placeholder="尚未同步"
                    disabled
                >
            </div>

            <div class="space-y-2">
                <label>
                    <p class="font-medium text-sm">玩家 Rating</p>
                    <p class="text-xs text-base-content/60">上次从数据源获取的玩家 Rating</p>
                </label>
                <input
                    v-model="storage.bio!.player_rating"
                    class="input w-full input-bordered input-disabled"
                    type="text"
                    placeholder="尚未同步"
                    disabled
                >
            </div>

            <div class="space-y-2">
                <label>
                    <p class="font-medium text-sm">好友代码</p>
                    <p class="text-xs text-base-content/60">上次从数据源获取的好友代码</p>
                </label>
                <input
                    v-model="storage.bio!.friend_code"
                    class="input w-full input-bordered input-disabled"
                    type="text"
                    placeholder="尚未同步"
                    disabled
                >
            </div>

            <div class="space-y-2">
                <label>
                    <p class="font-medium text-sm">最后同步时间</p>
                    <p class="text-xs text-base-content/60">上次成功同步数据的时间</p>
                </label>
                <input
                    :value="storage.update?.last_updated_at ? new Date(storage.update.last_updated_at).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }) : ''"
                    class="input w-full input-bordered input-disabled"
                    type="text"
                    placeholder="尚未同步"
                    disabled
                >
            </div>
        </section>

        <section class="rounded-xl border border-base-300 p-4 space-y-3">
            <div class="flex items-center justify-between gap-3">
                <div>
                    <p class="font-medium text-sm">
                        快速更新
                    </p>
                    <p class="text-xs text-base-content/60">
                        打开功能页时自动执行更新计划
                    </p>
                </div>
                <input :checked="storage.update?.enabled_mode === 'on'" type="checkbox" class="toggle toggle-primary" @change="e => { storage.update = { ...storage.update, enabled_mode: (e.target as HTMLInputElement).checked ? 'on' : 'off' } }">
            </div>

            <template v-if="storage.update?.enabled_mode === 'on'">
                <div v-if="isInCooldown" class="text-xs text-warning flex items-center gap-1">
                    <Icon name="mdi:timer-sand" class="w-3.5 h-3.5" />
                    冷却中，下次可执行时间: {{ nextUpdateTime }}
                </div>
                <p class="text-xs text-base-content/50">
                    冷却时间 15 分钟。快速更新会跳过临时节点，仅使用已保存凭据的节点执行。
                </p>
            </template>
        </section>

        <section class="rounded-xl border border-base-300 p-4 space-y-3">
            <details>
                <summary class="cursor-pointer list-none">
                    <div class="flex items-center justify-between gap-3">
                        <div>
                            <p class="font-medium text-sm">
                                高级更新设置
                            </p>
                            <p class="text-xs text-base-content/60">
                                更加精细地控制更新的行为
                            </p>
                        </div>
                        <Icon name="mdi:chevron-down" class="w-5 h-5 text-base-content/50" />
                    </div>
                </summary>
                <div class="mt-4">
                    <FunctionMaimaiCnSettingsUpdatePlanEditor :artifact-id="artifactId" />
                </div>
            </details>
        </section>

        <div v-if="storageSaving" class="flex items-center justify-center gap-2 text-xs text-base-content/50">
            <span class="loading loading-spinner loading-xs" />
            正在保存
        </div>
    </form>
</template>
