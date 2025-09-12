<script setup>
const { loggedIn, user, session, fetch, clear } = useUserSession()
const scrollY = useScrollYObserver();
const { t } = useI18n()

const detached = computed(() => scrollY.value > 0);

const handleLogout = async () => {
    await clear()
    await navigateTo('/')
}
</script>

<template>
    <div class="navbar bg-base-100 shadow-sm sticky top-0 z-10" :class="[detached && 'detached']">
        <div class="navbar-start">
            <a class="btn btn-ghost text-xl">Bunny</a>
        </div>
        <div class="navbar-center hidden lg:flex">
            <a class="btn btn-ghost">{{ t('home') }}</a>
            <a class="btn btn-ghost">{{ t('marketplace') }}</a>
        </div>
        <div class="navbar-end gap-2">
            <div class="dropdown dropdown-end">
                <div role="button" tabindex="0" class="btn btn-ghost btn-circle avatar">
                    <div class="rounded-full w-9">
                        <img v-if="loggedIn" src="https://a.ppy.sb/1094" />
                        <img v-else="loggedIn" src="https://a.ppy.sb/-1" />
                    </div>
                </div>
                <ul tabindex="0" class="mt-3 z-[1] p-2 shadow menu menu-md dropdown-content rounded-box w-52">
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
            </div>
        </div>
    </div>
</template>


<style scoped lang="postcss">
.navbar {
    @apply transition-[border-radius] duration-500;
    @apply p-1 top-0 h-12 min-h-fit md:h-14 from-primary/30 mix-blend-multiply bg-gradient-to-b;
}


.detached {
    .navbar {
        @apply bg-primary from-primary via-primary to-primary;
    }
}
</style>

<i18n lang="yaml">
en-GB:
  home: Home
  marketplace: Marketplace
  my-cart: My Cart
  my-orders: My Orders
  logout: Logout
  login: Login
  register: Register

zh-CN:
  home: 首页
  marketplace: 设计工坊
  my-cart: 购物车
  my-orders: 我的订单
  logout: 登出
  login: 登录
  register: 注册
</i18n>