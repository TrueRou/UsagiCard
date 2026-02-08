<script setup lang="ts">
defineProps<{
    currentDesign: UsagiCardDxDesign
}>()
</script>

<template>
    <div
        v-if="currentDesign.display_name" class="rounded-s-md ms-auto w-fit text-black"
        :style="{ 'background-color': currentDesign.player_info_color }"
    >
        <div class="p-1 space-x-1">
            <p class="inline font-bold font-sega align-middle adapt-text-lg">
                {{ currentDesign.display_name }}
            </p>
            <img class="inline align-middle" style="height: 3.5vh;" src="../../assets/icons/misc/deluxe.png">
        </div>
        <div v-if="currentDesign.friend_code">
            <div
                class="inline-block align-middle text-white pl-2 pr-2 text-center font-extrabold rounded-bl-md text-nowrap font-sega"
                style="font-size: max(6pt, 1.2vh); background-color: #405baa; -webkit-text-stroke: 1px #fff"
            >
                フレンド<br>コ一ド
            </div>
            <p class="inline align-middle ml-0.5 font-extrabold font-sega adapt-text-md">
                {{ currentDesign.friend_code }}
            </p>
        </div>
    </div>
</template>

<style scoped>
.adapt-text-md {
    font-size: clamp(1.6dvh, 2.2dvw, 2vmin);
    line-height: 120%;
}

.adapt-text-lg {
    font-size: clamp(2dvh, 2.8dvw, 2.6vmin);
    line-height: 120%;
}
</style>
