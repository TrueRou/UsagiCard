<script setup lang="ts">
import type { MaimaiUpdateNode, MaimaiUpdateServer } from '~/composables/function/MaimaiCN/useMaimaiUpdatePlan'
import type { MaimaiStorage } from '~/types/api'
import {
    getMaimaiUpdateSourceColor,
    getMaimaiUpdateSourceDef,
    MAIMAI_UPDATE_DATA_SOURCES,
    sanitizeMaimaiUpdateStrategy,
} from '~/composables/function/MaimaiCN/useMaimaiUpdatePlan'

interface PlacedItem {
    id: MaimaiUpdateServer
    chainLabel: string
    credential: string
    transient: boolean
    isNew: boolean
}

const props = defineProps<{
    artifactId: string
}>()

const { storageOf, storageSave } = await useArtifact(props.artifactId)

const storage = storageOf('MaimaiCN')
const sourceSources = ref<PlacedItem[]>([])
const targetSources = ref<PlacedItem[]>([])
const planDirty = ref(false)
const planSaving = ref(false)
let saveTimer: ReturnType<typeof setTimeout> | null = null

function toPlacedItem(node: MaimaiUpdateNode): PlacedItem | null {
    if (node.server === 'usagi_card')
        return null
    const def = getMaimaiUpdateSourceDef(node.server)
    return {
        id: node.server,
        chainLabel: def?.chainLabel ?? node.server,
        credential: node.credential ?? '',
        transient: node.transient ?? false,
        isNew: false,
    }
}

function loadPlan() {
    const plan = sanitizeMaimaiUpdateStrategy(storage.value.update?.strategy)
    sourceSources.value = plan.sources.map(toPlacedItem).filter(item => !!item)
    targetSources.value = plan.targets.map(toPlacedItem).filter(item => !!item)
}

onMounted(loadPlan)

async function savePlan() {
    planSaving.value = true
    const strategy = sanitizeMaimaiUpdateStrategy({
        sources: sourceSources.value.map(item => ({
            server: item.id,
            credential: item.transient ? null : item.credential,
            transient: item.transient,
        })),
        targets: targetSources.value.map(item => ({
            server: item.id,
            credential: item.transient ? null : item.credential,
            transient: item.transient,
        })),
    })
    try {
        await storageSave('MaimaiCN', { ...storage.value, update: { ...storage.value.update, strategy: strategy as NonNullable<MaimaiStorage['update']>['strategy'] } }, { showSuccessToast: false })
        planDirty.value = false
    }
    finally {
        planSaving.value = false
    }
}

function scheduleSavePlan() {
    planDirty.value = true
    if (saveTimer)
        clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
        void savePlan()
    }, 500)
}

onBeforeUnmount(() => {
    if (saveTimer)
        clearTimeout(saveTimer)
})

const placedIds = computed(() => {
    const ids = new Set<string>()
    sourceSources.value.forEach(item => ids.add(item.id))
    targetSources.value.forEach(item => ids.add(item.id))
    return ids
})

const visibleDataSources = computed(() => MAIMAI_UPDATE_DATA_SOURCES.filter(source => source.visibleInPicker || source.id === 'arcade' || source.id === 'arcade_legacy'))

function getSourceDef(id: string) {
    return getMaimaiUpdateSourceDef(id)!
}

function removeFromZone(zone: 'source' | 'target', id: string) {
    if (zone === 'source')
        sourceSources.value = sourceSources.value.filter(item => item.id !== id)
    else
        targetSources.value = targetSources.value.filter(item => item.id !== id)
    scheduleSavePlan()
}

const draggingId = ref<MaimaiUpdateServer | null>(null)
const dragOverZone = ref<string | null>(null)
let ghostEl: HTMLElement | null = null

