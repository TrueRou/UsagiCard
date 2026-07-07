<script setup lang="ts">
import type { UpdatesChainResult } from '~/composables/function/MaimaiCN/useMaimaiTypes'
import type { MaimaiUpdateServer } from '~/composables/function/MaimaiCN/useMaimaiUpdatePlan'
import {
    buildMaimaiUpdatePayload,
    getMaimaiUpdateNode,
    getMaimaiUpdateSourceDef,
    getMaimaiUpdateTargetNames,
    MAIMAI_UPDATE_BINDABLE_TARGETS,
    maimaiUpdateChainLabelToColor,
    maimaiUpdateChainLabelToName,
    removeMaimaiUpdateNode,
    sanitizeMaimaiUpdateStrategy,
    upsertMaimaiUpdateNode,
} from '~/composables/function/MaimaiCN/useMaimaiUpdatePlan'

const props = defineProps<{
    artifactId: string
    fromDialog?: boolean
    onMaimaiUpdateComplete?: () => void | Promise<void>
}>()

interface MaimaiArcadeLegacyIdentifier {
    qq: number | null
    username: string | null
    friend_code: number | null
    credentials: string | Record<string, unknown> | null
}

interface BindTargetOption {
    id: MaimaiUpdateServer
    label: string
    icon: string
}

const bindTargetOptions: BindTargetOption[] = MAIMAI_UPDATE_BINDABLE_TARGETS.map(source => ({
    id: source.id,
    label: `绑定${source.name}账号`,
    icon: source.id === 'diving_fish' ? 'mdi:fish' : 'mdi:snowflake',
}))

const { storageOf, storageSave } = await useArtifact(props.artifactId)

const storage = storageOf('MaimaiCN')
const submitting = ref(false)
const submitError = ref<string | null>(null)
const rememberNotice = ref<string | null>(null)
const updateResult = ref<UpdatesChainResult | null>(null)
const updateTargetNames = ref<string[]>([])
const skippedLatestQr = ref(false)
const qrDialogOpen = ref(false)
const latestQrCredential = ref('')
const rememberUid = ref(false)
const bindDialogOpen = ref(false)
const bindCredential = ref('')
const activeBindOption = ref<BindTargetOption | null>(null)

const sanitizedStrategy = computed(() => sanitizeMaimaiUpdateStrategy(storage.value.update?.strategy))
const rememberedUidNode = computed(() => getMaimaiUpdateNode(storage.value.update?.strategy, 'sources', 'arcade_legacy'))
const hasRememberedUid = computed(() => !!rememberedUidNode.value?.credential)

function getStoredTargetCredential(server: MaimaiUpdateServer) {
    return sanitizedStrategy.value.targets.find(node => node.server === server)?.credential ?? ''
}

function isTargetBound(server: MaimaiUpdateServer) {
    return !!getStoredTargetCredential(server)
}

function openBindDialog(option: BindTargetOption) {
    activeBindOption.value = option
    bindCredential.value = getStoredTargetCredential(option.id) ?? ''
    bindDialogOpen.value = true
}

async function saveStrategy(strategy: ReturnType<typeof sanitizeMaimaiUpdateStrategy>, showSuccessToast = true) {
    await storageSave('MaimaiCN', {
        ...storage.value,
        update: {
            ...storage.value.update,
            strategy: strategy as NonNullable<MaimaiStorage['update']>['strategy'],
        },
    }, { showSuccessToast })
}

async function saveBindCredential() {
    if (!activeBindOption.value)
        return
    const option = activeBindOption.value
    const strategy = upsertMaimaiUpdateNode(storage.value.update?.strategy, 'targets', {
        server: option.id,
        credential: bindCredential.value.trim(),
        transient: false,
    })
    await saveStrategy(strategy)
    bindDialogOpen.value = false
    activeBindOption.value = null
    bindCredential.value = ''
}

async function removeTarget(server: MaimaiUpdateServer) {
    await saveStrategy(removeMaimaiUpdateNode(storage.value.update?.strategy, 'targets', server))
}

async function removeRememberedUid() {
    rememberNotice.value = null
    await saveStrategy(removeMaimaiUpdateNode(storage.value.update?.strategy, 'sources', 'arcade_legacy'))
}

function openQrDialog() {
    submitError.value = null
    rememberNotice.value = null
    latestQrCredential.value = ''
    rememberUid.value = false
    qrDialogOpen.value = true
}

async function fetchArcadeLegacyCredential(sgwcmaid: string) {
    const identifier = await useNuxtApp().$leporid<MaimaiArcadeLegacyIdentifier>('/api/otoge/maimai/arcade_legacy/identifiers', {
        query: { code: sgwcmaid },
        showErrorToast: false,
    } as any)
    return typeof identifier.credentials === 'string' && identifier.credentials.trim()
        ? identifier.credentials.trim()
        : null
}

