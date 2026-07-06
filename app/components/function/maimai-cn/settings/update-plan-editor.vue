<script setup lang="ts">
import type { MaimaiUpdateNode, MaimaiUpdateServer } from '~/composables/function/MaimaiCN/useMaimaiUpdatePlan'
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

const { artifact, storageOf, storageSave } = await useArtifact(props.artifactId)

const storage = storageOf('MaimaiCN')
const sourceSources = ref<PlacedItem[]>([])
const targetSources = ref<PlacedItem[]>([])
const planDirty = ref(false)

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
    await storageSave('MaimaiCN', { ...storage.value, update: { ...storage.value.update, strategy: strategy as NonNullable<MaimaiStorage['update']>['strategy'] } })
    planDirty.value = false
}

const placedIds = computed(() => {
    const ids = new Set<string>()
    sourceSources.value.forEach(item => ids.add(item.id))
    targetSources.value.forEach(item => ids.add(item.id))
    return ids
})

const visibleDataSources = computed(() => MAIMAI_UPDATE_DATA_SOURCES.filter(source => source.id !== 'usagi_card'))

function getSourceDef(id: string) {
    return getMaimaiUpdateSourceDef(id)!
}

function removeFromZone(zone: 'source' | 'target', id: string) {
    if (zone === 'source')
        sourceSources.value = sourceSources.value.filter(item => item.id !== id)
    else
        targetSources.value = targetSources.value.filter(item => item.id !== id)
    planDirty.value = true
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

    const def = getSourceDef(id)
    const item: PlacedItem = {
        id,
        chainLabel: def.chainLabel,
        credential: id === 'usagi_card' ? artifact.value.id : '',
        transient: def.isTransient,
        isNew: id !== 'usagi_card' && !def.isTransient,
    }

    if (zone === 'source')
        sourceSources.value = [...sourceSources.value, item]
    else
        targetSources.value = [...targetSources.value, item]
    planDirty.value = true
}

function isEncryptedCredential(item: PlacedItem) {
    return item.credential.startsWith('enc$')
}
</script>

<template>
    <div class="space-y-4">
        <section class="rounded-lg border border-base-300 bg-base-100 px-4 py-3 space-y-3">
            <div class="flex items-start gap-3">
                <div class="mt-0.5 rounded-full bg-base-200 p-2">
                    <Icon name="mdi:tune-variant" class="w-5 h-5 text-base-content/60" />
                </div>
                <div class="min-w-0 flex-1">
                    <h3 class="text-base font-semibold">
                        更新计划
                    </h3>
                    <p class="mt-1 text-sm text-base-content/65">
                        更新计划会作为执行前的最终参考。兔卡目标由系统默认添加，不会显示在计划中。
                    </p>
                </div>
            </div>
        </section>

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
                            @input="planDirty = true"
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
                <div v-if="targetSources.length === 0" class="flex flex-col items-center py-3 text-base-content/30">
                    <Icon name="mdi:arrow-down" class="w-5 h-5 animate-bounce" />
                    <span class="text-xs mt-1">拖入更新目标</span>
                </div>
                <div class="space-y-3">
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
                            @input="planDirty = true"
                        >
                        <p v-if="isEncryptedCredential(item)" class="text-xs text-base-content/50">
                            凭据已加密保存，需要修改时请先移除后重新添加。
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex justify-end">
            <button class="btn btn-primary" :disabled="!planDirty" @click="savePlan">
                保存更新计划
            </button>
        </div>
    </div>
</template>
