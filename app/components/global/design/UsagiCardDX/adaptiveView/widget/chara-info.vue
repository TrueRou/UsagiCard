<script setup lang="ts">
defineProps<{
    cuttentDesign: UsagiCardDxDesign
}>()
</script>

<template>
    <div v-if="cuttentDesign.enable_chara_info" class="flex flex-col text-black">
        <div
            v-if="cuttentDesign.character_name"
            class="flex flex-col pt-1 pb-1 rounded-tr-lg w-4/5"
            :style="{ 'background-color': cuttentDesign.chara_info_color }"
        >
            <p class="text-center text-sm font-semibold text-nowrap font-sega">
                {{ cuttentDesign.character_name }}
            </p>
        </div>
        <div
            class="flex flex-col pb-1 rounded-tr-lg rounded-br-lg shadow-xl px-4"
            :style="{ 'background-color': cuttentDesign.chara_info_color }"
        >
            <p class="text-center text-nowrap font-sega">
                <span class="text-sm mr-1">{{ cuttentDesign.card_number_label || 'カード 番号' }}</span>
                <b class="text-md">{{ cuttentDesign.card_number || '0721' }}</b>
            </p>
        </div>
    </div>
</template>
