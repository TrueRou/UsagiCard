<template>
  <div>
    <app-nav />
    <NuxtPage />
    <ClientOnly>
      <UiLoading />
      <UiNotification />
    </ClientOnly>
  </div>
</template>
