<template>
    <div class="h-full flex">
        <NuxtPage />
        <ClientOnly>
            <NuxtLoadingIndicator />
            <BannerNotification />
        </ClientOnly>
    </div>
</template>

<style>
/* 页面过渡效果 */
.function-page-enter-active,
.function-page-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.function-page-enter-from {
    opacity: 0;
    transform: translateX(10px);
}

.function-page-leave-to {
    opacity: 0;
    transform: translateX(-10px);
}
</style>