function startDrag(e: PointerEvent, sourceId: MaimaiUpdateServer) {
    if (placedIds.value.has(sourceId))
        return
    e.preventDefault()
    draggingId.value = sourceId

    const def = getSourceDef(sourceId)
    ghostEl = document.createElement('div')
    ghostEl.style.cssText = [
        'position:fixed',
        'pointer-events:none',
        'z-index:9999',
        'opacity:0.9',
        'transform:translate(-50%,-50%)',
        'background:hsl(var(--b1))',
        'border:2px solid hsl(var(--p))',
        'border-radius:0.5rem',
        'padding:0.4rem 0.75rem',
        'font-size:0.875rem',
        'font-weight:500',
        'white-space:nowrap',
        'box-shadow:0 4px 16px rgba(0,0,0,0.2)',
    ].join(';')
    ghostEl.textContent = def.name
    ghostEl.style.left = `${e.clientX}px`
    ghostEl.style.top = `${e.clientY}px`
    document.body.appendChild(ghostEl)

    document.addEventListener('pointermove', onPointerMove)
    document.addEventListener('pointerup', onPointerUp)
}

function onPointerMove(e: PointerEvent) {
    if (!ghostEl || !draggingId.value)
        return
    ghostEl.style.left = `${e.clientX}px`
    ghostEl.style.top = `${e.clientY}px`
    const el = document.elementFromPoint(e.clientX, e.clientY)
    dragOverZone.value = (el?.closest('[data-dropzone]') as HTMLElement | null)?.dataset.dropzone ?? null
}

function onPointerUp(e: PointerEvent) {
    document.removeEventListener('pointermove', onPointerMove)
    document.removeEventListener('pointerup', onPointerUp)

    const id = draggingId.value
    draggingId.value = null
    dragOverZone.value = null

    if (ghostEl) {
        document.body.removeChild(ghostEl)
        ghostEl = null
    }
    if (!id)
        return

    const el = document.elementFromPoint(e.clientX, e.clientY)
    const zone = (el?.closest('[data-dropzone]') as HTMLElement | null)?.dataset.dropzone
    if (!zone || (zone !== 'source' && zone !== 'target'))
        return
    if (zone === 'target' && (id === 'arcade' || id === 'arcade_legacy'))
        return

    const def = getSourceDef(id)
    const item: PlacedItem = {
        id,
        chainLabel: def.chainLabel,
        credential: '',
        transient: def.isTransient,
        isNew: !def.isTransient,
    }

    if (zone === 'source')
        sourceSources.value = [...sourceSources.value, item]
    else
        targetSources.value = [...targetSources.value, item]
    scheduleSavePlan()
}

function isEncryptedCredential(item: PlacedItem) {
    return item.credential.startsWith('enc$')
}
</script>

