<script setup>
import UserMenu from './user-menu.vue'

const scrollY = useScrollYObserver()

const detached = computed(() => scrollY.value > 0)
</script>

<template>
    <div class="navbar bg-base-100 shadow-sm sticky top-0 z-10" :class="[detached && 'detached']">
        <div class="navbar-start">
            <a class="btn btn-ghost text-xl">Bunny</a>
        </div>
        <div class="navbar-center hidden lg:flex">
            <NuxtLink class="btn btn-ghost" to="/">
                首页
            </NuxtLink>
            <NuxtLink class="btn btn-ghost" to="/marketplace">
                关于兔卡
            </NuxtLink>
        </div>
        <menu class="navbar-end">
            <ul class="menu menu-horizontal items-center p-0">
                <UserMenu />
            </ul>
        </menu>
    </div>
</template>

<style scoped lang="postcss">
.navbar {
    @apply transition-[border-radius] duration-500;
    @apply p-1 top-0 h-12 min-h-fit md:h-14 from-primary/30 mix-blend-multiply bg-linear-to-b;
}

.detached {
    .navbar {
        @apply bg-primary from-primary via-primary to-primary;
    }
}
</style>
