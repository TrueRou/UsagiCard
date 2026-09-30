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
const { artifact, storageOf } = await useArtifact(artifactId)

useHead({
    title: `${artifact.value.type.name} - 兔兔实验室`,
})

const pageItems = computed(() => getEnabledFunctionPages(artifact.value.type.function_types))
const usagiCardMenu = computed(() => storageOf('UsagiCard').value.menu)
const { visibleNavItems } = useFunctionMenu(pageItems, usagiCardMenu)
const swipeEnabled = computed(() => usagiCardMenu.value?.swipe?.enabled_mode === 'on')

const activePageKey = computed(() => {
    const currentPath = route.path
    return visibleNavItems.value.find(item => item.path(artifactId) === currentPath)?.key
})
const activePageIndex = computed(() => visibleNavItems.value.findIndex(item => item.key === activePageKey.value))

const swipeStart = ref<{ x: number, y: number, pointerId: number } | null>(null)
const swipeTracking = ref(false)
const SWIPE_DISTANCE = 72
const SWIPE_DIRECTION_RATIO = 1.5

function handlePageSwap(path: string) {
    router.push(path)
}

function isMobileViewport() {
    return import.meta.client && window.matchMedia('(max-width: 1023px)').matches
}

function shouldIgnoreSwipeTarget(target: EventTarget | null) {
    return target instanceof Element && Boolean(target.closest('button, a, input, textarea, select, [role="button"], [data-no-swipe]'))
}

function onSwipePointerDown(event: PointerEvent) {
    if (!swipeEnabled.value || !isMobileViewport() || event.pointerType === 'mouse' || shouldIgnoreSwipeTarget(event.target))
        return
    swipeStart.value = { x: event.clientX, y: event.clientY, pointerId: event.pointerId }
    swipeTracking.value = true
}

function onSwipePointerMove(event: PointerEvent) {
    const start = swipeStart.value
    if (!start || start.pointerId !== event.pointerId)
        return
    const deltaX = event.clientX - start.x
    const deltaY = event.clientY - start.y
    swipeTracking.value = Math.abs(deltaX) > Math.abs(deltaY) * SWIPE_DIRECTION_RATIO
}

function onSwipePointerEnd(event: PointerEvent) {
    const start = swipeStart.value
    if (!start || start.pointerId !== event.pointerId)
        return

    swipeStart.value = null
    const canSwipe = swipeTracking.value
    swipeTracking.value = false
    if (!canSwipe)
        return

    const deltaX = event.clientX - start.x
    const deltaY = event.clientY - start.y
    if (Math.abs(deltaX) < SWIPE_DISTANCE || Math.abs(deltaX) <= Math.abs(deltaY) * SWIPE_DIRECTION_RATIO)
        return

    const currentIndex = activePageIndex.value
    if (currentIndex < 0)
        return
    if (currentIndex === 0 && deltaX > 0) {
        router.push({ path: `/artifacts/${artifactId}` })
        return
    }

    const nextIndex = deltaX < 0 ? currentIndex + 1 : currentIndex - 1
    const nextItem = visibleNavItems.value[nextIndex]
    if (nextItem)
        handlePageSwap(nextItem.path(artifactId))
}

function onSwipePointerCancel() {
    swipeStart.value = null
    swipeTracking.value = false
}

function goBack() {
    router.push({ path: `/artifacts/${artifactId}` })
}

const activePageLabel = computed(() => visibleNavItems.value.find(item => item.key === activePageKey.value)?.label ?? '')
</script>

<template>
    <div class="h-full w-full flex flex-col">
        <aside class="hidden lg:flex flex-col items-center w-16 h-full bg-base-200/50 border-r border-base-300/50 py-4 gap-1 fixed left-0 top-0 z-40">
            <button
                class="btn btn-ghost btn-sm btn-square mb-3 tooltip tooltip-right"
                data-tip="返回卡面"
                @click="goBack"
            >
                <Icon name="mdi:arrow-left" class="w-5 h-5" />
            </button>

            <div class="divider my-0 mx-2" />

            <button
                v-for="item in visibleNavItems"
                :key="item.key"
                class="flex flex-col items-center gap-0.5 w-14 py-2 rounded-lg transition-colors"
                :class="[
                    activePageKey === item.key
                        ? 'bg-primary/10 text-primary'
                        : 'text-base-content/60 hover:bg-base-300/50 hover:text-base-content',
                ]"
                @click="handlePageSwap(item.path(artifactId))"
            >
                <Icon :name="item.icon || 'mdi:circle-outline'" class="w-5 h-5" />
                <span class="text-[10px] leading-tight">{{ item.label }}</span>
            </button>
        </aside>

        <header class="sticky top-0 z-30 relative flex items-center h-14 px-2 lg:pl-20 pr-3 border-b border-base-300/50 bg-base-100/90 backdrop-blur shrink-0">
            <button
                class="btn btn-ghost btn-sm btn-square shrink-0"
                title="返回主页"
                aria-label="返回主页"
                @click="goBack"
            >
                <Icon name="mdi:arrow-left" class="w-5 h-5" />
            </button>
            <span
                v-if="activePageLabel"
                class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[calc(100%-8rem)] text-base font-semibold truncate pointer-events-none"
            >
                {{ activePageLabel }}
            </span>
            <div id="functions-header-slot" class="functions-header-slot ml-auto flex items-center gap-1" />
        </header>

        <main
            class="flex-1 min-h-0 overflow-y-auto pb-18 lg:pb-0 lg:ml-16 touch-pan-y"
            @pointerdown="onSwipePointerDown"
            @pointermove="onSwipePointerMove"
            @pointerup="onSwipePointerEnd"
            @pointercancel="onSwipePointerCancel"
        >
            <div class="min-h-full w-full lg:mx-auto lg:w-[min(100%,56rem)] xl:w-[min(100%,64rem)]">
                <NuxtPage v-slot="{ Component, route: pageRoute }">
                    <Transition name="content-fade" mode="out-in">
                        <div :key="pageRoute.fullPath" class="min-h-full">
                            <component :is="Component" />
                        </div>
                    </Transition>
                </NuxtPage>
            </div>
        </main>

        <nav class="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-base-100 border-t border-base-300/50 safe-area-bottom">
            <div class="flex items-center justify-around h-14">
                <button
                    v-for="item in visibleNavItems"
                    :key="item.key"
                    class="flex flex-col items-center gap-0.5 flex-1 py-1.5 transition-colors"
                    :class="[
                        activePageKey === item.key
                            ? 'text-primary'
                            : 'text-base-content/50',
                    ]"
                    @click="handlePageSwap(item.path(artifactId))"
                >
                    <Icon :name="item.icon || 'mdi:circle-outline'" class="w-5 h-5" />
                    <span class="text-[10px] leading-tight">{{ item.label }}</span>
                </button>
            </div>
        </nav>
    </div>
</template>

<style scoped>
.safe-area-bottom {
    padding-bottom: env(safe-area-inset-bottom);
}

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