async function rememberArcadeLegacyUid(sgwcmaid: string) {
    try {
        const credential = await fetchArcadeLegacyCredential(sgwcmaid)
        if (!credential) {
            rememberNotice.value = '更新已完成，但接口没有返回可保存的 UID。'
            return
        }
        const strategy = upsertMaimaiUpdateNode(storage.value.update?.strategy, 'sources', {
            server: 'arcade_legacy',
            credential,
            transient: false,
        })
        await saveStrategy(strategy, false)
        rememberNotice.value = '已记住 UID，之后可用于快速更新。'
    }
    catch (e: any) {
        rememberNotice.value = e?.data?.detail || e?.message || '更新已完成，但 UID 记住失败。'
    }
}

async function submitWithLatestQr() {
    await doSubmit(latestQrCredential.value.trim(), false)
}

async function submitWithoutLatestQr() {
    await doSubmit(null, true)
}

async function doSubmit(latestQr: string | null, skippedQr: boolean) {
    qrDialogOpen.value = false
    submitting.value = true
    submitError.value = null
    rememberNotice.value = null
    skippedLatestQr.value = skippedQr
    try {
        const payload = buildMaimaiUpdatePayload(storage.value.update?.strategy, props.artifactId, { latestQrCredential: latestQr })
        updateTargetNames.value = getMaimaiUpdateTargetNames(payload.target)
        const result = await useNuxtApp().$leporid<UpdatesChainResult>(
            `/api/artifacts/${props.artifactId}/maimai/updates/chain`,
            { method: 'POST', body: payload, showSuccessToast: false } as any,
        )
        updateResult.value = result
        if (latestQr && rememberUid.value)
            await rememberArcadeLegacyUid(latestQr)
        await props.onMaimaiUpdateComplete?.()
    }
    catch (e: any) {
        submitError.value = e?.data?.detail || e?.message || '更新失败，请稍后再试'
    }
    finally {
        submitting.value = false
    }
}

function resetResult() {
    updateResult.value = null
    submitError.value = null
    rememberNotice.value = null
    updateTargetNames.value = []
    skippedLatestQr.value = false
}
</script>

