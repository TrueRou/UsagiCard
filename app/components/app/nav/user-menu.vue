<script setup lang="ts">
const { loggedIn, clear } = useUserSession()

const userSw = ref<HTMLElement | null>(null)

async function handleLogout() {
    await clear()
    await navigateTo('/')
}
</script>

<template>
    <li tabindex="0" class="self-center">
        <details ref="userSw">
            <summary>
                <div role="button" tabindex="0" class="avatar h-8 w-8">
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
                        <NuxtLink to="/auth/login">
                            登录
                        </NuxtLink>
                    </li>
                    <li>
                        <NuxtLink to="/auth/register">
                            注册
                        </NuxtLink>
                    </li>
                </template>
            </ul>
        </details>
    </li>
</template>
