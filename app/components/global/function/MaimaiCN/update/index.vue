<script setup lang="ts">
const props = defineProps<{
    artifact: ArtifactUserResponse
    fromDialog?: boolean
}>()

const router = useRouter()

function goToPrefs() {
    router.push({ path: `/artifacts/${props.artifact.id}/functions`, query: { tab: 'maicn-pref' } })
}

// ─── Data source definitions ───────────────────────────────────────────────────
interface DataSourceDef {
    id: string
    name: string
    description: string
    credentialLabel: string
    chainLabel: string
}

const SOURCE_COLORS: Record<string, string> = {
    arcade: 'border-primary bg-primary/10 hover:bg-primary/20',
    usagicard: 'border-secondary bg-secondary/10 hover:bg-secondary/20',
    diving_fish: 'border-accent bg-accent/10 hover:bg-accent/20',
    lxns: 'border-warning bg-warning/10 hover:bg-warning/20',
}

const DATA_SOURCES: DataSourceDef[] = [
    {
        id: 'arcade',
        chainLabel: 'arcade',
        name: '机台',
        description: '通过机台账号直接同步成绩',
        credentialLabel: '微信二维码识别内容',
    },
    {
        id: 'usagicard',
        chainLabel: 'usagicard',
        name: '兔卡',
        description: '通过绑定的兔卡账户同步成绩',
        credentialLabel: '留空视为当前卡片',
    },
    {
        id: 'diving_fish',
        chainLabel: 'divingfish',
        name: '水鱼',
        description: 'DivingFish - 舞萌 DX 查分器',
        credentialLabel: 'Import-Token',
    },
    {
        id: 'lxns',
        chainLabel: 'lxns',
        name: '落雪',
        description: '落雪咖啡屋 - maimai DX 查分器',
        credentialLabel: '个人 API 密钥',
    },
]

interface PlacedItem {
    id: string
    chainLabel: string
    credential: string
    isNew: boolean
}

interface UpdatesChainEntryResult {
    errors: string | null
    scores_num: number
    scores_rating: number
}

interface UpdatesChainResult {
    source: Record<string, UpdatesChainEntryResult>
    target: Record<string, UpdatesChainEntryResult>
}

const STORAGE_KEY = `maimai_update_rule_${props.artifact.id}`

// ─── State ─────────────────────────────────────────────────────────────────────
const storage = ref<MaimaiStorage>({
    rem_accounts: [],
    updating_behavior: 'adhoc',
    ...props.artifact.storage,
})

const mode = computed(() => storage.value.updating_behavior)
const sourceSources = ref<PlacedItem[]>([])
const targetSources = ref<PlacedItem[]>([])
const aggregateSources = ref<PlacedItem[]>([])
const rememberLayout = ref(false)
const savedLayoutLoaded = ref(false)
const submitting = ref(false)
const submitError = ref<string | null>(null)
const updateResult = ref<UpdatesChainResult | null>(null)

// ─── Derived ───────────────────────────────────────────────────────────────────
const placedIds = computed(() => {
    const ids = new Set<string>()
    if (mode.value === 'adhoc') {
        sourceSources.value.forEach(i => ids.add(i.id))
        targetSources.value.forEach(i => ids.add(i.id))
    }
    else {
        aggregateSources.value.forEach(i => ids.add(i.id))
    }
    return ids
})

function getSourceDef(id: string): DataSourceDef {
    return DATA_SOURCES.find(s => s.id === id)!
}

function getSourceColor(id: string): string {
    return SOURCE_COLORS[id] || 'border-base-300 bg-base-200 hover:bg-base-300'
}

function chainLabelToName(chainLabel: string): string {
    return DATA_SOURCES.find(s => s.chainLabel === chainLabel)?.name ?? chainLabel
}

function chainLabelToColor(chainLabel: string): string {
    const id = DATA_SOURCES.find(s => s.chainLabel === chainLabel)?.id ?? ''
    return getSourceColor(id)
}

