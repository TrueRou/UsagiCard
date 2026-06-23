<script setup lang="ts">
import type { Song } from '~/composables/function/MaimaiCN/useMaimaiTypes'
import SongDetail from '../../minfo/components/song-detail.vue'

defineProps<{
    song: Song
    artifactId: string
}>()
</script>

<template>
    <div>
        <SongDetail :song="song" :artifact-id="artifactId" />
    </div>
</template>
