<script setup lang="ts">
import { marked } from 'marked'

const props = defineProps<{
    artifact: ArtifactUserResponse
}>()

const { storageSave, storageSaving } = await useArtifact(props.artifact.id)
const { loggedIn, user } = useUserSession()
const { img } = useUtils()

const storage = ref<UsagiCardStorage>({
    ...props.artifact.storage,
})

// ---- edit mode ----
const editing = ref(false)
const titleInput = ref<HTMLInputElement>()

function startEdit() {
    editing.value = true
    nextTick(() => titleInput.value?.focus())
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
const renderedProfile = computed(() => {
    if (!storage.value.card_profile)
        return ''
    return marked.parse(storage.value.card_profile) as string
})

async function saveAll() {
    editing.value = false
    await storageSave(storage.value)
}

const showEditButton = computed(() => {
    const cardStorage = props.artifact.storage as UsagiCardStorage
    if (cardStorage.secondary_auth_enabled && cardStorage.secondary_auth_policy) {
        if (cardStorage.secondary_auth_policy === 'private' || cardStorage.secondary_auth_policy === 'public_read') {
            const isAuthorized = loggedIn.value && (cardStorage.secondary_auth_users ?? []).includes(user.value?.id ?? 'UNKNOWN')
            if (!isAuthorized)
                return false
        }
    }
    return true
})
const { copy, copied } = useClipboard()
</script>

<template>
    <div class="space-y-6">
        <ImageSelector :selector-ctx="imageSelectorCtx" />

        <!-- 个人简介（含头像、标题、简介） -->
        <div class="space-y-3">
            <div class="flex items-center justify-between">
                <p class="text-sm font-medium text-base-content/60">
                    卡片 BIO
                </p>
                <div class="flex gap-2">
                    <button
                        v-if="showEditButton && !editing"
                        class="btn btn-xs btn-ghost"
                        type="button"
                        @click="startEdit"
                    >
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        编辑
                    </button>
                    <template v-if="editing">
                        <button class="btn btn-xs btn-ghost" type="button" @click="editing = false">
                            取消
                        </button>
                        <button
                            class="btn btn-xs btn-primary"
                            type="button"
                            :disabled="storageSaving"
                            @click="saveAll"
                        >
                            <span v-if="storageSaving" class="loading loading-spinner loading-xs" />
                            保存
                        </button>
                    </template>
                </div>
            </div>

            <!-- 编辑模式 -->
            <template v-if="editing">
                <div class="flex items-center gap-4">
                    <div class="relative shrink-0">
                        <div class="w-16 h-16 rounded-full overflow-hidden border-2 border-base-200 bg-base-200 flex items-center justify-center">
                            <img
                                v-if="storage.card_avatar"
                                :src="img(storage.card_avatar)"
                                alt="头像"
                                class="w-full h-full object-cover"
                            >
                            <svg v-else class="w-7 h-7 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <button
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
                    <input
                        ref="titleInput"
                        v-model="storage.card_title"
                        class="input input-bordered flex-1 font-bold"
                        type="text"
                        placeholder="卡片标题"
                    >
                </div>
                <textarea
                    v-model="storage.card_profile"
                    class="textarea textarea-bordered w-full h-40 font-mono text-sm"
                    placeholder="支持 Markdown 格式..."
                />
            </template>

            <!-- 预览模式 -->
            <template v-else>
                <div v-if="storage.card_avatar || storage.card_title" class="flex items-center gap-4">
                    <div v-if="storage.card_avatar" class="w-16 h-16 rounded-full overflow-hidden border-2 border-base-200 shrink-0">
                        <img
                            :src="img(storage.card_avatar)"
                            alt="头像"
                            class="w-full h-full object-cover"
                        >
                    </div>
                    <h1 v-if="storage.card_title" class="text-xl font-bold truncate">
                        {{ storage.card_title }}
                    </h1>
                </div>
                <!-- eslint-disable-next-line vue/no-v-html -->
                <div
                    v-if="renderedProfile"
                    class="prose prose-sm max-w-none"
                    v-html="renderedProfile"
                />
            </template>
        </div>

        <!-- 卡片 UUID -->
        <div class="space-y-1">
            <p class="text-sm font-medium text-base-content/60">
                卡片 UUID
            </p>
            <button
                class="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-base-200 hover:bg-base-300 active:scale-95 transition-all font-mono text-xs text-base-content/60 text-left"
                :title="copied ? '已复制' : '点击复制 UUID'"
                type="button"
                @click="copy(artifact.id)"
            >
                <span class="flex-1 truncate">{{ artifact.id }}</span>
                <svg v-if="!copied" class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <svg v-else class="w-3.5 h-3.5 shrink-0 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </button>
        </div>
    </div>
</template>
