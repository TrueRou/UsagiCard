<script setup lang="ts">
import MaimaiCNPlates from '~/components/function/maimai-cn/plates/index.vue'
import { ProductTypeFunction } from '~/types/api'

definePageMeta({ functionsWide: true })

const route = useRoute()
const artifactId = route.params.id as string
const { artifact } = await useArtifact(artifactId)
requireFunctionType(artifact, ProductTypeFunction.MAIMAI_CN)
</script>

<template>
    <MaimaiCNPlates :artifact-id="artifactId" />
</template>
