<script setup lang="ts">
import MaimaiCNQuery from '~/components/function/maimai-cn/query/index.vue'

const route = useRoute()
const artifactId = route.params.id as string
const { artifact } = await useArtifact(artifactId)
requireFunctionType(artifact, ProductTypeFunction.MaimaiCN)
</script>

<template>
    <MaimaiCNQuery :artifact-id="artifactId" />
</template>
