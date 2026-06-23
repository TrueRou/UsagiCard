<script setup lang="ts">
import UsagiCardMe from '~/components/function/usagi-card/me/index.vue'

const route = useRoute()
const artifactId = route.params.id as string
const { artifact } = await useArtifact(artifactId)
requireFunctionType(artifact, ProductTypeFunction.UsagiCard)
</script>

<template>
    <UsagiCardMe :artifact-id="artifactId" />
</template>
