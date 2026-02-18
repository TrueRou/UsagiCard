<script setup lang="ts">
const props = defineProps<{
    artifact: ArtifactUserResponse
}>()
const { storageSave, storageSaving } = await useArtifact(props.artifact.id)
const { user, loggedIn } = useUserSession()

const storage = ref<UsagiCardStorage>({
    secondary_auth_enabled: false,
    secondary_auth_policy: 'private',
    secondary_auth_users: [],
    ...props.artifact.storage,
})

const authPolicies = [
    {
        value: 'private' as const,
        label: '仅授权用户',
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

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

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
}

function removeUser(id: string) {
    storage.value.secondary_auth_users = (storage.value.secondary_auth_users ?? []).filter(u => u !== id)
}
</script>

<template>
    <form class="space-y-4" @submit.prevent="storageSave(storage)">
        <!-- 访问控制标题 -->
        <div class="divider my-2">
            访问控制
        </div>

        <div class="grid gap-4 md:grid-cols-2">
            <!-- 启用二级认证 -->
            <div class="form-control flex items-center justify-between gap-4 rounded-lg px-4 py-3 md:col-span-2">
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

            <!-- 授权用户 -->
            <div class="divider my-2">
                授权用户
            </div>

            <div class="flex flex-col gap-3">
                <!-- 已有用户列表 -->
                <div
                    v-for="uid in (storage.secondary_auth_users ?? [])"
                    :key="uid"
                    class="flex items-center justify-between gap-3 rounded-lg px-4 py-2 bg-base-200"
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

                <!-- 添加用户 -->
                <div class="flex flex-col gap-2">
                    <div class="flex items-center gap-2">
                        <input
                            v-model="newUserId"
                            class="input input-bordered flex-1"
                            :class="addUserError ? 'input-error' : ''"
                            type="text"
                            placeholder="手动输入用户 UUID"
                            @keydown.enter.prevent="addUser()"
                        >
                        <button
                            class="btn btn-outline btn-sm shrink-0"
                            type="button"
                            @click="addUser()"
                        >
                            添加
                        </button>
                    </div>
                    <p v-if="addUserError" class="text-error text-xs">
                        {{ addUserError }}
                    </p>
                    <button
                        v-if="loggedIn && user && !(storage.secondary_auth_users ?? []).includes(user.id)"
                        class="btn btn-ghost btn-sm self-start w-full"
                        type="button"
                        @click="addUser(user.id)"
                    >
                        + 添加当前账号 {{ user.username }} ({{ user.id }})
                    </button>
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

        <footer class="flex justify-end">
            <button class="btn btn-primary w-full md:w-auto" type="submit" :disabled="storageSaving">
                <span v-if="storageSaving" class="loading loading-spinner" />
                <span>保存修改</span>
            </button>
        </footer>
    </form>
</template>
