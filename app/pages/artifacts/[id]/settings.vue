<script setup lang="ts">
definePageMeta({
    layout: 'full-page',
})

const route = useRoute()
const router = useRouter()
const artifactId = route.params.id as string
const { artifact, needsActivation } = await useArtifact(artifactId)

// 尚未激活的卡片需先在主页申领或跳过申领
if (needsActivation.value)
    await navigateTo(`/artifacts/${artifactId}`, { replace: true })

const settingItems = computed(() => getEnabledFunctionSettings(artifact.value.type.function_types))
const activeSetting = computed(() => settingItems.value.find(item => item.path(artifactId) === route.path))

const { loggedIn, user } = useUserSession()
const claimedByMe = computed(() => loggedIn.value && artifact.value.user_id === user.value?.id)

async function handleLogin() {
    await navigateTo(loginURL(route.fullPath), { external: true })
}

async function handleLogout() {
    await logout()
}

function goBack() {
    if (route.path === `/artifacts/${artifactId}/settings`)
        router.push(`/artifacts/${artifactId}/functions/usagicard/me`)
    else
        router.push(`/artifacts/${artifactId}/settings`)
}
</script>

<template>
    <div class="h-full flex-1 min-w-0 bg-base-100 overflow-y-auto lg:ml-16">
        <div class="min-h-full w-full lg:mx-auto lg:w-[min(100%,56rem)] xl:w-[min(100%,64rem)]">
            <div class="sticky top-0 z-10 bg-base-100 border-b border-base-300/50 px-4 py-3 flex items-center gap-3">
                <button class="btn btn-ghost btn-sm btn-square" @click="goBack">
                    <Icon name="mdi:arrow-left" class="w-5 h-5" />
                </button>
                <h3 class="text-base font-semibold truncate">
                    {{ activeSetting?.label || '设置' }}
                </h3>
            </div>

            <div v-if="route.path === `/artifacts/${artifactId}/settings`" class="p-4 space-y-4">
                <section class="rounded-xl border border-base-300/60 p-3 flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-base-200 flex items-center justify-center text-base-content/50 shrink-0">
                        <Icon name="mdi:account" class="w-6 h-6" />
                    </div>
                    <div class="flex-1 min-w-0">
                        <template v-if="loggedIn">
                            <p class="text-sm font-medium truncate">
                                {{ user?.username }}
                            </p>
                            <p class="text-xs text-base-content/50 truncate">
                                {{ claimedByMe ? '这张卡片已绑定到你的账号' : (artifact.user_id ? '这张卡片已绑定到其他账号' : '这张卡片未绑定账号') }}
                            </p>
                        </template>
                        <template v-else>
                            <p class="text-sm font-medium">
                                未登录
                            </p>
                            <p class="text-xs text-base-content/50 truncate">
                                登录 UsagiLab 账号
                            </p>
                        </template>
                    </div>
                    <button v-if="loggedIn" type="button" class="btn btn-outline btn-sm" @click="handleLogout">
                        登出
                    </button>
                    <button v-else type="button" class="btn btn-primary btn-sm" @click="handleLogin">
                        登录
                    </button>
                </section>

                <section class="space-y-1">
                    <button
                        v-for="item in settingItems"
                        :key="item.key"
                        class="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-base-200/60 active:scale-[0.98] transition-all text-left"
                        @click="router.push(item.path(artifactId))"
                    >
                        <Icon :name="item.icon || 'mdi:cog-outline'" class="w-5 h-5 text-base-content/60 shrink-0" />
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium truncate">
                                {{ item.label }}
                            </p>
                            <p class="text-xs text-base-content/50 truncate">
                                {{ item.description }}
                            </p>
                        </div>
                        <Icon name="mdi:chevron-right" class="w-4 h-4 text-base-content/30" />
                    </button>
                </section>
            </div>

            <NuxtPage v-else />
        </div>
    </div>
</template>
