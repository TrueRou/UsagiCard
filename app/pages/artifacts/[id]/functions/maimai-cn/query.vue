<script setup lang="ts">
import MaimaiCNQuery from '~/components/function/maimai-cn/query/index.vue'
import { ProductTypeFunction } from '~/types/api'

const route = useRoute()
const artifactId = route.params.id as string
const { artifact } = await useArtifact(artifactId)
requireFunctionType(artifact, ProductTypeFunction.MAIMAI_CN)
</script>

<template>
    <MaimaiCNQuery :artifact-id="artifactId" />
</template>
