<script setup lang="ts">
definePageMeta({
    layout: 'full-page',
})

const route = useRoute()
const artifactId = route.params.id as string
const { artifact, storageOf } = await useArtifact(artifactId)

const functionTypes = artifact.value.product.type.function_types
const defaultPage = findFunctionPageByKey(functionTypes, storageOf('UsagiCard').value.menu?.default_function_tab)
    ?? getEnabledFunctionPages(functionTypes)[0]

if (!defaultPage) {
    throw createError({ statusCode: 404, statusMessage: '暂无可用功能' })
}

await navigateTo(defaultPage.path(artifactId), { replace: true })
</script>

<template>
    <div class="p-4 text-sm text-base-content/60">
        正在跳转功能页...
    </div>
</template>
