<script setup lang="ts">
import { ProductTypeFunction } from '~/types/api'

const props = defineProps<{
    artifactId: string
}>()

const { artifact, storageOf } = await useArtifact(props.artifactId)
const { img } = useUtils()

const usagiCardStorage = storageOf('UsagiCard')
const hasMaimaiCN = computed(() => artifact.value.type.function_types.includes(ProductTypeFunction.MAIMAI_CN))
const maimaiStorage = computed(() => artifact.value.storage.MaimaiCN)

const pageItems = computed(() => getEnabledFunctionPages(artifact.value.type.function_types))
const { visibleNavItems } = useFunctionMenu(pageItems, computed(() => usagiCardStorage.value.menu))
const functionPageItems = computed(() => visibleNavItems.value.filter(item => item.key !== 'uc-me'))

const router = useRouter()
function navigateToPage(path: string) {
    router.push(path)
}

function openCustomizeMenu() {
    router.push(`/artifacts/${props.artifactId}/settings/usagicard/personalization`)
}

function openSettings() {
    router.push(`/artifacts/${props.artifactId}/settings`)
}

function formatDate(dateStr: string | null | undefined) {
    if (!dateStr)
        return '暂无'
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1)
        return '刚刚'
    if (diffMin < 60)
        return `${diffMin}分钟前`
    const diffHour = Math.floor(diffMin / 60)
    if (diffHour < 24)
        return `${diffHour}小时前`
    const diffDay = Math.floor(diffHour / 24)
    if (diffDay < 7)
        return `${diffDay}天前`
    return d.toLocaleDateString('zh-CN')
}
</script>

<template>
    <div class="p-4 space-y-5">
        <!-- 设置按钮注入到页面头部 -->
        <ClientOnly>
            <Teleport to="#functions-header-slot">
                <span class="functions-header-injected flex-1 min-w-0 text-base font-semibold truncate">我的卡片</span>
                <button
                    class="btn btn-ghost btn-sm btn-square shrink-0"
                    title="设置"
                    aria-label="设置"
                    @click="openSettings"
                >
                    <Icon name="mdi:cog-outline" class="w-5 h-5" />
                </button>
            </Teleport>
        </ClientOnly>

        <!-- 上半部分: 深色卡片摘要 -->
        <div class="rounded-2xl bg-neutral text-neutral-content p-4 space-y-4 shadow-lg">
            <!-- UsagiCard 摘要: 头像 + 标题 -->
            <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-full overflow-hidden bg-neutral-content/10 ring-2 ring-neutral-content/15 shrink-0">
                    <img
                        v-if="usagiCardStorage.bio?.card_avatar"
                        :src="img(usagiCardStorage.bio.card_avatar)"
                        alt="avatar"
                        class="w-full h-full object-cover"
                    >
                    <div v-else class="w-full h-full flex items-center justify-center text-neutral-content/40">
                        <Icon name="mdi:account" class="w-7 h-7" />
                    </div>
                </div>
                <div class="flex-1 min-w-0">
                    <h2 class="text-lg font-semibold truncate">
                        {{ usagiCardStorage.bio?.card_title || artifact.type.name }}
                    </h2>
                    <p class="text-xs text-neutral-content/60 truncate">
                        {{ artifact.type.name }}
                    </p>
                </div>
            </div>

            <!-- MaimaiCN 摘要: Rating + 最近更新 -->
            <div v-if="hasMaimaiCN" class="grid grid-cols-2 gap-2.5">
                <div class="rounded-xl bg-neutral-content/8 px-3 py-2.5">
                    <p class="text-xs text-neutral-content/55 mb-0.5">
                        Rating
                    </p>
                    <p class="text-lg font-bold tabular-nums">
                        {{ maimaiStorage?.bio.player_rating ?? '—' }}
                    </p>
                </div>
                <div class="rounded-xl bg-neutral-content/8 px-3 py-2.5">
                    <p class="text-xs text-neutral-content/55 mb-0.5">
                        最近更新
                    </p>
                    <p class="text-sm font-medium">
                        {{ formatDate(maimaiStorage?.update.last_updated_at) }}
                    </p>
                </div>
            </div>
        </div>

        <!-- 分隔 -->
        <div class="divider my-0" />

        <!-- 下半部分: 子页面入口按钮网格 -->
        <div class="space-y-2">
            <div class="flex items-center justify-between gap-3">
                <p class="text-xs text-base-content/50 font-medium">
                    功能
                </p>
                <button class="btn btn-ghost btn-sm" type="button" @click="openCustomizeMenu">
                    <Icon name="mdi:tune-variant" class="w-4 h-4" />
                    自定义
                </button>
            </div>
            <div class="grid grid-cols-4 gap-2">
                <button
                    v-for="item in functionPageItems"
                    :key="item.key"
                    class="flex flex-col items-center gap-1 p-3 rounded-xl bg-base-200/50 hover:bg-base-300/50 active:scale-95 transition-all"
                    @click="navigateToPage(item.path(artifactId))"
                >
                    <Icon :name="item.icon || 'mdi:circle-outline'" class="w-5 h-5 text-base-content/70" />
                    <span class="text-[11px] text-base-content/70 leading-tight text-center">{{ item.label }}</span>
                </button>
            </div>
        </div>
    </div>
</template>
