<script setup lang="ts">
const { artifactId, open, requestId, errorMessage, handleVerified, handleClose } = useSecondaryPinDialog()
</script>

<template>
    <NuxtLayout>
        <NuxtPage />
    </NuxtLayout>

    <SecondaryPinDialog
        v-if="open && artifactId"
        :key="requestId"
        :artifact-id="artifactId"
        :error-message="errorMessage"
        @verified="handleVerified"
        @close="handleClose"
    />
</template>
