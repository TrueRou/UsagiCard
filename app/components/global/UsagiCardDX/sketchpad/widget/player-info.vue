<script setup lang="ts">
defineProps<{
    artifactCtx: UseArtifactCtx
    artifactDesign: UsagiCardDxDesign
}>()
</script>

<template>
    <div
        v-if="artifactDesign.show_display_name" class="right-0 flex flex-col rounded-sm"
        :style="{ 'background-color': artifactDesign.player_info_color }"
    >
        <div class="flex items-center p-0.5">
            <p class="font-bold font-sega text-[9.5px]">
                {{ artifactDesign.display_name }}
            </p>
            <img class="h-2.5" src="../../assets/icons/misc/deluxe.png">
        </div>
        <div v-if="artifactDesign.show_friend_code" class="flex items-center">
            <p class="friend-code-font text-white pl-1 pr-1 text-center rounded-sm text-nowrap font-sega">
                フレンド<br>コ一ド
            </p>
            <p class="ml-px font-extrabold font-sega text-[7px]">
                {{ artifactDesign.friend_code }}
            </p>
        </div>
    </div>
</template>

<style scoped>
.friend-code-font {
    font-size: 4.5px;
    background-color: #405baa;
    -webkit-text-stroke: 0.8px #fff
}
</style>
