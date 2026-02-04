<script setup lang="ts">
defineProps<{
    artifactCtx: UseArtifactCtx
    artifactDesign: UsagiCardDxDesign
}>()
</script>

<template>
    <div class="flex flex-col">
        <div
            v-if="artifactDesign.show_character_name"
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
                カード 番号
                <b class="text-[9px] ml-0.5">{{ artifactCtx.artifact.value.id.padStart(4, '0') }}</b>
            </p>
        </div>
    </div>
</template>
