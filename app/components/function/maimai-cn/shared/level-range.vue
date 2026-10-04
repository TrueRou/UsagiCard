<script setup lang="ts">
const props = withDefaults(defineProps<{
    min?: number
    max?: number
    step?: number
}>(), {
    min: 1,
    max: 15,
    step: 0.1,
})

const model = defineModel<[number, number]>({ required: true })

function round(value: number) {
    return Math.round(value / props.step) * props.step
}

function clamp(value: number) {
    return Math.min(Math.max(round(value), props.min), props.max)
}

function update(boundary: 0 | 1, raw: string | number) {
    const value = Number(raw)
    if (Number.isNaN(value))
        return
    const next: [number, number] = [...model.value]
    next[boundary] = clamp(value)
    if (boundary === 0 && next[0] > next[1])
        next[1] = next[0]
    if (boundary === 1 && next[1] < next[0])
        next[0] = next[1]
    model.value = [Number(next[0].toFixed(1)), Number(next[1].toFixed(1))]
}

const percent = (value: number) => (value - props.min) / (props.max - props.min) * 100
const trackStyle = computed(() => ({
    left: `${percent(model.value[0])}%`,
    width: `${Math.max(percent(model.value[1]) - percent(model.value[0]), 0)}%`,
}))
</script>

<template>
    <div class="flex items-center gap-3">
        <input
            type="number"
            class="input input-sm w-16 shrink-0 font-mono"
            :min="min" :max="max" :step="step"
            :value="model[0].toFixed(1)"
            aria-label="最低定数"
            @change="update(0, ($event.target as HTMLInputElement).value)"
        >
        <div class="relative h-6 flex-1">
            <div class="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-base-300" />
            <div class="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary" :style="trackStyle" />
            <input
                type="range"
                class="level-range-thumb absolute inset-0 h-6 w-full appearance-none bg-transparent"
                :min="min" :max="max" :step="step"
                :value="model[0]"
                aria-label="最低定数滑块"
                @input="update(0, ($event.target as HTMLInputElement).value)"
            >
            <input
                type="range"
                class="level-range-thumb absolute inset-0 h-6 w-full appearance-none bg-transparent"
                :min="min" :max="max" :step="step"
                :value="model[1]"
                aria-label="最高定数滑块"
                @input="update(1, ($event.target as HTMLInputElement).value)"
            >
        </div>
        <input
            type="number"
            class="input input-sm w-16 shrink-0 font-mono"
            :min="min" :max="max" :step="step"
            :value="model[1].toFixed(1)"
            aria-label="最高定数"
            @change="update(1, ($event.target as HTMLInputElement).value)"
        >
    </div>
</template>

<style scoped>
.level-range-thumb {
    pointer-events: none;
}

.level-range-thumb::-webkit-slider-thumb {
    appearance: none;
    pointer-events: auto;
    height: 1.125rem;
    width: 1.125rem;
    border-radius: 9999px;
    border: 2px solid var(--color-base-100);
    background: var(--color-primary);
    box-shadow: 0 1px 2px rgb(0 0 0 / 0.2);
    cursor: pointer;
}

.level-range-thumb::-moz-range-thumb {
    pointer-events: auto;
    height: 1.125rem;
    width: 1.125rem;
    border-radius: 9999px;
    border: 2px solid var(--color-base-100);
    background: var(--color-primary);
    cursor: pointer;
}
</style>
