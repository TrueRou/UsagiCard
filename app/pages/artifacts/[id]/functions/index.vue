<script setup lang="ts">
import BattleDialog from '~/components/global/function/MaimaiCN/battle/dialog.vue'
import { useBattle } from '~/composables/function/MaimaiCN/useBattle'

definePageMeta({
    layout: 'full-page',
    pageTransition: {
        name: 'function-page',
        mode: 'out-in',
    },
})

const route = useRoute()
const router = useRouter()
const artifactId = route.params.id as string
const tabKey = route.query.tab as string | undefined

const { artifact, storageOf, storageSave, secondaryPinDialogOpen, secondaryPinArtifactId, handleSecondaryPinVerified, handleSecondaryPinClose } = await useArtifact(artifactId)
const maimaiBattle = artifact.value.product.type.function_types.includes(ProductTypeFunction.MaimaiCN)
    ? useBattle(artifactId, storageOf('MaimaiCN'), storageSave)
    : {
            activeBattle: ref(null),
            attemptNearbyMatch: async () => null,
            closeBattleDialog: () => {},
            dialogOpen: ref(false),
            resumeActiveBattle: async () => {},
        }
const {
    activeBattle,
    attemptNearbyMatch,
    closeBattleDialog,
    dialogOpen,
    resumeActiveBattle,
} = maimaiBattle

useHead({
    title: `${artifact.value.product.type.name} - 兔兔实验室`,
})

const storageDefaultTab = storageOf('UsagiCard').value.menu?.default_function_tab ?? undefined
const { tabConfigs, activeTabKey, activeComponent } = useFunction(artifact, tabKey || storageDefaultTab)

const { startPhase2 } = useTour(artifact, storageOf, storageSave)

async function handleMaimaiUpdateComplete() {
    await attemptNearbyMatch()
}

onMounted(() => {
    if (route.query.tour === 'continue') {
        setTimeout(() => startPhase2(key => (activeTabKey.value = key)), 400)
    }
    void resumeActiveBattle()
})

// 扁平化所有 tab 项用于导航栏渲染
const navItems = computed(() => {
    const items: Array<{ key: string, label: string, icon?: string }> = []
    for (const config of tabConfigs.value ?? []) {
        Object.entries(config.items).forEach(([key, val]) => {
            if (!val.hidden) {
                items.push({ key, label: val.label, icon: val.icon })
            }
        })
    }
    return items
})

function handleTabKeySwap(key: string) {
    activeTabKey.value = key
    router.push({ query: { tab: key } })
}

function goBack() {
    router.push({ path: `/artifacts/${artifactId}` })
}
</script>

<template>
    <div class="h-full w-full flex flex-col lg:flex-row">
        <!-- 桌面端：左侧精简导航栏 -->
        <aside class="hidden lg:flex flex-col items-center w-16 h-full bg-base-200/50 border-r border-base-300/50 py-4 gap-1 fixed left-0 top-0 z-40">
            <!-- 返回按钮 -->
            <button
                class="btn btn-ghost btn-sm btn-square mb-3 tooltip tooltip-right"
                data-tip="返回卡面"
                @click="goBack"
            >
                <Icon name="mdi:arrow-left" class="w-5 h-5" />
            </button>

            <div class="divider my-0 mx-2"></div>

            <!-- Tab 导航图标 -->
            <button
                v-for="item in navItems"
                :key="item.key"
                class="flex flex-col items-center gap-0.5 w-14 py-2 rounded-lg transition-colors"
                :class="[
                    activeTabKey === item.key
                        ? 'bg-primary/10 text-primary'
                        : 'text-base-content/60 hover:bg-base-300/50 hover:text-base-content',
                ]"
                @click="handleTabKeySwap(item.key)"
            >
                <Icon :name="item.icon || 'mdi:circle-outline'" class="w-5 h-5" />
                <span class="text-[10px] leading-tight">{{ item.label }}</span>
            </button>
        </aside>

        <!-- 主内容区域 -->
        <main class="flex-1 h-full overflow-y-auto pb-18 lg:pb-0 lg:ml-16">
            <Transition name="content-fade" mode="out-in">
                <component
                    :is="activeComponent"
                    v-if="activeComponent"
                    :key="activeTabKey"
                    :artifact-id="artifactId"
                    @on-maimai-update-complete="handleMaimaiUpdateComplete"
                />
            </Transition>
        </main>

        <!-- 移动端：底部导航栏 -->
        <nav class="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-base-100 border-t border-base-300/50 safe-area-bottom">
            <div class="flex items-center justify-around h-14">
                <button
                    v-for="item in navItems"
                    :key="item.key"
                    class="flex flex-col items-center gap-0.5 flex-1 py-1.5 transition-colors"
                    :class="[
                        activeTabKey === item.key
                            ? 'text-primary'
                            : 'text-base-content/50',
                    ]"
                    @click="handleTabKeySwap(item.key)"
                >
                    <Icon :name="item.icon || 'mdi:circle-outline'" class="w-5 h-5" />
                    <span class="text-[10px] leading-tight">{{ item.label }}</span>
                </button>
            </div>
        </nav>

        <!-- Battle 对话框 -->
        <BattleDialog
            v-if="activeBattle"
            :open="dialogOpen"
            :battle="activeBattle"
            :artifact-id="artifactId"
            @close="closeBattleDialog"
        />

        <!-- 二级密码对话框 -->
        <Teleport to="body">
            <SecondaryPinDialog
                v-if="secondaryPinDialogOpen"
                :artifact-id="secondaryPinArtifactId"
                mode="verify"
                @verified="handleSecondaryPinVerified"
                @close="handleSecondaryPinClose"
            />
        </Teleport>
    </div>
</template>

<style scoped>
.safe-area-bottom {
    padding-bottom: env(safe-area-inset-bottom);
}

/* 内容切换过渡效果 */
.content-fade-enter-active,
.content-fade-leave-active {
    transition: opacity 0.15s ease, transform 0.15s ease;
}

.content-fade-enter-from {
    opacity: 0;
    transform: translateY(8px);
}

.content-fade-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}
</style>
