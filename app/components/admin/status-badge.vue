<script setup lang="ts">
interface Props {
    status: number
    type: 'order' | 'artifact' | 'batch'
}

const props = defineProps<Props>()

const orderConfig: Record<number, { text: string, className: string }> = {
    [OrderStatus.CANCELED]: { text: '已取消', className: 'badge-neutral' },
    [OrderStatus.UNPAID]: { text: '待付款', className: 'badge-warning' },
    [OrderStatus.PAID]: { text: '已付款', className: 'badge-info' },
    [OrderStatus.SHIPPED]: { text: '已发货', className: 'badge-primary' },
}

const artifactConfig: Record<number, { text: string, className: string }> = {
    [ArtifactStatus.FAILED]: { text: '失败', className: 'badge-error' },
    [ArtifactStatus.PENDING]: { text: '待定', className: 'badge-warning' },
    [ArtifactStatus.IN_PRODUCTION]: { text: '制作中', className: 'badge-info' },
    [ArtifactStatus.COMPLETED]: { text: '已完成', className: 'badge-success' },
    [ArtifactStatus.ACTIVATED]: { text: '已激活', className: 'badge-primary' },
}

const batchConfig: Record<number, { text: string, className: string }> = {
    [BatchStatus.FAILED]: { text: '失败', className: 'badge-error' },
    [BatchStatus.PENDING]: { text: '待定', className: 'badge-warning' },
    [BatchStatus.IN_PRODUCTION]: { text: '制作中', className: 'badge-info' },
    [BatchStatus.COMPLETED]: { text: '已完成', className: 'badge-success' },
}

const configMap = { order: orderConfig, artifact: artifactConfig, batch: batchConfig }

const config = computed(() => {
    return configMap[props.type]?.[props.status] ?? { text: '未知', className: 'badge-neutral' }
})
</script>

<template>
    <div class="badge badge-sm" :class="config.className">
        {{ config.text }}
    </div>
</template>
