<script setup lang="ts">
const route = useRoute()
const artifactId = route.params.id as string
const { storageOf, storageSave, storageSaving } = await useArtifact(artifactId)
const { img } = useUtils()

const storage = ref<UsagiCardStorage>({
    ...storageOf('UsagiCard').value,
})
storage.value.bio ??= {}

const selectorOpen = ref(false)
const selectorInitialFilters = ref<string[]>(['avatar'])
const imageSelectorCtx: UseImageSelectorCtx = {
    selectorOpen,
    selectorInitialFilters,
    selectorImageAspect: toRef('squares'),
    openImageSelector: (_key: string) => { selectorOpen.value = true },
    closeImageSelector: () => { selectorOpen.value = false },
    handleImageSelect: async (image: ImageSimplePublic) => {
        storage.value.bio ??= {}
        storage.value.bio.card_avatar = image.id
        selectorOpen.value = false
        await storageSave('UsagiCard', storage.value)
    },
    clearImageSelect: async (_key: string) => {
        if (storage.value.bio)
            storage.value.bio.card_avatar = null
        await storageSave('UsagiCard', storage.value)
    },
}

async function saveProfile() {
    await storageSave('UsagiCard', storage.value)
}
</script>

<template>
    <div class="p-4 space-y-4 max-w-lg mx-auto">
        <ImageSelector v-if="selectorOpen" :selector-ctx="imageSelectorCtx" />

        <div class="space-y-2">
            <label class="text-sm font-medium text-base-content/60">头像</label>
            <div class="flex items-center gap-3">
                <div class="w-16 h-16 rounded-full overflow-hidden bg-base-200 shrink-0">
                    <img
                        v-if="storage.bio?.card_avatar"
                        :src="img(storage.bio.card_avatar)"
                        alt="avatar"
                        class="w-full h-full object-cover"
                    >
                </div>
                <div class="flex gap-2">
                    <button class="btn btn-outline" @click="imageSelectorCtx.openImageSelector('avatar')">
                        更换
                    </button>
                    <button
                        v-if="storage.bio?.card_avatar"
                        class="btn btn-ghost text-error"
                        @click="imageSelectorCtx.clearImageSelect('avatar')"
                    >
                        移除
                    </button>
                </div>
            </div>
        </div>

        <div class="space-y-2">
            <label class="text-sm font-medium text-base-content/60">标题</label>
            <input v-model="storage.bio!.card_title" type="text" class="input input-bordered w-full" placeholder="卡片标题">
        </div>

        <div class="space-y-2">
            <label class="text-sm font-medium text-base-content/60">简介 (Markdown)</label>
            <textarea v-model="storage.bio!.card_profile" class="textarea textarea-bordered w-full h-32 text-sm" placeholder="支持 Markdown 格式..." />
        </div>

        <button class="btn btn-primary w-full" :disabled="storageSaving" @click="saveProfile">
            <span v-if="storageSaving" class="loading loading-spinner loading-sm" />
            保存
        </button>
    </div>
</template>
