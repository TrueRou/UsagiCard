<script setup lang="ts">
const props = defineProps<{
    artifactId: string
}>()

const route = useRoute()
const { artifact, activate, activating } = await useArtifact(props.artifactId)
const { loggedIn, user } = useUserSession()

const skipDialogOpen = ref(false)
const loggingIn = ref(false)

async function handleLogin(prompt?: 'create') {
    loggingIn.value = true
    await navigateTo(loginURL(route.fullPath, prompt), { external: true })
}

async function handleClaim() {
    await activate('claim')
}

async function handleSkip() {
    skipDialogOpen.value = false
    await activate('skip')
}

async function handleSwitchAccount() {
    await logout()
    await handleLogin()
}
</script>

<template>
    <main class="min-h-full w-full overflow-y-auto bg-linear-to-b from-base-200 to-base-100 px-6 py-12">
        <section class="mx-auto max-w-md space-y-6">
            <header class="space-y-3 text-center">
                <div class="mx-auto w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <Icon name="mdi:card-account-details-star-outline" class="w-9 h-9" />
                </div>
                <h1 class="text-2xl font-bold text-base-content">
                    激活你的{{ artifact.type.name }}
                </h1>
                <p class="text-sm text-base-content/70 leading-relaxed">
                    首次使用前需要激活喵。申领后卡片将绑定到你的 UsagiLab 账号。
                </p>
            </header>

            <div class="rounded-2xl border border-base-300/60 bg-base-100 p-4 space-y-4 shadow-sm">
                <template v-if="loggedIn">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-base-200 flex items-center justify-center text-base-content/50 shrink-0">
                            <Icon name="mdi:account" class="w-6 h-6" />
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-semibold truncate">
                                {{ user?.username }}
                            </p>
                            <p class="text-xs text-base-content/60 truncate">
                                {{ user?.email }}
                            </p>
                        </div>
                        <button type="button" class="btn btn-ghost btn-xs" :disabled="activating" @click="handleSwitchAccount">
                            切换账号
                        </button>
                    </div>
                    <button type="button" class="btn btn-primary w-full" :disabled="activating" @click="handleClaim">
                        <span v-if="activating" class="loading loading-spinner loading-sm" />
                        申领到当前账号
                    </button>
                </template>

                <template v-else>
                    <button type="button" class="btn btn-primary w-full" :disabled="loggingIn" @click="handleLogin()">
                        <span v-if="loggingIn" class="loading loading-spinner loading-sm" />
                        登录并申领
                    </button>
                    <p class="text-center text-xs text-base-content/60">
                        没有账户？
                        <a href="#" class="link link-primary" @click.prevent="handleLogin('create')">
                            注册
                        </a>
                    </p>
                </template>
            </div>

            <div class="text-center">
                <button type="button" class="btn btn-ghost btn-sm text-base-content/60" :disabled="activating" @click="skipDialogOpen = true">
                    跳过申领，直接使用
                </button>
            </div>
        </section>

        <dialog class="modal" :class="{ 'modal-open': skipDialogOpen }">
            <div class="modal-box max-w-sm space-y-2">
                <h3 class="text-base font-semibold">
                    确认跳过申领？
                </h3>
                <p class="text-sm leading-relaxed text-base-content/70">
                    跳过后卡片会直接激活，但不会绑定任何账号，并且<strong class="text-base-content">之后无法再申领</strong>。如需重新申领，请联系客服重置卡片。
                </p>
                <div class="modal-action mt-4">
                    <button type="button" class="btn btn-ghost btn-sm" @click="skipDialogOpen = false">
                        取消
                    </button>
                    <button type="button" class="btn btn-error btn-sm" @click="handleSkip">
                        仍然跳过
                    </button>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop">
                <button @click="skipDialogOpen = false">
                    close
                </button>
            </form>
        </dialog>
    </main>
</template>
