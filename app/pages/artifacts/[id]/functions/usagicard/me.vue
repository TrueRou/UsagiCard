<script setup lang="ts">
import UsagiCardMe from '~/components/function/usagi-card/me/index.vue'
import { ProductTypeFunction } from '~/types/api'

const route = useRoute()
const artifactId = route.params.id as string
const { artifact } = await useArtifact(artifactId)
requireFunctionType(artifact, ProductTypeFunction.USAGI_CARD)
</script>

<template>
    <UsagiCardMe :artifact-id="artifactId" />
</template>