// ─── Remembered accounts helpers ──────────────────────────────────────────────
const SUPPORTS_REM_ACCOUNTS = ['diving_fish', 'lxns']

function getRemAccounts(sourceId: string) {
    return (storage.value.rem_accounts ?? []).filter(a => a.server === sourceId)
}

function initItemCredential(item: PlacedItem) {
    if (!SUPPORTS_REM_ACCOUNTS.includes(item.id))
        return
    const saved = getRemAccounts(item.id)
    if (saved.length > 0 && saved[0]) {
        item.isNew = false
        item.credential = saved[0].credential
    }
}

function onSelectAccount(item: PlacedItem, value: string) {
    if (value === '__new__') {
        item.isNew = true
        item.credential = ''
    }
    else {
        item.isNew = false
        item.credential = value
    }
}

function onSelectCardOption(item: PlacedItem, value: string) {
    if (value === '__new__') {
        item.isNew = true
        item.credential = ''
    }
    else {
        item.isNew = false
        item.credential = props.artifact.id
    }
}

// ─── Zone operations ───────────────────────────────────────────────────────────
function removeFromZone(zone: 'source' | 'target' | 'aggregate', id: string) {
    if (zone === 'source')
        sourceSources.value = sourceSources.value.filter(i => i.id !== id)
    else if (zone === 'target')
        targetSources.value = targetSources.value.filter(i => i.id !== id)
    else aggregateSources.value = aggregateSources.value.filter(i => i.id !== id)
}

// ─── Drag and Drop (Pointer Events, works on mouse + touch) ────────────────────
const draggingId = ref<string | null>(null)
const dragOverZone = ref<string | null>(null)
let ghostEl: HTMLElement | null = null

function startDrag(e: PointerEvent, sourceId: string) {
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
    if (!zone)
        return

    const item: PlacedItem = {
        id,
        chainLabel: getSourceDef(id).chainLabel,
        credential: id === 'usagicard' ? props.artifact.id : '',
        isNew: id !== 'usagicard',
    }
    initItemCredential(item)
    if (zone === 'source')
        sourceSources.value = [...sourceSources.value, item]
    else if (zone === 'target')
        targetSources.value = [...targetSources.value, item]
    else if (zone === 'aggregate')
        aggregateSources.value = [...aggregateSources.value, item]
}

// ─── localStorage persistence ──────────────────────────────────────────────────
function loadSavedLayout() {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw)
        return
    try {
        const saved = JSON.parse(raw)
        if (saved.mode === 'adhoc') {
            sourceSources.value = (saved.sourceIds ?? []).map((sid: string) => {
                const item: PlacedItem = { id: sid, chainLabel: getSourceDef(sid).chainLabel, credential: sid === 'usagicard' ? props.artifact.id : '', isNew: sid !== 'usagicard' }
                initItemCredential(item)
                return item
            })
            targetSources.value = (saved.targetIds ?? []).map((sid: string) => {
                const item: PlacedItem = { id: sid, chainLabel: getSourceDef(sid).chainLabel, credential: sid === 'usagicard' ? props.artifact.id : '', isNew: sid !== 'usagicard' }
                initItemCredential(item)
                return item
            })
        }
        else {
            aggregateSources.value = (saved.aggregateIds ?? []).map((sid: string) => {
                const item: PlacedItem = { id: sid, chainLabel: getSourceDef(sid).chainLabel, credential: sid === 'usagicard' ? props.artifact.id : '', isNew: sid !== 'usagicard' }
                initItemCredential(item)
                return item
            })
        }
        savedLayoutLoaded.value = true
        rememberLayout.value = true
    }
    catch {}
}

function saveLayout() {
    if (mode.value === 'adhoc') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            mode: 'adhoc',
            sourceIds: sourceSources.value.map(i => i.id),
            targetIds: targetSources.value.map(i => i.id),
        }))
    }
    else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            mode: 'aggregate',
            aggregateIds: aggregateSources.value.map(i => i.id),
        }))
    }
}

