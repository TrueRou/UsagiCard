<script setup lang="ts">
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

const { artifact, storageOf, storageSave } = await useArtifact(artifactId)

useHead({
    title: `${artifact.value.product.type.name} - 兔兔实验室`,
})

const storageDefaultTab = storageOf('UsagiCard').value?.default_function_tab ?? undefined
const { tabConfigs, activeTabKey, activeComponent } = useFunction(artifact, tabKey || storageDefaultTab)

const currentDocLink = computed<string | null>(() => {
    if (activeTabKey.value) {
        return `/docs/functions/${activeTabKey.value.substring(0, activeTabKey.value.indexOf('-')) || activeTabKey.value}.html`
    }
    return null
})

const { startPhase2 } = useTour(artifact, storageOf, storageSave)

onMounted(() => {
    if (route.query.tour === 'continue') {
        setTimeout(() => startPhase2(key => (activeTabKey.value = key)), 400)
    }
})

const mobileDetailsRefs = ref<HTMLDetailsElement[]>([])

function handleTabKeySwap(tabKey: string) {
    activeTabKey.value = tabKey
    router.push({ query: { tab: tabKey } })

    mobileDetailsRefs.value.forEach((details) => {
        details.open = false
    })
}

function goBack() {
    router.push({ path: `/artifacts/${artifactId}` })
}

// const _pageContainer = useTemplateRef<HTMLElement>('page-container')
// const { lengthX, lengthY } = useSwipe(pageContainer, {
//     threshold: 50,
//     onSwipeEnd(_e, direction) {
//         if (Math.abs(lengthX.value) < Math.abs(lengthY.value) * 1.5)
//             return
//         if (direction === 'right')
//             goBack()
//     },
// })
</script>

<template>
    <div class="w-full h-full flex flex-col lg:flex-row overflow-hidden">
        <!-- 移动端顶部菜单栏 -->
        <div data-tour="fn-menubar" class="lg:hidden w-full bg-base-200 border-b">
            <ul class="menu menu-horizontal bg-base-200 w-full">
                <li>
                    <button @click="goBack">
                        <svg data-v-1c88b26a="" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path data-v-1c88b26a="" fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                    </button>
                </li>
                <li v-for="(item, index) in tabConfigs" :key="item.label">
                    <details :ref="el => { if (el) mobileDetailsRefs[index] = el as HTMLDetailsElement }">
                        <summary class="text-base font-medium">
                            <span v-if="item.icon">{{ item.icon }}</span>
                            {{ item.label }}
                        </summary>
                        <ul class="dropdown-content bg-base-100 shadow-lg rounded-box z-50 mt-4">
                            <template v-for="val, key in item.items" :key="key">
                                <li v-if="!val.hidden">
                                    <a
                                        :class="{ active: activeTabKey === key }"
                                        class="text-base py-3 px-4"
                                        @click="handleTabKeySwap(key)"
                                    >
                                        <span v-if="val.icon">{{ val.icon }}</span>
                                        {{ val.label }}
                                    </a>
                                </li>
                            </template>
                        </ul>
                    </details>
                </li>
                <NavbarUserMenu class="ml-auto" />
            </ul>
        </div>

        <!-- 桌面端侧边菜单栏 -->
        <aside data-tour="fn-menubar" class="hidden lg:flex lg:flex-col w-64 min-h-full bg-base-200 border-r">
            <div class="flex-1 overflow-y-auto p-2">
                <ul class="menu menu-compact rounded-box w-full">
                    <li class="w-full">
                        <button class="w-full justify-start" @click="goBack">
                            <svg data-v-1c88b26a="" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path data-v-1c88b26a="" fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>返回
                        </button>
                    </li>
                    <li v-for="item in tabConfigs" :key="item.label" class="w-full">
                        <details open class="w-full">
                            <summary class="w-full">
                                <span v-if="item.icon">{{ item.icon }}</span>
                                {{ item.label }}
                            </summary>
                            <ul class="w-full">
                                <template v-for="val, key in item.items" :key="key">
                                    <li v-if="!val.hidden" class="w-full">
                                        <a
                                            :data-tour="`tab-${key}`"
                                            :class="{ active: activeTabKey === key }"
                                            class="w-full justify-start"
                                            @click="handleTabKeySwap(key)"
                                        >
                                            <span v-if="val.icon">{{ val.icon }}</span>
                                            {{ val.label }}
                                        </a>
                                    </li>
                                </template>
                            </ul>
                        </details>
                    </li>
                </ul>
            </div>
            <NavbarSidebarUser />
        </aside>

        <!-- 主内容区域 -->
        <main class="flex-1 overflow-y-auto bg-base-100">
            <Transition name="content-fade" mode="out-in">
                <div v-if="activeComponent" :key="activeTabKey" class="container mx-auto p-4 lg:p-6">
                    <component :is="activeComponent" :artifact-id="artifactId" />
                    <div v-if="currentDocLink" data-tour="fn-doc-link" class="flex justify-center my-4">
                        <a :href="currentDocLink" class="text-xs text-base-content/60 underline underline-offset-4 hover:text-primary transition-colors">
                            查看该功能模块的文档
                        </a>
                    </div>
                </div>
            </Transition>
        </main>
    </div>
</template>

<style scoped>
/* 自定义滚动条样式 */
::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

::-webkit-scrollbar-track {
    background: transparent;
}

::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
}

/* 页面进入/退出过渡效果 */
.function-page-enter-active,
.function-page-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.function-page-enter-from {
    opacity: 0;
    transform: translateX(10px);
}

.function-page-leave-to {
    opacity: 0;
    transform: translateX(-10px);
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
