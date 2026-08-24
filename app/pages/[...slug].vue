<script setup lang="ts">
definePageMeta({
    layout: 'default',
})

const route = useRoute()

useHead({
    title: '页面不存在 - 兔兔实验室',
})

setResponseStatus(404)
</script>

<template>
    <main class="min-h-screen bg-linear-to-b from-base-200 to-base-100 px-6 py-12">
        <section class="mx-auto max-w-3xl space-y-6">
            <p class="text-sm uppercase tracking-widest text-base-content/60">
                Error 404
            </p>

            <h1 class="text-3xl font-bold text-base-content md:text-4xl">
                页面不存在
            </h1>

            <p class="text-base text-base-content/80 md:text-lg">
                你访问的路径
                <code class="rounded bg-base-200 px-2 py-1 text-sm">{{ route.path }}</code>
                没有对应的页面，请检查地址是否正确。
            </p>

            <div>
                <NuxtLink
                    to="/"
                    class="btn btn-primary"
                >
                    返回首页
                </NuxtLink>
            </div>
        </section>
    </main>
</template>
