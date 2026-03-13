<script setup lang="ts">
const searchParams = reactive({
    keyword: '',
    page_number: 1,
    page_size: 20,
})

const { data: users, refresh } = await useLeporid<PageAdminUserPublic>('/api/admin/users', {
    params: searchParams,
})

const allPermissions = [
    { value: UserPermission.ANY_ADMIN, label: '特权用户' },
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

function formatDateTime(iso: string) {
    return new Date(iso).toLocaleString()
}

// ── Detail modal ──────────────────────────────────────────
type DetailTab = 'permissions' | 'orders' | 'artifacts'

const showDetail = ref(false)
const detailUser = ref<any | null>(null)
const activeTab = ref<DetailTab>('permissions')

// Permission tab state
const editPermissions = ref<number[]>([])
const isSavingPerms = ref(false)

const permissionLabelMap = Object.fromEntries(
    allPermissions.map(p => [p.value, p.label]),
) as Record<number, string>

// Password tab state
const isSavingPassword = ref(false)

// Orders tab state
const userOrdersPage = ref(1)
const userOrdersData = ref<any | null>(null)
const isLoadingOrders = ref(false)

// Artifacts tab state
const userArtifactsPage = ref(1)
const userArtifactsData = ref<any | null>(null)
const isLoadingArtifacts = ref(false)

function openDetail(user: any) {
    detailUser.value = user
    editPermissions.value = [...user.permissions]
    activeTab.value = 'permissions'
    userOrdersData.value = null
    userArtifactsData.value = null
    userOrdersPage.value = 1
    userArtifactsPage.value = 1
    showDetail.value = true
}

function togglePermission(perm: number) {
    const idx = editPermissions.value.indexOf(perm)
    if (idx >= 0)
        editPermissions.value.splice(idx, 1)
    else editPermissions.value.push(perm)
}

async function handleSavePermissions() {
    if (!detailUser.value)
        return
    isSavingPerms.value = true
    try {
        await useNuxtApp().$leporid(`/api/admin/users/${detailUser.value.id}/permissions`, {
            method: 'PATCH',
            body: { permissions: editPermissions.value },
            showSuccessToast: true,
            successMessage: '权限已更新',
        })
        await refresh()
        detailUser.value = { ...detailUser.value, permissions: [...editPermissions.value] }
    }
    finally {
        isSavingPerms.value = false
    }
}

async function handleSetPassword() {
    if (!detailUser.value)
        return
    isSavingPassword.value = true
    try {
        await useNuxtApp().$leporid(`/api/admin/users/${detailUser.value.id}/resetPassword`, {
            method: 'POST',
            showSuccessToast: true,
            successMessage: '密码已重置',
        })
    }
    finally {
        isSavingPassword.value = false
    }
}

async function fetchUserOrders() {
    if (!detailUser.value)
        return
    isLoadingOrders.value = true
    try {
        userOrdersData.value = await useNuxtApp().$leporid(
            `/api/admin/users/${detailUser.value.id}/orders`,
            { params: { page_number: userOrdersPage.value, page_size: 10 } },
        )
    }
    finally {
        isLoadingOrders.value = false
    }
}

async function fetchUserArtifacts() {
    if (!detailUser.value)
        return
    isLoadingArtifacts.value = true
    try {
        userArtifactsData.value = await useNuxtApp().$leporid(
            `/api/admin/users/${detailUser.value.id}/artifacts`,
            { params: { page_number: userArtifactsPage.value, page_size: 10 } },
        )
    }
    finally {
        isLoadingArtifacts.value = false
    }
}

function switchTab(tab: DetailTab) {
    activeTab.value = tab
    if (tab === 'orders' && !userOrdersData.value)
        fetchUserOrders()
    if (tab === 'artifacts' && !userArtifactsData.value)
        fetchUserArtifacts()
}

function handleOrdersPageChange(page: number) {
    userOrdersPage.value = page
    fetchUserOrders()
}

function handleArtifactsPageChange(page: number) {
    userArtifactsPage.value = page
    fetchUserArtifacts()
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
                                    {{ permissionLabelMap[perm] ?? perm }}
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
                            <button class="btn btn-accent btn-xs" @click="openDetail(u)">
                                详情
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

        <!-- User detail modal -->
        <dialog class="modal" :class="{ 'modal-open': showDetail }">
            <div class="modal-box max-w-lg max-h-[85dvh] flex flex-col p-0 overflow-hidden">
                <!-- Tab nav -->
                <div class="flex items-center border-b border-base-200 px-4 pt-4 shrink-0 gap-1">
                    <div class="flex-1 flex gap-1">
                        <button
                            v-for="tab in [
                                { key: 'permissions', label: '权限 & 密码' },
                                { key: 'orders', label: '订单' },
                                { key: 'artifacts', label: '工件' },
                            ]"
                            :key="tab.key"
                            class="px-3 py-2 text-sm font-medium border-b-2 transition-colors -mb-px"
                            :class="activeTab === tab.key
                                ? 'border-accent text-accent'
                                : 'border-transparent text-base-content/60 hover:text-base-content'"
                            @click="switchTab(tab.key as DetailTab)"
                        >
                            {{ tab.label }}
                        </button>
                    </div>
                    <button class="btn btn-ghost btn-sm btn-circle mb-1" @click="showDetail = false">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M18 6 6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <!-- User info bar -->
                <div v-if="detailUser" class="px-4 pt-3 pb-2 shrink-0 border-b border-base-100">
                    <p class="font-semibold">
                        {{ detailUser.username }}
                    </p>
                    <p class="text-xs text-base-content/50 font-mono">
                        {{ detailUser.email }}
                    </p>
                </div>

                <!-- Tab content -->
                <div class="flex-1 overflow-y-auto px-4 py-4">
                    <!-- Permissions + Password -->
                    <div v-if="activeTab === 'permissions'" class="space-y-4">
                        <div>
                            <p class="text-sm font-semibold mb-2">
                                权限节点
                            </p>
                            <div class="space-y-1">
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
                            <div class="flex justify-end mt-3 gap-2">
                                <button class="btn btn-accent btn-sm" :disabled="isSavingPassword" @click="handleSetPassword">
                                    重置密码
                                </button>
                                <button class="btn btn-primary btn-sm" :disabled="isSavingPerms" @click="handleSavePermissions">
                                    保存权限
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Orders -->
                    <div v-else-if="activeTab === 'orders'">
                        <div v-if="isLoadingOrders" class="flex justify-center py-8">
                            <span class="loading loading-spinner loading-sm" />
                        </div>
                        <div v-else-if="!userOrdersData?.records?.length" class="text-center py-8 text-base-content/50 text-sm">
                            暂无订单
                        </div>
                        <div v-else>
                            <table class="table table-xs">
                                <thead>
                                    <tr>
                                        <th>订单号</th>
                                        <th>状态</th>
                                        <th>金额</th>
                                        <th>创建时间</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="o in userOrdersData.records" :key="o.id">
                                        <td>
                                            <NuxtLink :to="`/admin/orders/${o.id}`" class="link link-primary font-mono text-xs">
                                                {{ o.id.slice(-8) }}
                                            </NuxtLink>
                                        </td>
                                        <td>
                                            <AdminStatusBadge :status="o.status" type="order" />
                                        </td>
                                        <td class="font-semibold text-xs">
                                            ¥{{ Number.parseFloat(o.payment_money).toFixed(2) }}
                                        </td>
                                        <td class="text-xs text-base-content/60">
                                            {{ formatDateTime(o.created_at) }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <AdminPagination
                                v-if="userOrdersData"
                                :total-pages="userOrdersData.total_page"
                                :current-page="userOrdersPage"
                                @update:current-page="handleOrdersPageChange"
                            />
                        </div>
                    </div>

                    <!-- Artifacts -->
                    <div v-else-if="activeTab === 'artifacts'">
                        <div v-if="isLoadingArtifacts" class="flex justify-center py-8">
                            <span class="loading loading-spinner loading-sm" />
                        </div>
                        <div v-else-if="!userArtifactsData?.records?.length" class="text-center py-8 text-base-content/50 text-sm">
                            暂无工件
                        </div>
                        <div v-else>
                            <table class="table table-xs">
                                <thead>
                                    <tr>
                                        <th>工件ID</th>
                                        <th>状态</th>
                                        <th>商品</th>
                                        <th>创建时间</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="a in userArtifactsData.records" :key="a.id">
                                        <td class="font-mono text-xs">
                                            {{ a.id.slice(-8) }}
                                        </td>
                                        <td>
                                            <AdminStatusBadge :status="a.status" type="artifact" />
                                        </td>
                                        <td class="text-xs max-w-28 truncate">
                                            {{ a.product?.name || a.product_id.slice(-8) }}
                                        </td>
                                        <td class="text-xs text-base-content/60">
                                            {{ formatDateTime(a.created_at) }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <AdminPagination
                                v-if="userArtifactsData"
                                :total-pages="userArtifactsData.total_page"
                                :current-page="userArtifactsPage"
                                @update:current-page="handleArtifactsPageChange"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop">
                <button @click="showDetail = false">
                    close
                </button>
            </form>
        </dialog>
    </div>
</template>
