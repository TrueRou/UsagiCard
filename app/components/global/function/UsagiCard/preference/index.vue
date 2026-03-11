<script setup lang="ts">
const props = defineProps<{
    artifact: ArtifactUserResponse
}>()
const { storageSave, storageSaving } = await useArtifact(props.artifact.id)
const { restartTour } = useTour(toRef(props, 'artifact'), storageSave)
const { user, loggedIn } = useUserSession()

const artifactRef = toRef(props, 'artifact')
const { tabConfigs } = useFunction(artifactRef)
const { qButtonTabs } = useQButton(artifactRef)

const allFunctionTabItems = computed(() => {
    const items: Record<string, { from: string, label: string, component: string }> = {}
    for (const tc of tabConfigs.value ?? []) {
        Object.entries(tc.items).forEach(([key, val]) => {
            if (!val.hidden)
                items[key] = { from: tc.label, ...val }
        })
    }
    return items
})

const storage = ref<UsagiCardStorage>({
    secondary_auth_enabled: false,
    secondary_auth_policy: 'private',
    secondary_auth_users: [],
    ...props.artifact.storage,
})

const authPolicies = [
    {
        value: 'private' as const,
        label: '私有',
        description: '只有授权用户可以访问此卡片',
    },
    {
        value: 'public_read' as const,
        label: '公开只读',
        description: '任何人都可以访问此卡片，但只有授权用户可以修改',
    },
    {
        value: 'public_read_write' as const,
        label: '公开读写',
        description: '任何人都可以访问和修改此卡片',
    },
]

const derivedBehaviors = [
    {
        value: 'none' as const,
        label: '不处理',
        description: '忽略派生关系，直接使用本工件的内容',
    },
    {
        value: 'redirect' as const,
        label: '重定向',
        description: '自动重定向到源工件，始终跟随源工件的最新内容',
    },
]

const newUserId = ref('')
const addUserError = ref('')
const showAddUserDialog = ref(false)

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function openUserDialog() {
    const notificationStore = useNotificationsStore()
    if (!loggedIn.value) {
        notificationStore.addNotification({
            type: 'warning',
            message: '请先登录再进行此操作',
        })
        return
    }
    showAddUserDialog.value = true
}

function closeUserDialog() {
    showAddUserDialog.value = false
    newUserId.value = ''
    addUserError.value = ''
}

function addUser(id?: string) {
    const target = (id ?? newUserId.value).trim()
    addUserError.value = ''
    if (!target) {
        addUserError.value = '请输入用户 ID'
        return
    }
    if (!UUID_RE.test(target)) {
        addUserError.value = '格式无效，请输入合法的 UUID'
        return
    }
    const list = storage.value.secondary_auth_users ?? []
    if (list.includes(target)) {
        addUserError.value = '该用户已在列表中'
        return
    }
    storage.value.secondary_auth_users = [...list, target]
    newUserId.value = ''
    if (id === undefined) {
        closeUserDialog()
    }
}

function removeUser(id: string) {
    storage.value.secondary_auth_users = (storage.value.secondary_auth_users ?? []).filter(u => u !== id)
}
</script>

