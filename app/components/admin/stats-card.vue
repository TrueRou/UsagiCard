<script setup lang="ts">
interface Props {
    title: string
    value: string | number
    description?: string
    icon?: string
    color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info'
}

const props = withDefaults(defineProps<Props>(), {
    color: 'primary',
})

const colorClasses: Record<string, string> = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error',
    info: 'text-info',
}
</script>

<template>
    <div class="bg-base-100 rounded-lg shadow-sm p-4 lg:p-5">
        <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-base-content/60">{{ title }}</span>
            <Icon v-if="icon" :name="icon" class="w-5 h-5 text-base-content/30" />
        </div>
        <div class="text-2xl lg:text-3xl font-bold" :class="colorClasses[color]">
            {{ value }}
        </div>
        <p v-if="description" class="text-xs text-base-content/50 mt-1">
            {{ description }}
        </p>
    </div>
</template>
