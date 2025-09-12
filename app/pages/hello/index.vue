<script setup lang="ts">
import type { CommonResponse, OrderPageResponse } from '~/def';

// let orders: OrderPageResponse | null = null;

let { data: orders } = useLeporid<CommonResponse<OrderPageResponse>>("/api/orders");

// if (import.meta.client) {
//     orders = await useNuxtApp().$ofetch<OrderPageResponse>("/api/orders")
// }

// if (import.meta.server) {
//     orders = await useNuxtApp().$ofetch<OrderPageResponse>("/api/orders")
// }

</script>
<template>
    {{ orders }}
</template>