<template>
    <div class="p-4 space-y-4">
        <template v-if="!updateResult">
            <section class="space-y-3">
                <div>
                    <p class="font-medium text-sm">
                        数据来源
                    </p>
                    <p class="text-xs text-base-content/60">
                        将从这里获取舞萌成绩
                    </p>
                </div>
                <div class="grid gap-3 grid-cols-2">
                    <div class="rounded-lg border border-base-300 p-3">
                        <div class="flex items-start gap-3">
                            <Icon name="mdi:qrcode-scan" class="w-6 h-6 text-primary" />
                            <div>
                                <p class="text-sm font-medium">
                                    微信二维码
                                </p>
                                <p class="mt-1 text-xs text-base-content/60">
                                    更新时输入
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="rounded-lg border border-base-300 p-3">
                        <div class="flex items-start justify-between gap-3">
                            <div class="flex items-start gap-3">
                                <Icon name="mdi:account-key-outline" class="w-6 h-6" :class="hasRememberedUid ? 'text-success' : 'text-base-content/40'" />
                                <div>
                                    <p class="text-sm font-medium">
                                        记住的 UID
                                    </p>
                                    <p class="mt-1 text-xs" :class="hasRememberedUid ? 'text-success' : 'text-base-content/60'">
                                        {{ hasRememberedUid ? '已记住' : '尚未记住' }}
                                    </p>
                                </div>
                            </div>
                            <button v-if="hasRememberedUid" type="button" class="btn btn-ghost btn-xs text-error" @click="removeRememberedUid">
                                移除
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <section class="space-y-3">
                <div>
                    <p class="font-medium text-sm">
                        同步目标
                    </p>
                    <p class="text-xs text-base-content/60">
                        更新到兔卡和其他查分器
                    </p>
                </div>
                <div class="grid gap-3 md:grid-cols-2">
                    <div
                        v-for="option in bindTargetOptions"
                        :key="option.id"
                        class="rounded-lg border border-base-300 p-3"
                    >
                        <div class="flex items-start gap-3">
                            <Icon :name="option.icon" class="w-6 h-6 text-primary" />
                            <div>
                                <p class="text-sm font-medium">
                                    {{ getMaimaiUpdateSourceDef(option.id)?.name }}
                                </p>
                                <p class="mt-1 text-xs text-base-content/60">
                                    {{ isTargetBound(option.id) ? '已绑定' : '尚未绑定' }}
                                </p>
                            </div>
                            <button v-if="isTargetBound(option.id)" type="button" class="btn btn-ghost btn-xs text-error" @click="removeTarget(option.id)">
                                移除
                            </button>
                        </div>
                        <button type="button" class="btn btn-outline btn-sm w-full mt-3" @click="openBindDialog(option)">
                            {{ isTargetBound(option.id) ? '重新绑定' : option.label }}
                        </button>
                    </div>
                </div>
            </section>
        </template>

        <template v-if="updateResult">
            <div class="space-y-4">
                <div class="space-y-2">
                    <p class="text-xs font-semibold text-base-content/60 uppercase tracking-wide">
                        来源结果
                    </p>
                    <div class="grid gap-2">
                        <div
                            v-for="(entry, key) in updateResult.source"
                            :key="key"
                            class="rounded-lg px-3 py-2 border-2"
                            :class="maimaiUpdateChainLabelToColor(key as string)"
                        >
                            <p class="text-sm font-medium mb-1">
                                {{ maimaiUpdateChainLabelToName(key as string) }}
                            </p>
                            <p v-if="entry.errors" class="text-xs text-error">
                                {{ entry.errors }}
                            </p>
                            <template v-else>
                                <p class="text-xs text-base-content/70">
                                    曲目数：{{ entry.scores_num }}
                                </p>
                                <p class="text-xs text-base-content/70">
                                    Rating：{{ entry.scores_rating }}
                                </p>
                            </template>
                        </div>
                    </div>
                </div>
                <div class="space-y-2">
                    <p class="text-xs font-semibold text-base-content/60 uppercase tracking-wide">
                        目标结果
                    </p>
                    <div class="grid gap-2">
                        <div
                            v-for="(entry, key) in updateResult.target"
                            :key="key"
                            class="rounded-lg px-3 py-2 border-2"
                            :class="maimaiUpdateChainLabelToColor(key as string)"
                        >
                            <p class="text-sm font-medium mb-1">
                                {{ maimaiUpdateChainLabelToName(key as string) }}
                            </p>
                            <p v-if="entry.errors" class="text-xs text-error">
                                {{ entry.errors }}
                            </p>
                            <template v-else>
                                <p class="text-xs text-base-content/70">
                                    曲目数：{{ entry.scores_num }}
                                </p>
                                <p class="text-xs text-base-content/70">
                                    Rating：{{ entry.scores_rating }}
                                </p>
                            </template>
                        </div>
                    </div>
                </div>
                <button class="btn btn-outline" @click="resetResult">
                    重新开始
                </button>
            </div>
        </template>

        <div v-if="submitError" class="alert alert-error text-sm">
            <Icon name="mdi:alert-circle-outline" class="w-4 h-4" />
            <span>{{ submitError }}</span>
        </div>

        <div v-if="rememberNotice" class="alert text-sm" :class="rememberNotice.includes('已记住') ? 'alert-success' : 'alert-warning'">
            <Icon name="mdi:information-outline" class="w-4 h-4" />
            <span>{{ rememberNotice }}</span>
        </div>

        <div v-if="!updateResult" class="flex flex-wrap items-center justify-end gap-3 pb-3">
            <button class="btn btn-primary" :disabled="submitting" @click="openQrDialog">
                <span v-if="submitting" class="loading loading-spinner loading-sm" />
                更新查分器
            </button>
        </div>

        <Teleport to="body">
            <div v-if="bindDialogOpen && activeBindOption" class="fixed inset-0 z-80 bg-black/50 flex items-end sm:items-center justify-center">
                <div class="bg-base-100 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm p-5 space-y-4">
                    <h3 class="text-base font-semibold">
                        {{ activeBindOption.label }}
                    </h3>
                    <p class="text-sm text-base-content/60">
                        {{ getMaimaiUpdateSourceDef(activeBindOption.id)?.credentialLabel }}
                    </p>
                    <input v-model="bindCredential" type="text" class="input input-bordered w-full" :placeholder="getMaimaiUpdateSourceDef(activeBindOption.id)?.credentialLabel">
                    <div class="flex gap-2 justify-end">
                        <button class="btn btn-ghost" @click="bindDialogOpen = false">
                            取消
                        </button>
                        <button class="btn btn-primary" :disabled="!bindCredential.trim()" @click="saveBindCredential">
                            保存
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

        <Teleport to="body">
            <div v-if="qrDialogOpen" class="fixed inset-0 z-80 bg-black/50 flex items-end sm:items-center justify-center">
                <div class="bg-base-100 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm p-5 space-y-4">
                    <h3 class="text-base font-semibold">
                        输入 SGWCMAID
                    </h3>
                    <textarea v-model="latestQrCredential" class="textarea textarea-bordered w-full min-h-28" placeholder="微信二维码识别内容（SGWCMAID）" />
                    <label class="flex items-start gap-3 rounded-lg bg-base-200/60 p-3 text-sm">
                        <input v-model="rememberUid" type="checkbox" class="checkbox checkbox-primary checkbox-sm mt-0.5" :disabled="!latestQrCredential.trim()">
                        <span>
                            <span class="font-medium">记住 UID</span>
                            <span class="block text-xs text-base-content/60 mt-1">使用本次 SGWCMAID 获取旧版机台 UID 并保存，可以用于之后快速更新。</span>
                        </span>
                    </label>
                    <div class="flex flex-wrap gap-2 justify-end">
                        <button class="btn btn-ghost" @click="qrDialogOpen = false">
                            取消
                        </button>
                        <button class="btn btn-outline" :disabled="submitting" @click="submitWithoutLatestQr">
                            强制更新
                        </button>
                        <button class="btn btn-primary" :disabled="submitting || !latestQrCredential.trim()" @click="submitWithLatestQr">
                            正常更新
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>
