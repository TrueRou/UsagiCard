<script setup lang="ts">
import type { Song } from '~/composables/function/MaimaiCN/useMaimaiTypes'
import { useMaimaiUtils } from '~/composables/function/MaimaiCN/useMaimaiUtils'
import { useSongSearch } from '~/composables/function/MaimaiCN/useSongSearch.client'

const emit = defineEmits<{
    (e: 'select', song: Song | null): void
}>()

const { getSongJacketUrl } = useMaimaiUtils()

const songSearch = useSongSearch()

const searchQuery = ref('')
const searchResults = ref<Song[]>([])
const isLoading = ref(false)
const showDropdown = ref(false)
const dropdownRef = ref<HTMLDivElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)

watch(searchQuery, (newValue) => {
    if (newValue) {
        searchResults.value = songSearch.searchSong(newValue)
        showDropdown.value = true
    }
    else {
        searchResults.value = []
        showDropdown.value = false
        emit('select', null)
    }
})

async function selectSong(song: Song) {
    searchQuery.value = song.title
    await nextTick()
    showDropdown.value = false
    emit('select', song)
}

function handleClickOutside(event: MouseEvent) {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)
        && inputRef.value && !inputRef.value.contains(event.target as Node)) {
        showDropdown.value = false
    }
}

onMounted(() => {
    songSearch.indexSongs()
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
    <div class="song-search relative mt-2">
        <div class="search-container relative">
            <input
                ref="inputRef" v-model="searchQuery" type="text" placeholder="搜索歌曲名称、别名、艺术家..."
                class="w-full p-3 pr-10 border-2 border-blue-300 dark:border-blue-700 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 dark:text-white transition-all duration-200"
                @focus="showDropdown = searchQuery.length > 0 && searchResults.length > 0"
            >
            <div class="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg
                    v-if="isLoading" class="animate-spin h-5 w-5 text-blue-500 dark:text-blue-300"
                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                >
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path
                        class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
                <svg
                    v-else class="h-5 w-5 text-blue-500 dark:text-blue-300" xmlns="http://www.w3.org/2000/svg"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                    <path
                        stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
            </div>
        </div>

        <!-- 搜索结果下拉框 -->
        <div
            v-if="showDropdown && searchResults.length > 0" ref="dropdownRef"
            class="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg max-h-60 overflow-auto border border-gray-200 dark:border-gray-700 search-results"
        >
            <div
                v-for="result in searchResults" :key="result.id"
                class="p-2 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer flex items-center border-b border-gray-100 dark:border-gray-700"
                @click="selectSong(result)"
            >
                <img
                    :src="getSongJacketUrl(result.id)" :alt="result.title" class="w-10 h-10 object-cover rounded mr-2"
                    loading="lazy"
                >
                <div>
                    <span
                        class="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded-sm"
                    >
                        ID: {{ result.id }}
                    </span>
                    <div class="font-medium dark:text-white">
                        {{ result.title }}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <span>{{ result.artist }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.search-results {
    scrollbar-width: thin;
    scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

.search-results::-webkit-scrollbar {
    width: 6px;
}

.search-results::-webkit-scrollbar-track {
    background: transparent;
}

.search-results::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
    border-radius: 3px;
}

@media (max-width: 640px) {
    .search-results {
        max-height: 70vh;
    }
}
</style>
