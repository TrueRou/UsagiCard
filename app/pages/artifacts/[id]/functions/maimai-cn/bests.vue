<script setup lang="ts">
import MaimaiCNBests from '~/components/function/maimai-cn/bests/index.vue'
import { ProductTypeFunction } from '~/types/api'

definePageMeta({ functionsWide: true })

const route = useRoute()
const artifactId = route.params.id as string
const { artifact } = await useArtifact(artifactId)
requireFunctionType(artifact, ProductTypeFunction.MAIMAI_CN)
</script>

<template>
    <MaimaiCNBests :artifact-id="artifactId" />
</template>
