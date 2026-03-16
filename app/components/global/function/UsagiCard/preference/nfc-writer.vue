<script setup lang="ts">
interface NdefRecord {
    recordType: string
    data?: string | BufferSource
}

interface NdefMessage {
    records: NdefRecord[]
}

interface NdefReadingEvent {
    message: NdefMessage
}

interface NdefReaderLike {
    scan: () => Promise<void>
    write: (message: NdefMessage) => Promise<void>
    onreading: ((event: NdefReadingEvent) => void) | null
    onreadingerror: (() => void) | null
}

const props = defineProps<{
    show: boolean
    artifactId: string
}>()

const emit = defineEmits<{
    (e: 'close'): void
    (e: 'success', targetUrl: string): void
}>()

const runtimeConfig = useRuntimeConfig()
const notificationStore = useNotificationsStore()

const isReading = ref(false)
const isWriting = ref(false)
const scanStep = ref<1 | 2 | 3 | 4>(1)
const selectedMode = ref<'fast' | 'normal'>('fast')
const targetUrl = computed(() => {
    const base = runtimeConfig.public.URL.replace(/\/$/, '')
    return `${base}/artifacts/${props.artifactId}`
})

function isSupported() {
    if (!import.meta.client) {
        return false
    }
    return 'NDEFReader' in window
}

function createReader() {
    if (!isSupported()) {
        notificationStore.addNotification({
            type: 'warning',
            message: '当前设备或浏览器不支持 Web NFC，请使用支持 Web NFC 的浏览器重试。',
        })
        return null
    }

    const Ctor = (window as Window & { NDEFReader?: new () => NdefReaderLike }).NDEFReader
    if (!Ctor) {
        notificationStore.addNotification({
            type: 'warning',
            message: '当前环境未检测到 NFC 读写能力。',
        })
        return null
    }

    return new Ctor()
}

function parseUrlFromRecordData(data: NdefRecord['data']) {
    if (!data) {
        return null
    }
    if (typeof data === 'string') {
        return data
    }

    const buffer = data instanceof DataView ? data.buffer : data
    return new TextDecoder().decode(buffer)
}

async function readCard() {
    if (isReading.value) {
        return
    }

    const ndef = createReader()
    if (!ndef) {
        return
    }

    isReading.value = true
    scanStep.value = 2

    try {
        await ndef.scan()
        await new Promise<void>((resolve) => {
            ndef.onreadingerror = () => {
                notificationStore.addNotification({
                    type: 'error',
                    message: '读取失败，请重试。',
                })
                scanStep.value = 1
                resolve()
            }
            ndef.onreading = (event) => {
                const firstRecord = event.message.records[0]
                if (!firstRecord || firstRecord.recordType !== 'url') {
                    notificationStore.addNotification({
                        type: 'error',
                        message: '该 NFC 卡片中未找到可用链接。',
                    })
                    scanStep.value = 1
                    resolve()
                    return
                }

                const sourceUrl = parseUrlFromRecordData(firstRecord.data)
                if (!sourceUrl) {
                    notificationStore.addNotification({
                        type: 'error',
                        message: '读取到的链接无效，请重试。',
                    })
                    scanStep.value = 1
                    resolve()
                    return
                }

                scanStep.value = 3
                resolve()
            }
        })
    }
    catch (error) {
        notificationStore.addNotification({
            type: 'error',
            message: error instanceof Error ? error.message : '读取失败，请重试。',
        })
        scanStep.value = 1
    }
    finally {
        isReading.value = false
    }
}

async function writeCard() {
    if (isWriting.value) {
        return
    }

    const ndef = createReader()
    if (!ndef) {
        return
    }

    isWriting.value = true
    scanStep.value = 4

    const recordsByMode: Record<'fast' | 'normal', NdefRecord[]> = {
        normal: [
            {
                recordType: 'url',
                data: targetUrl.value,
            },
        ],
        fast: [
            {
                recordType: 'url',
                data: targetUrl.value,
            },
            {
                recordType: 'android.com:pkg',
                data: new TextEncoder().encode('alook.browser'),
            },
            {
                recordType: 'android.com:pkg',
                data: new TextEncoder().encode('com.android.chrome'),
            },
            {
                recordType: 'android.com:pkg',
                data: new TextEncoder().encode('com.microsoft.emmx'),
            },
        ],
    }

    try {
        notificationStore.addNotification({
            type: 'info',
            message: '请将 NFC 卡片贴近设备背部，保持不动直到写入完成。',
        })
        await ndef.write({ records: recordsByMode[selectedMode.value] })
        notificationStore.addNotification({
            type: 'success',
            message: '写入成功。',
        })
        emit('success', targetUrl.value)
        handleClose()
    }
    catch (error) {
        notificationStore.addNotification({
            type: 'error',
            message: error instanceof Error ? error.message : '写入失败，请重试。',
        })
        scanStep.value = 3
    }
    finally {
        isWriting.value = false
    }
}

