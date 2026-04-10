<script setup lang="ts">
import BattleDialog from '~/components/global/function/MaimaiCN/battle/dialog.vue'
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
const maimaiStorage = storageOf('MaimaiCN')
const {
    activeBattle,
    attemptNearbyMatch,
    closeBattleDialog,
    dialogOpen,
    resumeActiveBattle,
} = useBattle(artifactId, maimaiStorage, storageSave)

useHead({
    title: `${artifact.value.product.type.name} - 兔兔实验室`,
})

const { startPhase1 } = useTour(artifact, storageOf, storageSave)

async function handleMaimaiRefreshComplete() {
    await attemptNearbyMatch()
}

onMounted(() => {
    const ucStorage = storageOf('UsagiCard').value
    if (!ucStorage?.skip_tour) {
        setTimeout(() => startPhase1(), 500)
    }

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
            :self-uuid="artifactId"
            @close="closeBattleDialog"
        />
    </div>
</template>
