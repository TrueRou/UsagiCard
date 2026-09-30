<script setup lang="ts">
import type { UsagiCardStorage } from '~/types/api'

const route = useRoute()
const artifactId = route.params.id as string
const { artifact, storageOf, storageSave, storageSaving } = await useArtifact(artifactId)
const { img } = useUtils()
const { copy, copied } = useClipboard()

const storage = ref<UsagiCardStorage>({
    ...storageOf('UsagiCard').value,
})

let saveTimer: ReturnType<typeof setTimeout> | null = null

async function saveProfile() {
    await storageSave('UsagiCard', storage.value, { showSuccessToast: false })
}

function scheduleSave() {
    if (saveTimer)
        clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
        void saveProfile()
    }, 600)
}

onBeforeUnmount(() => {
    if (saveTimer)
        clearTimeout(saveTimer)
})
</script>

<template>
    <div class="p-4 space-y-4">
        <section class="space-y-2">
            <label class="text-sm font-medium text-base-content/60">头像</label>
            <div class="flex items-center gap-3">
                <div class="w-16 h-16 rounded-full overflow-hidden bg-base-200 shrink-0">
                    <img
                        v-if="storage.bio?.card_avatar"
                        :src="img(storage.bio.card_avatar)"
                        alt="avatar"
                        class="w-full h-full object-cover"
                    >
                    <div v-else class="w-full h-full flex items-center justify-center text-base-content/30">
                        <Icon name="mdi:account" class="w-8 h-8" />
                    </div>
                </div>
            </div>
        </section>

        <section class="space-y-2">
            <label class="text-sm font-medium text-base-content/60">标题</label>
            <input v-model="storage.bio!.card_title" type="text" class="input input-bordered w-full" placeholder="卡片标题" @input="scheduleSave">
        </section>

        <section class="space-y-2">
            <label class="text-sm font-medium text-base-content/60">简介 (Markdown)</label>
            <textarea v-model="storage.bio!.card_profile" class="textarea textarea-bordered w-full h-32 text-sm" placeholder="支持 Markdown 格式..." @input="scheduleSave" />
        </section>

        <section class="rounded-xl border border-base-300 p-4 space-y-4">
            <div class="flex items-center justify-between gap-3">
                <h4 class="text-sm font-semibold">
                    卡片信息
                </h4>
                <span v-if="storageSaving" class="loading loading-spinner loading-xs" />
            </div>

            <div class="space-y-2">
                <label class="text-sm font-medium text-base-content/60">卡片 UUID</label>
                <button class="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg bg-base-200 hover:bg-base-300 transition-all font-mono text-xs text-base-content/60 text-left" @click="copy(artifact.id)">
                    <span class="flex-1 truncate">{{ artifact.id }}</span>
                    <Icon :name="copied ? 'mdi:check' : 'mdi:content-copy'" class="w-3.5 h-3.5 shrink-0" />
                </button>
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
                <div class="space-y-2">
                    <label class="text-sm font-medium text-base-content/60">商品</label>
                    <p class="text-sm">
                        {{ artifact.type.name }}
                    </p>
                </div>

                <div class="space-y-2">
                    <label class="text-sm font-medium text-base-content/60">创建时间</label>
                    <p class="text-sm">
                        {{ new Date(artifact.created_at).toLocaleString('zh-CN') }}
                    </p>
                </div>
            </div>
        </section>
    </div>
</template>
