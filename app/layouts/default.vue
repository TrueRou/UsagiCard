<template>
    <div>
        <Navbar />
        <slot />
        <ClientOnly>
            <NuxtLoadingIndicator />
            <BannerNotification />
        </ClientOnly>
    </div>
</template>
