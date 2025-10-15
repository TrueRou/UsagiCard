<template>
    <div>
        <AppNav />
        <NuxtPage />
        <ClientOnly>
            <NuxtLoadingIndicator />
            <AppNotification />
        </ClientOnly>
    </div>
</template>
