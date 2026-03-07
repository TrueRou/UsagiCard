<script setup lang="ts">
const route = useRoute()
const { loggedIn, user, clear } = useUserSession()

const open = ref(false)
const panelRef = ref<HTMLElement | null>(null)

const loginPath = computed(() => ({ path: '/auth/login', query: { redirect: route.fullPath } }))
const registerPath = computed(() => ({ path: '/auth/register', query: { redirect: route.fullPath } }))

onClickOutside(panelRef, () => {
    open.value = false
})

async function handleLogout() {
    open.value = false
    await clear()
    await navigateTo('/')
}
</script>

<template>
    <div ref="panelRef" class="relative border-t p-2">
        <button
            class="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-base-300 transition-colors"
            @click="open = !open"
        >
            <div class="avatar h-8 w-8 shrink-0">
                <div class="rounded-full">
                    <img v-if="loggedIn" src="https://a.ppy.sb/1094">
                    <img v-else src="https://a.ppy.sb/-1">
                </div>
            </div>
            <div class="flex-1 min-w-0 text-left">
                <p v-if="loggedIn" class="text-sm font-medium truncate leading-tight">
                    {{ user?.username }}
                </p>
                <p v-else class="text-sm text-base-content/50 leading-tight">
                    未登录
                </p>
            </div>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 text-base-content/40 shrink-0 transition-transform duration-200"
                :class="open ? 'rotate-90' : ''"
                viewBox="0 0 20 20" fill="currentColor"
            >
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
        </button>
        <Transition name="panel-pop">
            <ul
                v-if="open"
                class="absolute left-full bottom-2 ml-2 w-44 z-50 shadow-lg menu bg-base-100 rounded-box py-1"
                @click="open = false"
            >
                <template v-if="loggedIn">
                    <li>
                        <NuxtLink to="/orders">
                            我的订单
                        </NuxtLink>
                    </li>
                    <li><a @click.stop="handleLogout">登出</a></li>
                </template>
                <template v-else>
                    <li>
                        <NuxtLink :to="loginPath">
                            登录
                        </NuxtLink>
                    </li>
                    <li>
                        <NuxtLink :to="registerPath">
                            注册
                        </NuxtLink>
                    </li>
                </template>
            </ul>
        </Transition>
    </div>
</template>

<style scoped>
.panel-pop-enter-active,
.panel-pop-leave-active {
    transition: opacity 0.15s ease, transform 0.15s ease;
}
.panel-pop-enter-from,
.panel-pop-leave-to {
    opacity: 0;
    transform: translateX(-6px);
}
</style>
