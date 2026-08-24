<script setup lang="ts">
import type { UsagiCardDxDesign } from '~/types/api'

defineProps<{
    design: UsagiCardDxDesign
}>()
</script>

<template>
    <div v-if="design.enable_chara_info" class="flex flex-col text-black">
        <div
            v-if="design.character_name"
            class="flex flex-col pt-1 pb-1 rounded-tr-lg w-4/5"
            :style="{ 'background-color': design.chara_info_color }"
        >
            <p class="text-center text-sm font-semibold text-nowrap font-sega">
                {{ design.character_name }}
            </p>
        </div>
        <div
            class="flex flex-col pb-1 rounded-tr-lg rounded-br-lg shadow-xl px-4"
            :style="{ 'background-color': design.chara_info_color }"
        >
            <p class="text-center text-nowrap font-sega">
                <span class="text-sm mr-1">{{ design.card_number_label || 'カード 番号' }}</span>
                <b class="text-md">{{ design.card_number || '0721' }}</b>
            </p>
        </div>
    </div>
</template>
