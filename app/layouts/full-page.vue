<template>
    <div class="h-full flex">
        <slot />
        <ClientOnly>
            <NuxtLoadingIndicator />
            <BannerNotification />
        </ClientOnly>
    </div>
</template>
