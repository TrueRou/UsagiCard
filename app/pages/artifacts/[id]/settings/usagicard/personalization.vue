<script setup lang="ts">
const route = useRoute()
const artifactId = route.params.id as string
const { artifact, storageOf, storageSave, storageSaving } = await useArtifact(artifactId)

const storage = ref<UsagiCardStorage>({
    ...storageOf('UsagiCard').value,
})
const menuStorage = computed(() => storage.value.menu ?? {})

const functionTypes = computed(() => artifact.value.product.type.function_types)
const functionPages = computed(() => getEnabledFunctionPages(functionTypes.value))
const { configurablePageItems, customMenuKeys, userCustomized } = useFunctionMenu(functionPages, computed(() => menuStorage.value))

const draftMenuKeys = ref<string[]>([])
const draftUsesSystemDefault = ref(false)
const draggingMenuKey = ref<string | null>(null)

watch([customMenuKeys, configurablePageItems], () => {
    draftUsesSystemDefault.value = !userCustomized.value
    draftMenuKeys.value = userCustomized.value
        ? [...customMenuKeys.value]
        : configurablePageItems.value.map(item => item.key)
}, { immediate: true })

const configurablePageMap = computed(() => new Map(configurablePageItems.value.map(item => [item.key, item])))
const draftMenuItems = computed(() => draftMenuKeys.value
    .map(key => configurablePageMap.value.get(key))
    .filter((item): item is NonNullable<typeof item> => Boolean(item)))
const availableMenuItems = computed(() => configurablePageItems.value.filter(item => !draftMenuKeys.value.includes(item.key)))

async function saveMenu() {
    const availableKeys = new Set(configurablePageItems.value.map(item => item.key))
    menuStorage.value.menu_tabs = draftUsesSystemDefault.value
        ? []
        : draftMenuKeys.value.filter(key => availableKeys.has(key))
    await storageSave('UsagiCard', storage.value, { showSuccessToast: false })
}

async function addMenuItem(key: string) {
    draftUsesSystemDefault.value = false
    if (!draftMenuKeys.value.includes(key))
        draftMenuKeys.value = [...draftMenuKeys.value, key]
    await saveMenu()
}

async function removeMenuItem(key: string) {
    draftUsesSystemDefault.value = false
    draftMenuKeys.value = draftMenuKeys.value.filter(itemKey => itemKey !== key)
    await saveMenu()
}

async function resetMenuItems() {
    draftUsesSystemDefault.value = true
    draftMenuKeys.value = configurablePageItems.value.map(item => item.key)
    menuStorage.value.menu_tabs = []
    await storageSave('UsagiCard', storage.value, { showSuccessToast: false })
}

function onMenuDragStart(key: string) {
    draggingMenuKey.value = key
}

function onMenuDragOver(event: DragEvent) {
    event.preventDefault()
}

async function onMenuDrop(targetKey: string) {
    const sourceKey = draggingMenuKey.value
    draggingMenuKey.value = null
    if (!sourceKey || sourceKey === targetKey)
        return

    const nextKeys = [...draftMenuKeys.value]
    const fromIndex = nextKeys.indexOf(sourceKey)
    const toIndex = nextKeys.indexOf(targetKey)
    if (fromIndex < 0 || toIndex < 0)
        return

    const [item] = nextKeys.splice(fromIndex, 1)
    if (!item)
        return

    nextKeys.splice(toIndex, 0, item)
    draftUsesSystemDefault.value = false
    draftMenuKeys.value = nextKeys
    await saveMenu()
}
</script>

<template>
    <div class="p-4 space-y-5">
        <section class="rounded-xl border border-base-300 p-4 space-y-4">
            <div class="flex items-center justify-between gap-3">
                <div>
                    <p class="font-medium text-sm">
                        菜单栏
                    </p>
                    <p class="text-xs text-base-content/60">
                        拖拽调整常用功能的显示顺序。我的卡片固定在菜单末尾。
                    </p>
                </div>
                <div class="flex items-center gap-2">
                    <span v-if="storageSaving" class="loading loading-spinner loading-xs" />
                    <button class="btn btn-ghost btn-sm" type="button" @click="resetMenuItems">
                        恢复默认
                    </button>
                </div>
            </div>

            <div class="space-y-2">
                <div
                    v-for="item in draftMenuItems"
                    :key="item.key"
                    draggable="true"
                    class="flex items-center gap-3 rounded-lg bg-base-200/70 px-3 py-2.5 cursor-move transition-all"
                    :class="draggingMenuKey === item.key ? 'opacity-50 ring-2 ring-primary/30' : ''"
                    @dragstart="onMenuDragStart(item.key)"
                    @dragover="onMenuDragOver"
                    @drop="onMenuDrop(item.key)"
                    @dragend="draggingMenuKey = null"
                >
                    <Icon name="mdi:drag" class="w-5 h-5 text-base-content/40" />
                    <Icon :name="item.icon || 'mdi:circle-outline'" class="w-5 h-5 text-base-content/60" />
                    <div class="min-w-0 flex-1">
                        <p class="text-sm font-medium truncate">
                            {{ item.label }}
                        </p>
                    </div>
                    <button class="btn btn-ghost btn-sm btn-square text-error" type="button" @click="removeMenuItem(item.key)">
                        <Icon name="mdi:minus" class="w-5 h-5" />
                    </button>
                </div>
                <div v-if="draftMenuItems.length === 0" class="rounded-lg border border-dashed border-base-300 px-4 py-6 text-center text-sm text-base-content/50">
                    菜单栏暂时没有自定义功能
                </div>
            </div>
        </section>

        <section class="rounded-xl border border-base-300 p-4 space-y-3">
            <div>
                <p class="font-medium text-sm">
                    可添加功能
                </p>
                <p class="text-xs text-base-content/60">
                    添加后会自动保存到菜单栏
                </p>
            </div>
            <div class="grid gap-2 sm:grid-cols-2">
                <button v-for="item in availableMenuItems" :key="item.key" class="btn btn-outline justify-start" type="button" @click="addMenuItem(item.key)">
                    <Icon :name="item.icon || 'mdi:circle-outline'" class="w-5 h-5" />
                    <span>{{ item.label }}</span>
                </button>
            </div>
            <p v-if="availableMenuItems.length === 0" class="text-sm text-base-content/50">
                所有可配置功能都已经在菜单栏中。
            </p>
        </section>
    </div>
</template>
