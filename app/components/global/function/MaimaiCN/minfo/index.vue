<script setup lang="ts">
import type { Song } from '~/composables/function/MaimaiCN/useMaimaiUtils'
import SongDetail from './components/song-detail.vue'
import SongSearch from './components/song-search.vue'

defineProps<{
    artifactId: string
}>()

const selectedSong = ref<Song | null>(null)

function handleSongSelect(song: Song | null) {
    selectedSong.value = song
}
</script>

<template>
    <div class="minfo-container p-2">
        <SongSearch @select="handleSongSelect" />

        <div
            v-if="!selectedSong"
            class="flex flex-col items-center justify-center p-8 text-gray-500 dark:text-gray-400 mt-6 bg-white dark:bg-gray-800 rounded-lg"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-2 text-blue-300 dark:text-blue-700" fill="none"
                viewBox="0 0 24 24" stroke="currentColor"
            >
                <path
                    stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
            </svg>
            <p class="text-lg font-medium">
                请在上方搜索框中输入歌曲名称
            </p>
            <p class="text-sm mt-1">
                支持别名、歌曲名、艺术家名称搜索
            </p>
        </div>

        <div v-if="selectedSong" class="mt-4">
            <SongDetail :song="selectedSong" :artifact-id="artifactId" />
        </div>
    </div>
</template>

<style scoped>
.minfo-container {
    max-width: 900px;
    margin: 0 auto;
}
</style>
