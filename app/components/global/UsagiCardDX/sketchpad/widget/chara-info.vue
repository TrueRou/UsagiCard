<script setup lang="ts">
defineProps<{
    artifactCtx: UseArtifactCtx
    artifactDesign: UsagiCardDxDesign
}>()
</script>

<template>
    <div v-if="artifactDesign.enable_chara_info" class="flex flex-col">
        <div
            v-if="artifactDesign.character_name"
            class="flex flex-col rounded-tr-md w-4/5 py-0.5"
            :style="{ 'background-color': artifactDesign.chara_info_color }"
        >
            <p class="text-center text-[7px] font-semibold text-nowrap font-sega">
                {{ artifactDesign.character_name }}
            </p>
        </div>
        <div
            class="flex flex-col rounded-tr-md rounded-br-md shadow-2xl pb-0.5"
            :style="{ 'background-color': artifactDesign.chara_info_color }"
        >
            <p class="text-center text-nowrap text-[7px] font-sega">
                {{ artifactDesign.card_number_label || 'カード 番号' }}

                <b class="text-[9px] ml-0.5">{{ artifactDesign.card_number || '0721' }}</b>
            </p>
        </div>
    </div>
</template>
