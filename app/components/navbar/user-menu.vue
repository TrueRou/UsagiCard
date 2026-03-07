<script setup lang="ts">
const route = useRoute()
const { loggedIn, clear } = useUserSession()

const userSw = ref<HTMLElement | null>(null)

const loginPath = computed(() => ({ path: '/auth/login', query: { redirect: route.fullPath } }))
const registerPath = computed(() => ({ path: '/auth/register', query: { redirect: route.fullPath } }))

async function handleLogout() {
    await clear()
    await navigateTo('/')
}
</script>

<template>
    <li tabindex="0" class="self-center">
        <details ref="userSw">
            <summary class="py-1 px-2">
                <div role="button" tabindex="0" class="avatar h-7 w-7">
                    <div class="rounded-full">
                        <img v-if="loggedIn" src="https://a.ppy.sb/1094">
                        <img v-else src="https://a.ppy.sb/-1">
                    </div>
                </div>
            </summary>
            <ul
                tabindex="0" class="shadow menu menu-tint right-0 dropdown-content rounded-box w-32"
                @click="userSw?.toggleAttribute('open', false)"
            >
                <template v-if="loggedIn">
                    <li><a>购物车</a></li>
                    <li>
                        <NuxtLink to="/orders">
                            我的订单
                        </NuxtLink>
                    </li>
                    <li><a @click="handleLogout">登出</a></li>
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
        </details>
    </li>
</template>
