<template>
    <div class="badge" :class="badgeClass">
        {{ statusText }}
    </div>
</template>

<script setup lang="ts">
interface Props {
    status: number
}

const props = defineProps<Props>()
const { t } = useI18n()

// 状态映射
const statusMap = {
    [-1]: 'canceled',
    0: 'unpaid',
    1: 'paid',
    2: 'shipped',
    3: 'success',
    4: 'closed'
}

// 状态样式映射
const statusClassMap = {
    [-1]: 'badge-neutral',  // canceled
    0: 'badge-warning',     // unpaid
    1: 'badge-info',        // paid
    2: 'badge-primary',     // shipped
    3: 'badge-success',     // success
    4: 'badge-neutral'      // closed
}

const statusText = computed(() => {
    const status = statusMap[props.status as keyof typeof statusMap] || 'unknown'
    return t(`status.${status}`)
})

const badgeClass = computed(() => {
    return statusClassMap[props.status as keyof typeof statusClassMap] || 'badge-neutral'
})
</script>

<i18n lang="yaml">
en-GB:
  status:
    canceled: Canceled
    unpaid: Unpaid
    paid: Paid
    shipped: Shipped
    success: Completed
    closed: Closed
    unknown: Unknown

zh-CN:
  status:
    canceled: 已取消
    unpaid: 待付款
    paid: 已付款
    shipped: 已发货
    success: 已完成
    closed: 已关闭
    unknown: 未知状态
</i18n>