<script setup lang="ts">
import MaimaiCNPlaydata from '~/components/function/maimai-cn/playdata/index.vue'
import { ProductTypeFunction } from '~/types/api'

const route = useRoute()
const artifactId = route.params.id as string
const { artifact } = await useArtifact(artifactId)
requireFunctionType(artifact, ProductTypeFunction.MAIMAI_CN)
</script>

<template>
    <MaimaiCNPlaydata :artifact-id="artifactId" />
</template>