<template>
    <div class="space-y-4">
        <div class="flex flex-wrap gap-2">
            <div
                v-for="src in visibleDataSources"
                :key="src.id"
                class="rounded-lg px-3 py-2 cursor-grab border-2 transition-all select-none text-center"
                :class="[
                    placedIds.has(src.id)
                        ? 'opacity-40 cursor-not-allowed border-base-300 bg-base-200'
                        : getMaimaiUpdateSourceColor(src.id),
                ]"
                :title="src.description"
                @pointerdown="(e) => startDrag(e, src.id)"
            >
                <span class="text-sm font-medium">{{ src.name }}</span>
                <span v-if="src.isTransient" class="ml-1 badge badge-xs badge-outline">时效性</span>
            </div>
        </div>

        <div class="grid gap-4">
            <div
                data-dropzone="source"
                class="rounded-xl border-2 border-dashed p-4 min-h-20 transition-colors"
                :class="dragOverZone === 'source' ? 'border-primary bg-primary/5' : 'border-base-300'"
            >
                <p class="text-xs font-semibold text-base-content/60 mb-3 uppercase tracking-wide">
                    数据来源
                </p>
                <div v-if="sourceSources.length === 0" class="flex flex-col items-center py-3 text-base-content/30">
                    <Icon name="mdi:arrow-down" class="w-5 h-5 animate-bounce" />
                    <span class="text-xs mt-1">拖入数据来源</span>
                </div>
                <div class="space-y-3">
                    <div
                        v-for="item in sourceSources"
                        :key="item.id"
                        class="rounded-lg px-3 py-2 space-y-2 border-2"
                        :class="getMaimaiUpdateSourceColor(item.id)"
                    >
                        <div class="flex items-center justify-between">
                            <span class="text-sm font-medium">{{ getSourceDef(item.id).name }}</span>
                            <div class="flex items-center gap-1">
                                <span v-if="item.transient" class="badge badge-xs badge-warning">每次输入</span>
                                <button class="btn btn-ghost btn-sm btn-circle text-error" type="button" @click="removeFromZone('source', item.id)">
                                    <Icon name="mdi:close" class="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <input
                            v-if="!item.transient"
                            v-model="item.credential"
                            type="text"
                            class="input input-bordered w-full"
                            :class="isEncryptedCredential(item) ? 'bg-base-200 text-base-content/60' : ''"
                            :placeholder="getSourceDef(item.id).credentialLabel"
                            :readonly="isEncryptedCredential(item)"
                            @input="scheduleSavePlan"
                        >
                        <p v-if="isEncryptedCredential(item)" class="text-xs text-base-content/50">
                            凭据已加密保存，需要修改时请先移除后重新添加。
                        </p>
                    </div>
                </div>
            </div>

            <div
                data-dropzone="target"
                class="rounded-xl border-2 border-dashed p-4 min-h-20 transition-colors"
                :class="dragOverZone === 'target' ? 'border-primary bg-primary/5' : 'border-base-300'"
            >
                <p class="text-xs font-semibold text-base-content/60 mb-3 uppercase tracking-wide">
                    同步目标
                </p>
                <div class="space-y-3">
                    <div
                        class="rounded-lg px-3 py-2 space-y-2 border-2"
                        :class="getMaimaiUpdateSourceColor('usagi_card')"
                    >
                        <div class="flex items-center justify-between">
                            <span class="text-sm font-medium">兔卡</span>
                            <span class="badge badge-xs badge-secondary">默认目标</span>
                        </div>
                        <p class="text-xs text-base-content/60">
                            当前卡片会始终作为同步目标，不能从计划中移除。
                        </p>
                    </div>
                    <div v-if="targetSources.length === 0" class="flex flex-col items-center py-3 text-base-content/30">
                        <Icon name="mdi:arrow-down" class="w-5 h-5 animate-bounce" />
                        <span class="text-xs mt-1">可继续拖入额外更新目标</span>
                    </div>
                    <div
                        v-for="item in targetSources"
                        :key="item.id"
                        class="rounded-lg px-3 py-2 space-y-2 border-2"
                        :class="getMaimaiUpdateSourceColor(item.id)"
                    >
                        <div class="flex items-center justify-between">
                            <span class="text-sm font-medium">{{ getSourceDef(item.id).name }}</span>
                            <div class="flex items-center gap-1">
                                <span v-if="item.transient" class="badge badge-xs badge-warning">每次输入</span>
                                <button class="btn btn-ghost btn-sm btn-circle text-error" type="button" @click="removeFromZone('target', item.id)">
                                    <Icon name="mdi:close" class="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <input
                            v-if="!item.transient"
                            v-model="item.credential"
                            type="text"
                            class="input input-bordered w-full"
                            :class="isEncryptedCredential(item) ? 'bg-base-200 text-base-content/60' : ''"
                            :placeholder="getSourceDef(item.id).credentialLabel"
                            :readonly="isEncryptedCredential(item)"
                            @input="scheduleSavePlan"
                        >
                        <p v-if="isEncryptedCredential(item)" class="text-xs text-base-content/50">
                            凭据已加密保存，需要修改时请先移除后重新添加。
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex justify-end text-xs text-base-content/50">
            <span v-if="planSaving" class="inline-flex items-center gap-2">
                <span class="loading loading-spinner loading-xs" />
                正在保存
            </span>
            <span v-else-if="planDirty">等待自动保存</span>
            <span v-else>已自动保存</span>
        </div>
    </div>
</template>
