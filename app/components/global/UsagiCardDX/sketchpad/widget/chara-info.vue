<script setup lang="ts">
defineProps<{
    currentDesign: UsagiCardDxDesign
}>()
</script>

<template>
    <div v-if="currentDesign.enable_chara_info" class="flex flex-col">
        <div
            v-if="currentDesign.character_name"
            class="flex flex-col rounded-tr-md w-4/5 py-0.5"
            :style="{ 'background-color': currentDesign.chara_info_color }"
        >
            <p class="text-center text-[7px] font-semibold text-nowrap font-sega">
                {{ currentDesign.character_name }}
            </p>
        </div>
        <div
            class="flex flex-col rounded-tr-md rounded-br-md shadow-2xl pb-0.5"
            :style="{ 'background-color': currentDesign.chara_info_color }"
        >
            <p class="text-center text-nowrap text-[7px] font-sega">
                {{ currentDesign.card_number_label || 'カード 番号' }}

                <b class="text-[9px] ml-0.5">{{ currentDesign.card_number || '0721' }}</b>
            </p>
        </div>
    </div>
</template>
