<script setup lang="ts">
const { loggedIn, user, session, fetch, clear } = useUserSession()

const { t } = useI18n()

const handleLogout = async () => {
    await clear()
    await navigateTo('/')
}
</script>
<template>
    <li tabindex="0" class="self-center">
        <details>
            <summary>
                <div role="button" tabindex="0" class="avatar h-8 w-8">
                    <div class="rounded-full">
                        <img v-if="loggedIn" src="https://a.ppy.sb/1094" />
                        <img v-else="loggedIn" src="https://a.ppy.sb/-1" />
                    </div>
                </div>
            </summary>
            <ul tabindex="0" class="shadow menu menu-tint right-0 dropdown-content rounded-box w-32">
                <template v-if="loggedIn">
                    <li><a>{{ t('my-cart') }}</a></li>
                    <li><a>{{ t('my-orders') }}</a></li>
                    <li><a @click="handleLogout">{{ t('logout') }}</a></li>
                </template>
                <template v-else>
                    <li>
                        <NuxtLink to="/auth/login">{{ t('login') }}</NuxtLink>
                    </li>
                    <li>
                        <NuxtLink to="/auth/register">{{ t('register') }}</NuxtLink>
                    </li>
                </template>
            </ul>

        </details>
    </li>
</template>

<i18n lang="yaml">
en-GB:
  my-cart: My Cart
  my-orders: My Orders
  logout: Logout
  login: Login
  register: Register

zh-CN:
  my-cart: 购物车
  my-orders: 我的订单
  logout: 登出
  login: 登录
  register: 注册
</i18n>