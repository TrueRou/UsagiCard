<script setup lang="ts">
const route = useRoute()
const { user } = useUserSession()
const sidebarOpen = ref(false)

const permissions = computed(() => user.value?.permissions || [])

function hasPermission(perm: number) {
    return permissions.value.includes(perm)
}

const navItems = computed(() => [
    { label: '仪表盘', to: '/admin', icon: 'mdi:view-dashboard-outline', show: hasPermission(UserPermission.ANY_ADMIN) },
    { label: '订单管理', to: '/admin/orders', icon: 'mdi:receipt-text-outline', show: hasPermission(UserPermission.ORDERS_ADMIN) },
    { label: '用户管理', to: '/admin/users', icon: 'mdi:account-group-outline', show: hasPermission(UserPermission.USERS_ADMIN) },
    { label: '工件管理', to: '/admin/artifacts', icon: 'mdi:cube-outline', show: hasPermission(UserPermission.ARTIFACTS_ADMIN) },
    { label: '批次管理', to: '/admin/batches', icon: 'mdi:package-variant-closed', show: hasPermission(UserPermission.ARTIFACTS_ADMIN) },
    { label: '兑换码', to: '/admin/redemptions', icon: 'mdi:ticket-confirmation-outline', show: hasPermission(UserPermission.PLATFORM_ADMIN) },
    { label: '平台配置', to: '/admin/platform', icon: 'mdi:cog-outline', show: hasPermission(UserPermission.PLATFORM_ADMIN) },
])

const visibleNavItems = computed(() => navItems.value.filter(item => item.show))

function isActive(to: string) {
    if (to === '/admin')
        return route.path === '/admin'
    return route.path.startsWith(to)
}
</script>

<template>
    <div class="min-h-screen bg-base-200">
        <!-- Mobile header -->
        <div class="lg:hidden navbar bg-base-100 shadow-sm sticky top-0 z-20">
            <div class="navbar-start">
                <button class="btn btn-ghost btn-square" @click="sidebarOpen = !sidebarOpen">
                    <Icon name="mdi:menu" class="w-5 h-5" />
                </button>
            </div>
            <div class="navbar-center">
                <NuxtLink to="/admin" class="text-lg font-bold">
                    Bunny 管理
                </NuxtLink>
            </div>
            <div class="navbar-end">
                <NuxtLink to="/" class="btn btn-ghost btn-sm">
                    <Icon name="mdi:arrow-left" class="w-4 h-4" />
                    返回
                </NuxtLink>
            </div>
        </div>

        <div class="flex">
            <!-- Sidebar overlay (mobile) -->
            <Transition name="fade">
                <div
                    v-if="sidebarOpen"
                    class="fixed inset-0 bg-black/40 z-30 lg:hidden"
                    @click="sidebarOpen = false"
                />
            </Transition>

            <!-- Sidebar -->
            <aside
                class="fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-base-100 shadow-lg transition-transform duration-200 lg:translate-x-0 flex flex-col"
                :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
            >
                <!-- Sidebar header -->
                <div class="p-4 border-b hidden lg:block">
                    <NuxtLink to="/admin" class="text-xl font-bold">
                        Bunny 管理
                    </NuxtLink>
                    <p class="text-xs text-base-content/50 mt-1">
                        {{ user?.username }}
                    </p>
                </div>

                <!-- Nav items -->
                <nav class="flex-1 overflow-y-auto p-2">
                    <ul class="menu gap-0.5">
                        <li v-for="item in visibleNavItems" :key="item.to">
                            <NuxtLink
                                :to="item.to"
                                class="flex items-center gap-3"
                                :class="isActive(item.to) ? 'active' : ''"
                                @click="sidebarOpen = false"
                            >
                                <Icon :name="item.icon" class="w-5 h-5" />
                                {{ item.label }}
                            </NuxtLink>
                        </li>
                    </ul>
                </nav>

                <!-- Sidebar footer -->
                <div class="border-t p-2">
                    <ul class="menu">
                        <li>
                            <NuxtLink to="/" class="flex items-center gap-3" @click="sidebarOpen = false">
                                <Icon name="mdi:arrow-left" class="w-5 h-5" />
                                返回前台
                            </NuxtLink>
                        </li>
                    </ul>
                </div>
            </aside>

            <!-- Main content -->
            <main class="flex-1 min-w-0 lg:ml-0">
                <div class="p-4 lg:p-6">
                    <slot />
                </div>
            </main>
        </div>

        <ClientOnly>
            <NuxtLoadingIndicator />
            <BannerNotification />
            <DialogConfirm />
        </ClientOnly>
    </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