function clearSavedLayout() {
    localStorage.removeItem(STORAGE_KEY)
    savedLayoutLoaded.value = false
    rememberLayout.value = false
    updateResult.value = null
    submitError.value = null
    sourceSources.value = []
    targetSources.value = []
    aggregateSources.value = []
}

onMounted(loadSavedLayout)

// ─── Rule building and submit ──────────────────────────────────────────────────
function buildRule() {
    if (mode.value === 'adhoc') {
        const source: Record<string, { credentials: string }> = {}
        const target: Record<string, { credentials: string }> = {}
        sourceSources.value.forEach((i) => {
            source[i.chainLabel] = { credentials: i.credential }
        })
        targetSources.value.forEach((i) => {
            target[i.chainLabel] = { credentials: i.credential }
        })
        return { source, target }
    }
    else {
        const dict: Record<string, { credentials: string }> = {}
        aggregateSources.value.forEach((i) => {
            dict[i.chainLabel] = { credentials: i.credential }
        })
        return { source: dict, target: dict }
    }
}

function validate(): string | null {
    if (mode.value === 'adhoc') {
        if (sourceSources.value.length === 0)
            return '请至少添加一个数据来源'
        if (targetSources.value.length === 0)
            return '请至少添加一个同步目标'
        if (sourceSources.value.some(i => !i.credential.trim()))
            return '请填写所有数据来源的凭据'
        if (targetSources.value.some(i => !i.credential.trim()))
            return '请填写所有同步目标的凭据'
    }
    else {
        if (aggregateSources.value.length === 0)
            return '请至少添加一个同步节点'
        if (aggregateSources.value.some(i => !i.credential.trim()))
            return '请填写所有节点的凭据'
    }
    return null
}

async function submit() {
    submitError.value = null
    updateResult.value = null
    const err = validate()
    if (err) {
        submitError.value = err
        return
    }
    submitting.value = true
    try {
        const rule = buildRule()
        const res = await useNuxtApp().$leporid<UpdatesChainResult>(`/api/otoge/maimai/updates_chain`, {
            method: 'POST',
            body: rule,
        })
        updateResult.value = res
        if (rememberLayout.value)
            saveLayout()
        sourceSources.value = []
        targetSources.value = []
        aggregateSources.value = []
    }
    catch (e: any) {
        submitError.value = e?.message ?? '提交失败，请重试'
    }
    finally {
        submitting.value = false
    }
}
</script>

