<script setup lang="ts">
definePageMeta({
    layout: 'full-page',
})

const route = useRoute()
await navigateTo(`/artifacts/${route.params.id as string}/settings`, { replace: true })
</script>

<template>
    <div class="p-4 text-sm text-base-content/60">
        正在跳转设置页...
    </div>
</template>