<template>
    <form class="space-y-4" @submit.prevent="storageSave(storage)">
        <!-- 默认标签页 -->
        <div class="divider my-2">
            默认标签页
        </div>
        <div class="grid gap-4 md:grid-cols-2">
            <!-- 默认功能标签页 -->
            <div class="form-control flex flex-col gap-2 rounded-lg px-4 py-3">
                <label>
                    <p class="font-medium text-sm">
                        默认功能标签页
                    </p>
                    <p class="text-xs text-base-content/60">
                        打开功能面板时默认显示的标签页
                    </p>
                </label>
                <select v-model="storage.default_function_tab" class="select select-bordered w-full">
                    <option v-for="(val, key) in allFunctionTabItems" :key="key" :value="key">
                        {{ `${val.from} - ${val.label}` }}
                    </option>
                </select>
            </div>

            <!-- 默认快捷功能标签页 -->
            <div class="form-control flex flex-col gap-2 rounded-lg px-4 py-3">
                <label>
                    <p class="font-medium text-sm">
                        默认快捷功能标签页
                    </p>
                    <p class="text-xs text-base-content/60">
                        打开快捷功能面板时默认显示的标签页
                    </p>
                </label>
                <select
                    v-model="storage.default_qbutton_tab"
                    class="select select-bordered w-full"
                    :disabled="!qButtonTabs || Object.keys(qButtonTabs).length === 0"
                >
                    <option v-for="(val, key) in qButtonTabs" :key="key" :value="key">
                        {{ `${val.from} - ${val.label}` }}
                    </option>
                </select>
            </div>
        </div>

        <!-- 授权用户 -->
        <div class="divider my-2">
            二级认证
        </div>
        <!-- 访问控制 -->
        <div class="grid gap-4 md:grid-cols-2">
            <!-- 启用二级认证 -->
            <div class="form-control flex items-center justify-between gap-4 rounded-lg px-4 py-2 md:col-span-2">
                <div>
                    <p class="font-medium text-sm">
                        启用二级认证
                    </p>
                    <p class="text-xs text-base-content/60">
                        开启后，仅允许授权用户访问卡片
                    </p>
                </div>
                <input
                    v-model="storage.secondary_auth_enabled"
                    class="toggle toggle-primary"
                    type="checkbox"
                >
            </div>
        </div>

        <!-- 二级认证详细配置 -->
        <template v-if="storage.secondary_auth_enabled">
            <div v-if="storage.secondary_auth_enabled" class="grid gap-4 md:grid-cols-3">
                <div
                    v-for="policy in authPolicies"
                    :key="policy.value"
                    class="form-control rounded-lg px-4 py-3 cursor-pointer"
                    :class="storage.secondary_auth_policy === policy.value ? 'outline-2 outline-primary' : ''"
                    @click="storage.secondary_auth_policy = policy.value"
                >
                    <label class="flex items-center gap-3 cursor-pointer">
                        <input
                            v-model="storage.secondary_auth_policy"
                            class="radio radio-primary"
                            type="radio"
                            :value="policy.value"
                        >
                        <div>
                            <p class="font-medium text-sm">
                                {{ policy.label }}
                            </p>
                            <p class="text-xs text-base-content/60">
                                {{ policy.description }}
                            </p>
                        </div>
                    </label>
                </div>
            </div>

            <div class="form-control flex flex-col gap-2 rounded-lg px-4">
                <div class="flex items-center justify-between">
                    <label>
                        <p class="font-medium text-sm">
                            授权用户
                        </p>
                        <p class="text-xs text-base-content/60">
                            管理可以访问此卡片的用户
                        </p>
                    </label>
                    <!-- 添加用户按钮 -->
                    <button
                        class="btn btn-outline btn-sm"
                        type="button"
                        @click="openUserDialog()"
                    >
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        <span>添加</span>
                    </button>
                </div>
                <div class="flex flex-col gap-2">
                    <!-- 已有用户列表 -->
                    <div
                        v-for="uid in (storage.secondary_auth_users ?? [])"
                        :key="uid"
                        class="flex items-center justify-between gap-3 rounded-lg px-4 py-3 bg-base-200"
                    >
                        <span class="font-mono text-sm break-all">{{ uid }}</span>
                        <button
                            class="btn btn-ghost btn-sm btn-circle text-error shrink-0"
                            type="button"
                            @click="removeUser(uid)"
                        >
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </template>

        <!-- 派生行为（仅 derived_from 非空时显示） -->
        <template v-if="storage.derived_from">
            <div class="divider my-2">
                派生行为
            </div>

            <div class="grid gap-4 md:grid-cols-2">
                <div
                    v-for="behavior in derivedBehaviors"
                    :key="behavior.value"
                    class="form-control rounded-lg px-4 py-3 cursor-pointer"
                    :class="storage.derived_behavior === behavior.value ? 'outline-2 outline-primary' : ''"
                    @click="storage.derived_behavior = behavior.value"
                >
                    <label class="flex items-center gap-3 cursor-pointer">
                        <input
                            v-model="storage.derived_behavior"
                            class="radio radio-primary"
                            type="radio"
                            :value="behavior.value"
                        >
                        <div>
                            <p class="font-medium text-sm">
                                {{ behavior.label }}
                            </p>
                            <p class="text-xs text-base-content/60">
                                {{ behavior.description }}
                            </p>
                        </div>
                    </label>
                </div>
            </div>
        </template>

        <footer class="flex justify-between">
            <button class="btn btn-ghost btn-sm" type="button" @click="restartTour()">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                重新开始引导
            </button>
            <button class="btn btn-primary w-full md:w-auto" type="submit" :disabled="storageSaving">
                <span v-if="storageSaving" class="loading loading-spinner" />
                <span>保存修改</span>
            </button>
        </footer>
    </form>

    <!-- 添加用户对话框 -->
    <dialog v-if="showAddUserDialog" class="modal modal-open">
        <div class="modal-box max-w-2xl">
            <!-- 关闭按钮 -->
            <form method="dialog">
                <button
                    class="btn btn-sm btn-circle btn-ghost absolute right-4 top-4"
                    type="button"
                    @click="closeUserDialog()"
                >
                    ✕
                </button>
            </form>

            <!-- 标题 -->
            <h3 class="font-semibold text-lg mb-4">
                添加授权用户
            </h3>

            <!-- 表单内容 -->
            <div class="space-y-4">
                <!-- 手动输入用户 ID -->
                <div>
                    <label class="block text-sm font-medium mb-2">
                        用户 ID
                    </label>
                    <input
                        v-model="newUserId"
                        class="input input-bordered w-full"
                        :class="{ 'input-error': addUserError }"
                        type="text"
                        placeholder="输入用户的 ID"
                        @keydown.enter.prevent="addUser()"
                    >
                    <p v-if="addUserError" class="text-error text-sm mt-1">
                        {{ addUserError }}
                    </p>
                </div>
            </div>

            <!-- 操作按钮 -->
            <div class="flex justify-between">
                <div class="modal-action">
                    <button :disabled="!loggedIn || !user || (storage.secondary_auth_users ?? []).includes(user.id)" class="btn" type="button" @click="addUser(user?.id)">
                        添加当前账号
                    </button>
                </div>
                <div class="modal-action">
                    <button class="btn" type="button" @click="closeUserDialog()">
                        取消
                    </button>
                    <button class="btn btn-primary" type="button" @click="addUser()">
                        添加
                    </button>
                </div>
            </div>
        </div>
    </dialog>
</template>
