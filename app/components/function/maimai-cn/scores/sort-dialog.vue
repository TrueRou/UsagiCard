<script setup lang="ts">
import type { ScoreFilterState, ScoreSortState, SortDirection } from '~/composables/function/MaimaiCN/useMaimaiTypes'
import type { SortPreset } from '~/composables/function/MaimaiCN/useScoreView'
import { DEFAULT_SORT, SORT_FIELD_OPTIONS, SORT_PRESETS } from '~/composables/function/MaimaiCN/useScoreView'
import BaseModal from '../shared/base-modal.vue'

const props = defineProps<{
    sort: ScoreSortState
    filter: ScoreFilterState
}>()

const emit = defineEmits<{
    (e: 'apply', value: ScoreSortState): void
    (e: 'applyPreset', value: { filter: ScoreFilterState, sort: ScoreSortState }): void
}>()

const open = defineModel<boolean>('open', { default: false })
const draft = ref<ScoreSortState>({ ...props.sort })

watch(open, (value) => {
    if (value)
        draft.value = { ...props.sort }
})

const directionOptions: { value: SortDirection, label: string, icon: string }[] = [
    { value: 'desc', label: '降序', icon: 'mdi:arrow-down' },
    { value: 'asc', label: '升序', icon: 'mdi:arrow-up' },
]

function applyPreset(preset: SortPreset) {
    emit('applyPreset', preset.apply(props.filter))
    open.value = false
}

function apply() {
    emit('apply', { ...draft.value })
    open.value = false
}
</script>

<template>
    <BaseModal v-model:open="open" box-class="max-w-2xl">
        <template #header>
            <div class="flex items-center gap-2">
                <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon name="mdi:sort" class="h-5 w-5" />
                </span>
                <h3 class="text-base font-bold">
                    曲目与成绩排序设置
                </h3>
            </div>
        </template>

        <div class="space-y-4 text-sm">
            <section>
                <h4 class="mb-2 text-xs font-bold">
                    快捷预设
                </h4>
                <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <button
                        v-for="preset in SORT_PRESETS"
                        :key="preset.key"
                        class="rounded-xl border border-base-300 bg-base-100 px-3 py-2.5 text-left transition-colors hover:border-primary/40 hover:bg-primary/5 active:scale-[0.99]"
                        type="button"
                        @click="applyPreset(preset)"
                    >
                        <div class="font-mono text-sm font-bold">
                            {{ preset.label }}
                        </div>
                        <div class="text-[11px] text-base-content/55">
                            {{ preset.description }}
                        </div>
                    </button>
                </div>
            </section>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <section class="space-y-2">
                    <div class="flex items-center justify-between gap-2">
                        <h4 class="text-xs font-bold">
                            1. 主排序规则
                        </h4>
                        <div class="join">
                            <button
                                v-for="option in directionOptions"
                                :key="option.value"
                                class="btn join-item btn-sm lg:btn-xs"
                                :class="draft.primaryDir === option.value ? 'btn-primary' : 'btn-ghost bg-base-200'"
                                type="button"
                                @click="draft.primaryDir = option.value"
                            >
                                <Icon :name="option.icon" class="h-3.5 w-3.5" />
                                {{ option.label }}
                            </button>
                        </div>
                    </div>
                    <div class="space-y-1" role="radiogroup" aria-label="主排序字段">
                        <button
                            v-for="option in SORT_FIELD_OPTIONS"
                            :key="option.value"
                            class="flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left transition-colors active:scale-[0.99]"
                            :class="draft.primary === option.value ? 'border-primary bg-primary/10' : 'border-base-300 bg-base-100 hover:bg-base-200'"
                            role="radio"
                            :aria-checked="draft.primary === option.value"
                            type="button"
                            @click="draft.primary = option.value"
                        >
                            <div>
                                <div class="text-xs font-bold" :class="draft.primary === option.value ? 'text-primary' : ''">
                                    {{ option.label }}
                                </div>
                                <div class="text-[10px] text-base-content/50">
                                    {{ option.description }}
                                </div>
                            </div>
                            <Icon v-if="draft.primary === option.value" name="mdi:check" class="h-4 w-4 text-primary" />
                        </button>
                    </div>
                </section>

                <section class="space-y-3">
                    <h4 class="text-xs font-bold">
                        2. 次级并列排序规则
                    </h4>
                    <select v-model="draft.secondary" class="select w-full lg:select-sm" aria-label="次排序字段">
                        <option v-for="option in SORT_FIELD_OPTIONS" :key="option.value" :value="option.value">
                            {{ option.label }}
                        </option>
                    </select>
                    <div class="join w-full">
                        <button
                            v-for="option in directionOptions"
                            :key="option.value"
                            class="btn join-item btn-sm flex-1"
                            :class="draft.secondaryDir === option.value ? 'btn-primary' : 'btn-ghost bg-base-200'"
                            type="button"
                            @click="draft.secondaryDir = option.value"
                        >
                            <Icon :name="option.icon" class="h-3.5 w-3.5" />
                            {{ option.label }}
                        </button>
                    </div>

                    <h4 class="pt-2 text-xs font-bold">
                        特殊规则
                    </h4>
                    <label class="flex cursor-pointer items-center gap-2 text-xs">
                        <input v-model="draft.unplayedToBottom" type="checkbox" class="checkbox checkbox-sm checkbox-primary">
                        未游玩谱面强制置底
                    </label>
                    <div class="flex flex-wrap items-center gap-2 text-xs">
                        <label class="flex cursor-pointer items-center gap-2">
                            <input
                                type="checkbox"
                                class="checkbox checkbox-sm checkbox-primary"
                                :checked="draft.limit !== null"
                                @change="draft.limit = ($event.target as HTMLInputElement).checked ? 50 : null"
                            >
                            仅显示前 N 条
                        </label>
                        <input
                            v-if="draft.limit !== null"
                            v-model.number="draft.limit"
                            type="number"
                            min="1"
                            inputmode="numeric"
                            class="input input-sm w-20 font-mono"
                            aria-label="显示条数"
                        >
                    </div>
                </section>
            </div>
        </div>

        <template #footer>
            <button class="btn btn-primary order-first w-full sm:order-last sm:w-auto sm:btn-sm" type="button" @click="apply">
                应用排序设置
            </button>
            <button class="btn btn-ghost btn-sm mr-auto" type="button" @click="draft = { ...DEFAULT_SORT }">
                恢复默认排序
            </button>
            <button class="btn btn-ghost btn-sm" type="button" @click="open = false">
                取消
            </button>
        </template>
    </BaseModal>
</template>
