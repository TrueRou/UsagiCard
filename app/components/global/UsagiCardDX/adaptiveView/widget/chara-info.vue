<script setup lang="ts">
defineProps<{
    artifactCtx: UseArtifactCtx
    artifactDesign: UsagiCardDxDesign
}>()
</script>

<template>
    <div v-if="artifactDesign.enable_chara_info" class="flex flex-col text-black">
        <div
            v-if="artifactDesign.character_name"
            class="flex flex-col pt-1 pb-1 rounded-tr-lg w-4/5"
            :style="{ 'background-color': artifactDesign.chara_info_color }"
        >
            <p class="text-center text-sm font-semibold text-nowrap font-sega">
                {{ artifactDesign.character_name }}
            </p>
        </div>
        <div
            class="flex flex-col pb-1 rounded-tr-lg rounded-br-lg shadow-xl px-4"
            :style="{ 'background-color': artifactDesign.chara_info_color }"
        >
            <p class="text-center text-nowrap font-sega">
                <span class="text-sm mr-1">{{ artifactDesign.card_number_label || 'カード 番号' }}</span>
                <b class="text-md">{{ artifactDesign.card_number || '0721' }}</b>
            </p>
        </div>
    </div>
</template>
