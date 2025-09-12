<template>
  <div>
    <AppNav />
    <NuxtPage />
    <ClientOnly>
      <NuxtLoadingIndicator />
      <UiNotification />
    </ClientOnly>
  </div>
</template>