<template>
    <div class="w-full space-y-2">
        <!-- 已加载布局提示 -->
        <div v-if="savedLayoutLoaded && !updateResult" role="alert" class="alert alert-success">
            <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <span class="text-sm">已加载上次保存的布局</span>
            <button class="btn btn-primary btn-xs" @click="clearSavedLayout">
                清除布局
            </button>
        </div>

        <!-- 数据源调色盘 -->
        <div>
            <p class="flex justify-between items-center text-sm font-medium mb-2">
                <span>数据源<b class="text-xs text-base-content/50 font-normal">（拖拽到下方区域）</b></span>
                <button v-if="fromDialog" class="text-xs text-primary underline mt-1 text-left w-fit cursor-pointer" type="button" @click="goToPrefs">
                    前往账号设置 →
                </button>
            </p>
            <div class="grid grid-cols-4 gap-3">
                <div
                    v-for="src in DATA_SOURCES"
                    :key="src.id"
                    class="flex flex-col items-center justify-center gap-1 rounded-xl border-2 p-3 min-h-16 select-none transition-all touch-none text-center"
                    :class="[
                        placedIds.has(src.id)
                            ? 'opacity-30 cursor-not-allowed'
                            : `cursor-grab active:cursor-grabbing ${getSourceColor(src.id)}`,
                    ]"
                    @pointerdown="(e) => startDrag(e, src.id)"
                >
                    <span class="text-sm font-semibold">{{ src.name }}</span>
                    <!-- <span class="text-xs text-base-content/50">{{ src.credentialLabel }}</span> -->
                </div>
            </div>
        </div>

        <!-- adhoc / aggregate Drop Zone -->
        <template v-if="!updateResult">
            <div v-if="mode === 'adhoc'" class="grid gap-4">
                <div
                    data-dropzone="source"
                    class="rounded-xl border-2 border-dashed p-4 min-h-20 transition-colors"
                    :class="dragOverZone === 'source' ? 'border-primary bg-primary/5' : 'border-base-300'"
                >
                    <p class="text-xs font-semibold text-base-content/60 mb-3 uppercase tracking-wide">
                        数据来源
                    </p>
                    <div class="space-y-3">
                        <div
                            v-for="item in sourceSources"
                            :key="item.id"
                            class="rounded-lg px-3 py-2 space-y-2 border-2"
                            :class="getSourceColor(item.id)"
                        >
                            <div class="flex items-center justify-between">
                                <span class="text-sm font-medium">{{ getSourceDef(item.id).name }}</span>
                                <button
                                    class="btn btn-ghost btn-xs btn-circle text-error"
                                    type="button"
                                    @click="removeFromZone('source', item.id)"
                                >
                                    <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <template v-if="SUPPORTS_REM_ACCOUNTS.includes(item.id)">
                                <select
                                    class="select select-bordered select-sm w-full"
                                    :value="item.isNew ? '__new__' : item.credential"
                                    @change="(e) => onSelectAccount(item, (e.target as HTMLSelectElement).value)"
                                >
                                    <option value="__new__">
                                        ＋ 输入新账号
                                    </option>
                                    <option v-for="acc in getRemAccounts(item.id)" :key="acc.credential" :value="acc.credential">
                                        {{ acc.label }}
                                    </option>
                                </select>
                                <input
                                    v-if="item.isNew"
                                    v-model="item.credential"
                                    class="input input-bordered input-sm w-full"
                                    type="text"
                                    :placeholder="getSourceDef(item.id).credentialLabel"
                                >
                            </template>
                            <template v-else-if="item.id === 'usagicard'">
                                <select
                                    class="select select-bordered select-sm w-full"
                                    :value="item.isNew ? '__new__' : '__current__'"
                                    @change="(e) => onSelectCardOption(item, (e.target as HTMLSelectElement).value)"
                                >
                                    <option value="__current__">
                                        当前卡片
                                    </option>
                                    <option value="__new__">
                                        其他卡片（输入 UUID）
                                    </option>
                                </select>
                                <input
                                    v-if="item.isNew"
                                    v-model="item.credential"
                                    class="input input-bordered input-sm w-full"
                                    type="text"
                                    placeholder="卡片 UUID"
                                >
                            </template>
                            <template v-else>
                                <input
                                    v-model="item.credential"
                                    class="input input-bordered input-sm w-full"
                                    type="text"
                                    :placeholder="getSourceDef(item.id).credentialLabel"
                                >
                            </template>
                        </div>
                        <p v-if="sourceSources.length === 0" class="text-xs text-base-content/40 text-center py-4">
                            将数据源拖到这里
                        </p>
                    </div>
                </div>

                <div
                    data-dropzone="target"
                    class="rounded-xl border-2 border-dashed p-4 min-h-20 transition-colors"
                    :class="dragOverZone === 'target' ? 'border-primary bg-primary/5' : 'border-base-300'"
                >
                    <p class="text-xs font-semibold text-base-content/60 mb-3 uppercase tracking-wide">
                        更新目标
                    </p>
                    <div class="space-y-3">
                        <div
                            v-for="item in targetSources"
                            :key="item.id"
                            class="rounded-lg px-3 py-2 space-y-2 border-2"
                            :class="getSourceColor(item.id)"
                        >
                            <div class="flex items-center justify-between">
                                <span class="text-sm font-medium">{{ getSourceDef(item.id).name }}</span>
                                <button
                                    class="btn btn-ghost btn-xs btn-circle text-error"
                                    type="button"
                                    @click="removeFromZone('target', item.id)"
                                >
                                    <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <template v-if="SUPPORTS_REM_ACCOUNTS.includes(item.id)">
                                <select
                                    class="select select-bordered select-sm w-full"
                                    :value="item.isNew ? '__new__' : item.credential"
                                    @change="(e) => onSelectAccount(item, (e.target as HTMLSelectElement).value)"
                                >
                                    <option value="__new__">
                                        ＋ 输入新账号
                                    </option>
                                    <option v-for="acc in getRemAccounts(item.id)" :key="acc.credential" :value="acc.credential">
                                        {{ acc.label }}
                                    </option>
                                </select>
                                <input
                                    v-if="item.isNew"
                                    v-model="item.credential"
                                    class="input input-bordered input-sm w-full"
                                    type="text"
                                    :placeholder="getSourceDef(item.id).credentialLabel"
                                >
                            </template>
                            <template v-else-if="item.id === 'usagicard'">
                                <select
                                    class="select select-bordered select-sm w-full"
                                    :value="item.isNew ? '__new__' : '__current__'"
                                    @change="(e) => onSelectCardOption(item, (e.target as HTMLSelectElement).value)"
                                >
                                    <option value="__current__">
                                        当前卡片
                                    </option>
                                    <option value="__new__">
                                        其他卡片（输入 UUID）
                                    </option>
                                </select>
                                <input
                                    v-if="item.isNew"
                                    v-model="item.credential"
                                    class="input input-bordered input-sm w-full"
                                    type="text"
                                    placeholder="卡片 UUID"
                                >
                            </template>
                            <template v-else>
                                <input
                                    v-model="item.credential"
                                    class="input input-bordered input-sm w-full"
                                    type="text"
                                    :placeholder="getSourceDef(item.id).credentialLabel"
                                >
                            </template>
                        </div>
                        <p v-if="targetSources.length === 0" class="text-xs text-base-content/40 text-center py-4">
                            将数据源拖到这里
                        </p>
                    </div>
                </div>
            </div>

            <!-- aggregate: 单个 Drop Zone -->
            <div v-else>
                <div
                    data-dropzone="aggregate"
                    class="rounded-xl border-2 border-dashed p-4 min-h-52 transition-colors"
                    :class="dragOverZone === 'aggregate' ? 'border-primary bg-primary/5' : 'border-base-300'"
                >
                    <p class="text-xs font-semibold text-base-content/60 mb-3 uppercase tracking-wide">
                        同步节点（从所有数据源获取，再更新到所有数据源）
                    </p>
                    <div class="flex flex-wrap gap-3">
                        <div
                            v-for="item in aggregateSources"
                            :key="item.id"
                            class="rounded-lg px-3 py-2 space-y-2 w-full border-2"
                            :class="getSourceColor(item.id)"
                        >
                            <div class="flex items-center justify-between">
                                <span class="text-sm font-medium">{{ getSourceDef(item.id).name }}</span>
                                <button
                                    class="btn btn-ghost btn-xs btn-circle text-error"
                                    type="button"
                                    @click="removeFromZone('aggregate', item.id)"
                                >
                                    <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <template v-if="SUPPORTS_REM_ACCOUNTS.includes(item.id)">
                                <select
                                    class="select select-bordered select-sm w-full"
                                    :value="item.isNew ? '__new__' : item.credential"
                                    @change="(e) => onSelectAccount(item, (e.target as HTMLSelectElement).value)"
                                >
                                    <option value="__new__">
                                        ＋ 输入新账号
                                    </option>
                                    <option v-for="acc in getRemAccounts(item.id)" :key="acc.credential" :value="acc.credential">
                                        {{ acc.label }}
                                    </option>
                                </select>
                                <input
                                    v-if="item.isNew"
                                    v-model="item.credential"
                                    class="input input-bordered input-sm w-full"
                                    type="text"
                                    :placeholder="getSourceDef(item.id).credentialLabel"
                                >
                            </template>
                            <template v-else-if="item.id === 'usagicard'">
                                <select
                                    class="select select-bordered select-sm w-full"
                                    :value="item.isNew ? '__new__' : '__current__'"
                                    @change="(e) => onSelectCardOption(item, (e.target as HTMLSelectElement).value)"
                                >
                                    <option value="__current__">
                                        当前卡片
                                    </option>
                                    <option value="__new__">
                                        其他卡片（输入 UUID）
                                    </option>
                                </select>
                                <input
                                    v-if="item.isNew"
                                    v-model="item.credential"
                                    class="input input-bordered input-sm w-full"
                                    type="text"
                                    placeholder="卡片 UUID"
                                >
                            </template>
                            <template v-else>
                                <input
                                    v-model="item.credential"
                                    class="input input-bordered input-sm w-full"
                                    type="text"
                                    :placeholder="getSourceDef(item.id).credentialLabel"
                                >
                            </template>
                        </div>
                        <p v-if="aggregateSources.length === 0" class="text-xs text-base-content/40 text-center py-4 w-full">
                            将数据源拖到这里
                        </p>
                    </div>
                </div>
            </div>
        </template>

        <!-- 校验错误提示 -->
        <div v-if="submitError" role="alert" class="alert alert-error">
            <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-sm">{{ submitError }}</span>
        </div>

        <!-- 更新结果 -->
        <div v-if="updateResult" class="rounded-xl border border-base-300 bg-base-200/50 p-4 space-y-3">
            <p class="text-sm font-semibold">
                更新结果
            </p>
            <template v-if="mode === 'aggregate'">
                <div class="space-y-2">
                    <div
                        v-for="(entry, key) in updateResult.source"
                        :key="key"
                        class="rounded-lg px-3 py-2 border-2"
                        :class="chainLabelToColor(key)"
                    >
                        <p class="text-sm font-medium mb-1">
                            {{ chainLabelToName(key) }}
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
            </template>
            <template v-else>
                <div class="grid grid-cols-2 gap-3">
                    <div class="space-y-2">
                        <p class="text-xs font-semibold text-base-content/50 uppercase tracking-wide">
                            来源
                        </p>
                        <div
                            v-for="(entry, key) in updateResult.source"
                            :key="key"
                            class="rounded-lg px-3 py-2 border-2"
                            :class="chainLabelToColor(key)"
                        >
                            <p class="text-sm font-medium mb-1">
                                {{ chainLabelToName(key) }}
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
                    <div class="space-y-2">
                        <p class="text-xs font-semibold text-base-content/50 uppercase tracking-wide">
                            目标
                        </p>
                        <div
                            v-for="(entry, key) in updateResult.target"
                            :key="key"
                            class="rounded-lg px-3 py-2 border-2"
                            :class="chainLabelToColor(key)"
                        >
                            <p class="text-sm font-medium mb-1">
                                {{ chainLabelToName(key) }}
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
            </template>
        </div>

        <!-- 底部操作 -->
        <div class="flex flex-wrap items-center justify-between gap-3 pb-3">
            <div v-if="!updateResult" class="flex items-center gap-3">
                <label class="flex items-center gap-2 cursor-pointer select-none">
                    <input v-model="rememberLayout" class="checkbox checkbox-sm checkbox-primary" type="checkbox">
                    <span class="text-sm">记住本次布局</span>
                </label>
            </div>
            <button v-if="!updateResult" class="btn btn-primary" :disabled="submitting" @click="submit">
                <span v-if="submitting" class="loading loading-spinner loading-sm" />
                执行更新
            </button>
        </div>
    </div>
</template>
