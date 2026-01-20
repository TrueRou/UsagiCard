<script setup lang="ts">
interface Props {
    status: OrderStatus
}

const props = defineProps<Props>()

const statusConfig: Record<OrderStatus, { text: string, className: string }> = {
    [OrderStatus.CANCELED]: { text: '已取消', className: 'badge-neutral' },
    [OrderStatus.UNPAID]: { text: '待付款', className: 'badge-warning' },
    [OrderStatus.PAID]: { text: '已付款', className: 'badge-info' },
    [OrderStatus.SHIPPED]: { text: '已发货', className: 'badge-primary' },
    [OrderStatus.SUCCESS]: { text: '已完成', className: 'badge-success' },
    [OrderStatus.CLOSED]: { text: '已关闭', className: 'badge-neutral' },
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
