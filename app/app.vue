<script setup lang="ts">
const { artifactId, open, handleVerified, handleClose } = useSecondaryPinDialog()
</script>

<template>
    <NuxtLayout>
        <NuxtPage />
    </NuxtLayout>

    <SecondaryPinDialog
        v-if="open && artifactId"
        :artifact-id="artifactId"
        mode="verify"
        @verified="handleVerified"
        @close="handleClose"
    />
</template>
