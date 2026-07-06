<script setup lang="ts">
import BattleDialog from '~/components/function/maimai-cn/battle/dialog.vue'
import { useBattle } from '~/composables/function/MaimaiCN/useBattle'

definePageMeta({
    layout: 'full-page',
    pageTransition: {
        name: 'function-page',
        mode: 'out-in',
    },
})

const route = useRoute()
const artifactId = route.params.id as string // UUID string
const { artifact, storageOf, storageSave, useDesignCtx } = await useArtifact(artifactId)
const adaptiveComponent = computed(() => useDesignCtx.adaptiveViewComponent.value)
const maimaiBattle = artifact.value.product.type.function_types.includes(ProductTypeFunction.MaimaiCN)
    ? useBattle(artifactId, storageOf('MaimaiCN'), storageSave)
    : {
            activeBattle: ref(null),
            attemptNearbyMatch: async () => null,
            closeBattleDialog: () => {},
            dialogOpen: ref(false),
            resumeActiveBattle: async () => {},
        }
const {
    activeBattle,
    attemptNearbyMatch,
    closeBattleDialog,
    dialogOpen,
    resumeActiveBattle,
} = maimaiBattle

useHead({
    title: `${artifact.value.product.type.name} - 兔兔实验室`,
})

async function handleMaimaiRefreshComplete() {
    await attemptNearbyMatch()
}

onMounted(() => {
    void resumeActiveBattle()
})
</script>

<template>
    <div class="w-full h-full overflow-hidden relative">
        <component
            :is="adaptiveComponent"
            :use-design-ctx="useDesignCtx"
            :storage-save="storageSave"
            :on-maimai-refresh-complete="handleMaimaiRefreshComplete"
        />
        <BattleDialog
            :battle="activeBattle"
            :open="dialogOpen"
            @close="closeBattleDialog"
        />
    </div>
</template>
