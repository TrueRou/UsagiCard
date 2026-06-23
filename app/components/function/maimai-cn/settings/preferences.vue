<script setup lang="ts">
import type { MaimaiBattleEnabledMode, MaimaiBattlePreferenceState } from '~/composables/function/MaimaiCN/useMaimaiTypes'
import { createDefaultBattlePreference, normalizeBattlePreference, useBattle } from '~/composables/function/MaimaiCN/useBattle'
import { QUICK_UPDATE_COOLDOWN_MS } from '~/composables/function/MaimaiCN/useQuickUpdate'

const props = defineProps<{
    artifactId: string
}>()
const {
    storageOf,
    storageSave,
    storageSaving,
    secondaryPinDialogOpen,
    secondaryPinArtifactId,
    handleSecondaryPinVerified,
    handleSecondaryPinClose,
} = await useArtifact(props.artifactId)
type MaimaiPreferenceStorage = Omit<MaimaiStorage, 'battle'> & { battle: ReturnType<typeof createDefaultBattlePreference> }

const storage = ref<MaimaiPreferenceStorage>(buildStorageSnapshot())
const {
    expiresAtText: battleExpiresAtText,
    formatRemainingDuration,
    isExpired: isBattleExpired,
    remainingSeconds: battleRemainingSeconds,
    resolveAvailability,
} = useBattle(props.artifactId, computed(() => storage.value))
const originalBattlePreference = computed(() => normalizeBattlePreference(storageOf('MaimaiCN').value.battle))
const battleEnabledMode = computed<MaimaiBattleEnabledMode>({
    get: () => storage.value.battle.enabled_mode,
    set: enabledMode => storage.value.battle = {
        ...storage.value.battle,
        enabled_mode: enabledMode,
    },
})

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

const battleModeOptions = [
    { value: 'off' as const, label: '关闭', description: '不参与附近的人对战' },
    { value: 'nearby_15m' as const, label: '15 分钟', description: '在 15 分钟内允许随刷新触发 nearby 匹配' },
    { value: 'nearby_1h' as const, label: '1 小时', description: '在 1 小时内允许随刷新触发 nearby 匹配' },
]

function buildStorageSnapshot() {
    return {
        update: { enabled_mode: 'off' as const, last_updated_at: null, strategy: { sources: [], targets: [] } },
        battle: {
            ...createDefaultBattlePreference(),
            ...(storageOf('MaimaiCN').value.battle ?? {}),
        },
        ...storageOf('MaimaiCN').value,
    } as MaimaiPreferenceStorage
}

function isBattleStillActive(battle: MaimaiBattlePreferenceState) {
    if (battle.enabled_mode === 'off' || !battle.expires_at)
        return false
    const expiresAt = new Date(battle.expires_at).getTime()
    return !Number.isNaN(expiresAt) && expiresAt > Date.now()
}

async function saveAndSync() {
    const nextEnabledMode = storage.value.battle?.enabled_mode ?? 'off'
    const previousBattle = originalBattlePreference.value
    const currentBattle = normalizeBattlePreference(storage.value.battle)

    if (nextEnabledMode === 'off') {
        storage.value.battle = {
            ...currentBattle,
            enabled_mode: 'off',
            expires_at: null,
        }
    }
    else if (nextEnabledMode === previousBattle.enabled_mode && isBattleStillActive(previousBattle)) {
        storage.value.battle = {
            ...currentBattle,
            enabled_mode: previousBattle.enabled_mode,
            expires_at: previousBattle.expires_at,
        }
    }
    else {
        storage.value.battle = await resolveAvailability(nextEnabledMode)
    }

    await storageSave('MaimaiCN', storage.value)
    storage.value = buildStorageSnapshot()
}

watch(isBattleExpired, (expired) => {
    if (!expired || !storage.value.battle || storage.value.battle.enabled_mode === 'off')
        return
    storage.value.battle = {
        ...storage.value.battle,
        enabled_mode: 'off',
        expires_at: null,
    }
})
</script>

<template>
    <form class="space-y-5" @submit.prevent="saveAndSync">
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
                    冷却时间 15 分钟。快速更新使用保存的更新计划，含有临时节点的计划不会自动执行。
                </p>
            </template>
        </section>

        <section class="rounded-xl border border-base-300 p-4 space-y-3">
            <div>
                <p class="font-medium text-sm">
                    附近的人对战
                </p>
                <p class="text-xs text-base-content/60">
                    允许在更新成绩后触发附近匹配对战
                </p>
            </div>

            <div class="flex flex-wrap gap-2">
                <button
                    v-for="opt in battleModeOptions"
                    :key="opt.value"
                    type="button"
                    class="btn"
                    :class="battleEnabledMode === opt.value ? 'btn-primary' : 'btn-ghost border border-base-300'"
                    @click="battleEnabledMode = opt.value"
                >
                    {{ opt.label }}
                </button>
            </div>

            <div v-if="battleEnabledMode !== 'off'" class="text-xs space-y-1">
                <p v-if="battleExpiresAtText" class="text-base-content/60">
                    当前周期到期: {{ battleExpiresAtText }}
                    <span v-if="battleRemainingSeconds > 0" class="text-primary">(剩余 {{ formatRemainingDuration(battleRemainingSeconds) }})</span>
                </p>
                <p class="text-base-content/50">
                    {{ battleModeOptions.find(o => o.value === battleEnabledMode)?.description }}
                </p>
            </div>
        </section>

        <button class="btn btn-primary w-full" :disabled="storageSaving" type="submit">
            <span v-if="storageSaving" class="loading loading-spinner loading-sm" />
            保存设置
        </button>

        <Teleport to="body">
            <SecondaryPinDialog
                v-if="secondaryPinDialogOpen"
                :artifact-id="secondaryPinArtifactId"
                mode="verify"
                @verified="handleSecondaryPinVerified"
                @close="handleSecondaryPinClose"
            />
        </Teleport>
    </form>
</template>
