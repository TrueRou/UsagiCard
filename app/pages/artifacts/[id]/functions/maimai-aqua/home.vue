<script setup lang="ts">
import MaimaiAquaHome from '~/components/function/maimai-aqua/home/index.vue'

const route = useRoute()
const artifactId = route.params.id as string
const { artifact } = await useArtifact(artifactId)
requireFunctionType(artifact, ProductTypeFunction.MaimaiAqua)
</script>

<template>
    <MaimaiAquaHome :artifact-id="artifactId" />
</template>
