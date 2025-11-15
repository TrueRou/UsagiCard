<script setup lang="ts">
interface Props {
    status: number
}

const props = defineProps<Props>()

const statusConfig: Record<number, { text: string, className: string }> = {
    [-1]: { text: '已取消', className: 'badge-neutral' },
    0: { text: '待付款', className: 'badge-warning' },
    1: { text: '已付款', className: 'badge-info' },
    2: { text: '已发货', className: 'badge-primary' },
    3: { text: '已完成', className: 'badge-success' },
    4: { text: '已关闭', className: 'badge-neutral' },
}

const statusText = computed(() => {
    return statusConfig[props.status]?.text ?? '未知状态'
})

const badgeClass = computed(() => {
    return statusConfig[props.status]?.className ?? 'badge-neutral'
})
</script>

<template>
    <div class="badge" :class="badgeClass">
        {{ statusText }}
    </div>
</template>
