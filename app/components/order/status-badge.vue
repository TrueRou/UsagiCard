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
    0: 'canceled',
    1: 'unpaid',
    2: 'paid',
    3: 'shipped',
    4: 'success',
    5: 'closed'
}

// 状态样式映射
const statusClassMap = {
    0: 'badge-neutral',  // canceled
    1: 'badge-warning',  // unpaid
    2: 'badge-info',     // paid
    3: 'badge-primary',  // shipped
    4: 'badge-success',  // success
    5: 'badge-neutral'   // closed
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