function resetState() {
    scanStep.value = 1
    selectedMode.value = 'fast'
}

function handleClose() {
    resetState()
    emit('close')
}

watch(() => props.show, (show) => {
    if (!show) {
        return
    }
    if (!isSupported()) {
        notificationStore.addNotification({
            type: 'warning',
            message: '当前设备不支持 Web NFC。你仍可查看流程，但无法实际读写。',
        })
    }
})
</script>

<template>
    <dialog v-if="show" class="modal modal-open">
        <div class="modal-box max-w-2xl">
            <button
                class="btn btn-sm btn-circle btn-ghost absolute right-4 top-4"
                type="button"
                @click="handleClose()"
            >
                ✕
            </button>

            <h3 class="text-lg font-semibold">
                NFC Writer
            </h3>

            <ul class="steps steps-horizontal w-full mt-6">
                <li class="step" :class="scanStep >= 1 ? 'step-primary' : ''">
                    准备
                </li>
                <li class="step" :class="scanStep >= 2 ? 'step-primary' : ''">
                    扫描
                </li>
                <li class="step" :class="scanStep >= 3 ? 'step-primary' : ''">
                    选择
                </li>
                <li class="step" :class="scanStep >= 4 ? 'step-primary' : ''">
                    写入
                </li>
            </ul>

            <div class="my-6 flex justify-center">
                <div
                    class="relative flex h-28 w-28 items-center justify-center rounded-full border border-base-300 bg-base-200/40"
                >
                    <span
                        v-if="scanStep === 2 || scanStep === 4"
                        class="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/20"
                    />
                    <span class="text-sm font-medium">
                        {{ scanStep === 1 ? '待开始' : scanStep === 2 ? '扫描中' : scanStep === 3 ? '已读取' : '写入中' }}
                    </span>
                </div>
            </div>

            <div v-if="scanStep === 3" class="space-y-2">
                <label class="label">
                    <span class="label-text font-medium">写入模式</span>
                </label>
                <div class="grid gap-2 md:grid-cols-2">
                    <label class="label cursor-pointer rounded-box border border-base-300 px-4 py-3 justify-start gap-3">
                        <input v-model="selectedMode" class="radio radio-primary" type="radio" value="fast">
                        <div>
                            <p class="text-sm font-medium">快速模式</p>
                            <p class="text-xs text-base-content/60">优先尝试直接跳转。</p>
                        </div>
                    </label>
                    <label class="label cursor-pointer rounded-box border border-base-300 px-4 py-3 justify-start gap-3">
                        <input v-model="selectedMode" class="radio radio-primary" type="radio" value="normal">
                        <div>
                            <p class="text-sm font-medium">兼容模式</p>
                            <p class="text-xs text-base-content/60">兼容性更高，可能需要额外确认。</p>
                        </div>
                    </label>
                </div>
            </div>

            <div class="modal-action">
                <button v-if="scanStep === 1" class="btn btn-primary" type="button" :disabled="isReading" @click="readCard()">
                    {{ isReading ? '扫描中...' : '开始扫描' }}
                </button>
                <button v-else-if="scanStep === 2" class="btn btn-primary" type="button" disabled>
                    扫描中...
                </button>
                <template v-else-if="scanStep === 3">
                    <button class="btn" type="button" :disabled="isWriting" @click="resetState()">
                        重新扫描
                    </button>
                    <button class="btn btn-primary" type="button" :disabled="isWriting" @click="writeCard()">
                        写入卡片
                    </button>
                </template>
                <button v-else class="btn btn-primary" type="button" disabled>
                    写入中...
                </button>
            </div>
        </div>
    </dialog>
</template>
