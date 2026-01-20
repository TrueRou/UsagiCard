<template>
    <div>
        <Navbar />
        <NuxtPage />
        <ClientOnly>
            <NuxtLoadingIndicator />
            <BannerNotification />
        </ClientOnly>
    </div>
</template>
