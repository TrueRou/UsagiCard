<script setup lang="ts">
const orders = useFetch("/api/orders")
</script>
<template>
    {{ orders.data }}
</template>