<script setup lang="ts">
import MaimaiCNPreferences from '~/components/function/maimai-cn/settings/preferences.vue'
import { ProductTypeFunction } from '~/types/api'

const route = useRoute()
const artifactId = route.params.id as string
const { artifact } = await useArtifact(artifactId)
requireFunctionType(artifact, ProductTypeFunction.MAIMAI_CN)
</script>

<template>
    <div class="p-4">
        <MaimaiCNPreferences :artifact-id="artifactId" />
    </div>
</template>
