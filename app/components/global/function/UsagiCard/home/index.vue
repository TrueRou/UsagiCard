<script setup lang="ts">
import { marked } from 'marked'

const props = defineProps<{
    artifact: ArtifactUserResponse
}>()

const { storageSave, storageSaving } = await useArtifact(props.artifact.id)
const { loggedIn } = useUserSession()
const { img } = useUtils()

const storage = ref<UsagiCardStorage>({
    ...props.artifact.storage,
})

// ---- card_title ----
const editingTitle = ref(false)
const titleInput = ref<HTMLInputElement>()

function startEditTitle() {
    editingTitle.value = true
    nextTick(() => titleInput.value?.focus())
}

async function finishEditTitle() {
    editingTitle.value = false
    await storageSave(storage.value)
}

// ---- card_avatar ----
const { data: squaresAspect } = await useLeporid<ImageAspectPublic>('/api/images/aspects/squares')
const selectorOpen = ref(false)
const selectorImageAspect = computed(() => squaresAspect.value ?? undefined)
const selectorInitialFilters = ref<string[]>(['avatar'])

const imageSelectorCtx: UseImageSelectorCtx = {
    selectorOpen,
    selectorImageAspect,
    selectorInitialFilters,
    openImageSelector: (_key: string) => { selectorOpen.value = true },
    closeImageSelector: () => { selectorOpen.value = false },
    handleImageSelect: async (image: ImageSimplePublic) => {
        storage.value.card_avatar = image.id
        selectorOpen.value = false
        await storageSave(storage.value)
    },
    clearImageSelect: async (_key: string) => {
        storage.value.card_avatar = null
        await storageSave(storage.value)
    },
}

// ---- card_profile ----
const editingProfile = ref(false)

const renderedProfile = computed(() => {
    if (!storage.value.card_profile)
        return ''
    return marked.parse(storage.value.card_profile) as string
})

async function saveProfile() {
    editingProfile.value = false
    await storageSave(storage.value)
}

//
const showEditButton = computed(() => loggedIn.value)
</script>

<template>
    <div class="space-y-6">
        <ImageSelector
            :selector-ctx="imageSelectorCtx"
            @update:open="val => { if (!val) imageSelectorCtx.closeImageSelector() }"
            @select="imageSelectorCtx.handleImageSelect"
        />

        <!-- 头像 + 标题区 -->
        <div class="flex items-center gap-4">
            <!-- 头像 -->
            <div class="relative shrink-0">
                <div class="w-20 h-20 rounded-full overflow-hidden border-2 border-base-200 bg-base-200 flex items-center justify-center">
                    <img
                        v-if="storage.card_avatar"
                        :src="img(storage.card_avatar)"
                        alt="头像"
                        class="w-full h-full object-cover"
                    >
                    <svg v-else class="w-8 h-8 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
                <button
                    v-if="showEditButton"
                    class="btn btn-xs btn-circle absolute -bottom-1 -right-1 bg-base-100 border border-base-300"
                    type="button"
                    @click="imageSelectorCtx.openImageSelector('avatar')"
                >
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
            </div>

            <!-- 标题 -->
            <div class="flex-1 min-w-0">
                <div v-if="editingTitle" class="flex items-center gap-2">
                    <input
                        ref="titleInput"
                        v-model="storage.card_title"
                        class="input input-bordered flex-1 text-xl font-bold"
                        type="text"
                        placeholder="卡片标题"
                        @blur="finishEditTitle"
                        @keydown.enter.prevent="finishEditTitle"
                        @keydown.escape.prevent="editingTitle = false"
                    >
                </div>
                <div v-else class="flex items-center gap-2 group">
                    <h1 class="text-xl font-bold truncate">
                        {{ storage.card_title || '未设置标题' }}
                    </h1>
                    <button
                        v-if="showEditButton"
                        class="btn btn-xs btn-ghost opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        type="button"
                        @click="startEditTitle"
                    >
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        <!-- 个人简介 -->
        <div class="space-y-2">
            <div class="flex items-center justify-between">
                <p class="text-sm font-medium text-base-content/60">
                    个人简介
                </p>
                <div class="flex gap-2">
                    <button
                        v-if="showEditButton && !editingProfile"
                        class="btn btn-xs btn-ghost"
                        type="button"
                        @click="editingProfile = true"
                    >
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        编辑
                    </button>
                    <template v-if="editingProfile">
                        <button class="btn btn-xs btn-ghost" type="button" @click="editingProfile = false">
                            取消
                        </button>
                        <button
                            class="btn btn-xs btn-primary"
                            type="button"
                            :disabled="storageSaving"
                            @click="saveProfile"
                        >
                            <span v-if="storageSaving" class="loading loading-spinner loading-xs" />
                            保存
                        </button>
                    </template>
                </div>
            </div>

            <textarea
                v-if="editingProfile"
                v-model="storage.card_profile"
                class="textarea textarea-bordered w-full h-40 font-mono text-sm"
                placeholder="支持 Markdown 格式..."
            />
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div
                v-else-if="renderedProfile"
                class="prose prose-sm max-w-none"
                v-html="renderedProfile"
            />
        </div>
    </div>
</template>
