<script setup lang="ts">
definePageMeta({
    layout: 'full-page',
})

const route = useRoute()
const router = useRouter()
const artifactId = route.params.id as string
const tabKey = route.query.tab as string | undefined

const { artifact } = await useArtifact(artifactId)
const { tabConfigs, activeTabKey, activeComponent } = useFunction(artifact, tabKey)

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
</script>

<template>
    <div class="w-full h-full flex flex-col lg:flex-row overflow-hidden">
        <!-- 移动端顶部菜单栏 -->
        <div class="lg:hidden w-full bg-base-200 border-b">
            <ul class="menu menu-horizontal bg-base-200">
                <li>
                    <button @click="goBack">
                        <svg data-v-1c88b26a="" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path data-v-1c88b26a="" fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                    </button>
                </li>
                <li v-for="(item, index) in tabConfigs" :key="item.label">
                    <details :ref="el => { if (el) mobileDetailsRefs[index] = el as HTMLDetailsElement }">
                        <summary>
                            <span v-if="item.icon">{{ item.icon }}</span>
                            {{ item.label }}
                        </summary>
                        <ul class="dropdown-content">
                            <li v-for="val, key in item.items" :key="key">
                                <a :class="{ active: activeTabKey === key }" @click="handleTabKeySwap(key)">
                                    <span v-if="val.icon">{{ val.icon }}</span>
                                    {{ val.label }}
                                </a>
                            </li>
                        </ul>
                    </details>
                </li>
            </ul>
        </div>

        <!-- 桌面端侧边菜单栏 -->
        <aside class="hidden lg:block w-64 min-h-full bg-base-200 border-r overflow-y-auto">
            <div class="p-2">
                <ul class="menu menu-compact rounded-box">
                    <li>
                        <button @click="goBack">
                            <svg data-v-1c88b26a="" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path data-v-1c88b26a="" fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>Back
                        </button>
                    </li>
                    <li v-for="item in tabConfigs" :key="item.label">
                        <summary>
                            <span v-if="item.icon">{{ item.icon }}</span>
                            {{ item.label }}
                        </summary>
                        <ul>
                            <li v-for="val, key in item.items" :key="key">
                                <a :class="{ active: activeTabKey === key }" @click="handleTabKeySwap(key)">
                                    <span v-if="val.icon">{{ val.icon }}</span>
                                    {{ val.label }}
                                </a>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        </aside>

        <!-- 主内容区域 -->
        <main class="flex-1 overflow-y-auto bg-base-100">
            <div v-if="activeComponent" class="container mx-auto p-4 lg:p-6">
                <component :is="activeComponent" :artifact="artifact" />
            </div>
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
</style>
