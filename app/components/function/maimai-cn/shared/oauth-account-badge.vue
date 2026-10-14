<script setup lang="ts">
defineProps<{
    displayName?: string | null
}>()
</script>

<template>
    <div class="flex items-center gap-2 rounded-lg bg-base-100/70 px-2.5 py-1.5">
        <Icon name="mdi:account-circle-outline" class="w-5 h-5 shrink-0 text-base-content/50" />
        <span class="flex-1 min-w-0 truncate text-sm" :class="displayName ? 'font-medium' : 'text-base-content/60'">
            {{ displayName || '已授权账号' }}
        </span>
        <span class="badge badge-success badge-sm gap-1 shrink-0">
            <Icon name="mdi:check" class="w-3 h-3" />
            已授权
        </span>
    </div>
</template>
