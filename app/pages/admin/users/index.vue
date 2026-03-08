<script setup lang="ts">
const searchParams = reactive({
    keyword: '',
    page_number: 1,
    page_size: 20,
})

const { data: users, refresh } = await useAdminUsers(toRef(() => searchParams))

// Permission editing
const editingUser = ref<{ id: string, username: string, permissions: string[] } | null>(null)
const editPermissions = ref<string[]>([])
const showModal = ref(false)

const allPermissions = [
    { value: UserPermission.USERS_ADMIN, label: '用户管理' },
    { value: UserPermission.IMAGES_ADMIN, label: '图片管理' },
    { value: UserPermission.ARTIFACTS_ADMIN, label: '工件管理' },
    { value: UserPermission.ORDERS_ADMIN, label: '订单管理' },
    { value: UserPermission.PLATFORM_ADMIN, label: '平台管理' },
]

function handleSearch() {
    searchParams.page_number = 1
    refresh()
}

function handlePageChange(page: number) {
    searchParams.page_number = page
    refresh()
}

function openPermissionEditor(user: { id: string, username: string, permissions: string[] }) {
    editingUser.value = user
    editPermissions.value = [...user.permissions]
    showModal.value = true
}

function togglePermission(perm: string) {
    const idx = editPermissions.value.indexOf(perm)
    if (idx >= 0) {
        editPermissions.value.splice(idx, 1)
    }
    else {
        editPermissions.value.push(perm)
    }
}

const isSaving = ref(false)

async function handleSavePermissions() {
    if (!editingUser.value)
        return
    isSaving.value = true
    try {
        await adminUpdateUserPermissions(editingUser.value.id, editPermissions.value)
        showModal.value = false
        await refresh()
    }
    finally {
        isSaving.value = false
    }
}

function formatDateTime(iso: string) {
    return new Date(iso).toLocaleString()
}

useHead({ title: '用户管理' })

definePageMeta({
    layout: 'admin',
    middleware: ['require-admin'],
})
</script>

<template>
    <div>
        <h1 class="text-2xl font-bold mb-6">
            用户管理
        </h1>

        <AdminFilterBar
            :keyword="searchParams.keyword"
            placeholder="搜索用户名/邮箱"
            @update:keyword="searchParams.keyword = $event"
            @search="handleSearch"
        />

        <div class="overflow-x-auto mt-4">
            <table class="table table-sm">
                <thead>
                    <tr>
                        <th>用户名</th>
                        <th>邮箱</th>
                        <th>权限</th>
                        <th>注册时间</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="u in users?.records" :key="u.id">
                        <td class="font-medium">
                            {{ u.username }}
                        </td>
                        <td class="text-sm text-base-content/70">
                            {{ u.email }}
                        </td>
                        <td>
                            <div class="flex flex-wrap gap-1">
                                <span
                                    v-for="perm in u.permissions" :key="perm"
                                    class="badge badge-sm badge-outline"
                                >
                                    {{ perm }}
                                </span>
                                <span v-if="!u.permissions.length" class="text-xs text-base-content/40">
                                    无权限
                                </span>
                            </div>
                        </td>
                        <td class="text-xs text-base-content/60">
                            {{ formatDateTime(u.created_at) }}
                        </td>
                        <td>
                            <button class="btn btn-ghost btn-xs" @click="openPermissionEditor(u)">
                                编辑权限
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div v-if="!users?.records?.length" class="text-center py-12 text-base-content/50">
                暂无用户数据
            </div>
        </div>

        <AdminPagination
            v-if="users"
            :total-pages="users.total_page"
            :current-page="searchParams.page_number"
            @update:current-page="handlePageChange"
        />

        <!-- Permission edit modal -->
        <dialog class="modal" :class="{ 'modal-open': showModal }">
            <div class="modal-box">
                <h3 class="text-lg font-bold">
                    编辑权限
                </h3>
                <p v-if="editingUser" class="text-sm text-base-content/60 mt-1">
                    {{ editingUser.username }}
                </p>
                <div class="mt-4 space-y-2">
                    <label
                        v-for="perm in allPermissions" :key="perm.value"
                        class="flex items-center gap-3 cursor-pointer py-1"
                    >
                        <input
                            type="checkbox"
                            class="checkbox checkbox-sm checkbox-primary"
                            :checked="editPermissions.includes(perm.value)"
                            @change="togglePermission(perm.value)"
                        >
                        <span class="text-sm">{{ perm.label }}</span>
                        <span class="text-xs text-base-content/40 font-mono">{{ perm.value }}</span>
                    </label>
                </div>
                <div class="modal-action">
                    <button class="btn btn-ghost btn-sm" @click="showModal = false">
                        取消
                    </button>
                    <button class="btn btn-primary btn-sm" :disabled="isSaving" @click="handleSavePermissions">
                        保存
                    </button>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop">
                <button @click="showModal = false">
                    close
                </button>
            </form>
        </dialog>
    </div>
</template>
