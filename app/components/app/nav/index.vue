<script setup>
import LangSwitcher from './lang-switcher.vue';
import UserMenu from './user-menu.vue';

const scrollY = useScrollYObserver();
const { t } = useI18n()

const detached = computed(() => scrollY.value > 0);
</script>

<template>
    <div class="navbar bg-base-100 shadow-sm sticky top-0 z-10" :class="[detached && 'detached']">
        <div class="navbar-start">
            <a class="btn btn-ghost text-xl">Bunny</a>
        </div>
        <div class="navbar-center hidden lg:flex">
            <NuxtLink class="btn btn-ghost" to="/">{{ t('home') }}</NuxtLink>
            <NuxtLink class="btn btn-ghost" to="/marketplace">{{ t('marketplace') }}</NuxtLink>
        </div>
        <menu class="navbar-end">
            <ul class="menu menu-horizontal items-center p-0">
                <LangSwitcher />
                <UserMenu />
            </ul>
        </menu>
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

zh-CN:
  home: 首页
  marketplace: 创意工坊
</i18n>