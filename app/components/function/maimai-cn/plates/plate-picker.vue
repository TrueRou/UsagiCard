<script setup lang="ts">
import type { PlateCompletionMode, PlateGroup, PlateKind, PlateOverviewItem } from '~/composables/function/MaimaiCN/usePlateProgress'
import { parsePlateId, percent, PLATE_KINDS, PLATE_VERSIONS, songCountFor } from '~/composables/function/MaimaiCN/usePlateProgress'
import BaseModal from '../shared/base-modal.vue'

/** 牌子选择弹窗：先选版本再选种类，芯片上带完成度 */
const props = defineProps<{
    current: string
    overview: Map<string, PlateOverviewItem>
    mode: PlateCompletionMode
}>()

const emit = defineEmits<{
    (e: 'select', id: string): void
}>()

const open = defineModel<boolean>('open', { default: false })

const GROUPS: { key: PlateGroup, label: string }[] = [
    { key: 'old', label: '旧框' },
    { key: 'dx', label: 'DX' },
    { key: 'all', label: '全曲' },
]

const version = ref('')
const kind = ref<PlateKind>('将')

watch(open, (value) => {
    if (!value)
        return
    const plate = parsePlateId(props.current)
    version.value = plate?.version.key ?? '桃'
    kind.value = plate?.kind ?? '将'
}, { immediate: true })

const selectedVersion = computed(() => PLATE_VERSIONS.find(item => item.key === version.value))

function pickVersion(key: string) {
    version.value = key
    const target = PLATE_VERSIONS.find(item => item.key === key)
    if (target && !target.kinds.includes(kind.value))
        kind.value = target.kinds[0]!
}

function versionPct(key: string) {
    const item = props.overview.get(`${key}${kind.value}`)
    return item ? Math.floor(percent(songCountFor(item, props.mode))) : null
}

function confirm() {
    const id = `${version.value}${kind.value}`
    if (parsePlateId(id)) {
        emit('select', id)
        open.value = false
    }
}
</script>

<template>
    <BaseModal v-model:open="open" title="选择牌子" box-class="max-w-xl">
        <div class="space-y-4">
            <div class="grid grid-cols-5 gap-1" role="radiogroup" aria-label="牌子种类">
                <button
                    v-for="item in PLATE_KINDS"
                    :key="item.kind"
                    type="button"
                    class="chip h-11 w-full flex-col gap-0 leading-tight"
                    :class="kind === item.kind ? 'chip-on' : 'chip-idle'"
                    role="radio"
                    :aria-checked="kind === item.kind"
                    :disabled="!selectedVersion?.kinds.includes(item.kind)"
                    @click="kind = item.kind"
                >
                    <span class="text-sm">{{ item.kind }}</span>
                    <span class="text-[10px] font-medium opacity-70">{{ item.hint }}</span>
                </button>
            </div>
            <div v-for="group in GROUPS" :key="group.key" class="space-y-1.5">
                <div class="text-[11px] font-semibold text-base-content/50">
                    {{ group.label }}
                </div>
                <div class="grid grid-cols-4 gap-1 sm:grid-cols-6">
                    <button
                        v-for="item in PLATE_VERSIONS.filter(entry => entry.group === group.key)"
                        :key="item.key"
                        type="button"
                        class="chip h-11 w-full flex-col gap-0 px-1 leading-tight"
                        :class="version === item.key ? 'chip-on' : 'chip-idle'"
                        :aria-pressed="version === item.key"
                        @click="pickVersion(item.key)"
                    >
                        <span class="text-sm">{{ item.key === '霸' ? '霸者' : item.label }}</span>
                        <span v-if="versionPct(item.key) !== null" class="font-mono text-[10px] font-medium opacity-70 tabular-nums">
                            {{ versionPct(item.key) }}%
                        </span>
                    </button>
                </div>
            </div>
        </div>
        <template #footer>
            <button class="btn btn-ghost btn-sm" type="button" @click="open = false">
                取消
            </button>
            <button class="btn btn-primary btn-sm" type="button" :disabled="!parsePlateId(`${version}${kind}`)" @click="confirm">
                查看 {{ version }}{{ kind }}
            </button>
        </template>
    </BaseModal>
</template>
