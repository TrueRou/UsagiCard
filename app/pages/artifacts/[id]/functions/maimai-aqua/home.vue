<script setup lang="ts">
import MaimaiAquaHome from '~/components/function/maimai-aqua/home/index.vue'
import { ProductTypeFunction } from '~/types/api'

const route = useRoute()
const artifactId = route.params.id as string
const { artifact } = await useArtifact(artifactId)
requireFunctionType(artifact, ProductTypeFunction.MAIMAI_AQUA)
</script>

<template>
    <MaimaiAquaHome :artifact-id="artifactId" />
</template>
