<template>
    <div>
        <slot />
        <ClientOnly>
            <NuxtLoadingIndicator />
            <BannerNotification />
        </ClientOnly>
    </div>
</template>
