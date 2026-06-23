<script setup lang="ts">
definePageMeta({
    layout: 'full-page',
})

const route = useRoute()
await navigateTo(`/artifacts/${route.params.id as string}/settings`, { replace: true })
</script>
