<script setup lang="ts">
useHead({
    title: '兔兔实验室',
})

const router = useRouter()

const artifactId = ref('')

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const trimmedId = computed(() => artifactId.value.trim())
const isValid = computed(() => UUID_PATTERN.test(trimmedId.value))
const showError = ref(false)

function submit() {
    if (!isValid.value) {
        showError.value = true
        return
    }
    showError.value = false
    router.push(`/cards/${trimmedId.value}`)
}

function onInput() {
    if (showError.value && isValid.value)
        showError.value = false
}
</script>

<template>
    <main class="min-h-screen bg-linear-to-b from-base-200 to-base-100 px-6 py-12">
        <section class="mx-auto max-w-2xl space-y-8">
            <header class="space-y-3">
                <p class="text-sm uppercase tracking-widest text-base-content/60">
                    Leporidae Lab
                </p>
                <h1 class="text-3xl font-bold text-base-content md:text-4xl">
                    UsagiCard 已部署
                </h1>
                <p class="text-base text-base-content/80 md:text-lg">
                    输入你的卡片 UUID 即可访问对应的 UsagiCard 页面。
                </p>
            </header>

            <form
                class="space-y-3"
                @submit.prevent="submit"
            >
                <label
                    for="artifact-id"
                    class="block text-sm font-medium text-base-content/80"
                >
                    卡片 UUID
                </label>
                <div class="flex flex-col gap-3 sm:flex-row">
                    <input
                        id="artifact-id"
                        v-model="artifactId"
                        type="text"
                        class="input input-bordered w-full flex-1 font-mono"
                        :class="{ 'input-error': showError && !isValid }"
                        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                        autocomplete="off"
                        spellcheck="false"
                        @input="onInput"
                    >
                    <button
                        type="submit"
                        class="btn btn-primary"
                        :disabled="!trimmedId"
                    >
                        前往卡片
                    </button>
                </div>
                <p
                    v-if="showError && !isValid"
                    class="text-sm text-error"
                >
                    请输入合法的 UUID（形如 xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx）。
                </p>
                <p
                    v-else
                    class="text-sm text-base-content/60"
                >
                    提示：UUID 通常可以在你的卡片分享链接或管理后台中找到。
                </p>
            </form>
        </section>
    </main>
</template>
