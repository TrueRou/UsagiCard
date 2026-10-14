<script setup lang="ts">
import type { MaimaiUpdateServer } from '~/composables/function/MaimaiCN/useMaimaiUpdatePlan'
import type { ProberOAuthCallbackResponse, ProberOAuthPending } from '~/composables/function/MaimaiCN/useProberOAuth'
import type { MaimaiStorage } from '~/types/api'
import { getMaimaiUpdateSourceDef, upsertMaimaiUpdateNode } from '~/composables/function/MaimaiCN/useMaimaiUpdatePlan'

const props = defineProps<{
    pending: ProberOAuthPending
    provider: string
    code: string
    state: string
    returnTo: string
}>()

const { storageOf, storageSave } = await useArtifact(props.pending.artifactId)
const storage = storageOf('MaimaiCN')

const phase = ref<'exchanging' | 'saving' | 'error'>('exchanging')
const errorMessage = ref('')
const binding = ref<ProberOAuthCallbackResponse | null>(null)
const sourceName = computed(() => getMaimaiUpdateSourceDef(props.pending.server)?.name ?? '查分器')

async function exchange() {
    try {
        const result = await useNuxtApp().$leporidae<ProberOAuthCallbackResponse>(`/api/maimai/oauth/${props.provider}/callback`, {
            method: 'POST',
            body: { code: props.code, state: props.state },
            showErrorToast: false,
        } as any)
        if (result.context.artifact_id !== props.pending.artifactId)
            throw new Error('授权回调与当前卡片不一致，请重新授权。')
        binding.value = result
    }
    catch (e: any) {
        fail(e, '授权失败，请稍后再试')
        return
    }
    await save()
}

function fail(e: any, fallback: string) {
    phase.value = 'error'
    errorMessage.value = e?.data?.message || e?.data?.detail || e?.message || fallback
}

async function save() {
    if (!binding.value)
        return
    phase.value = 'saving'
    try {
        await saveBinding(binding.value)
    }
    catch (e: any) {
        fail(e, '保存失败，请返回卡片重新授权')
    }
}

async function saveBinding(granted: ProberOAuthCallbackResponse) {
    const strategy = upsertMaimaiUpdateNode(storage.value.update?.strategy, props.pending.zone, {
        server: props.pending.server as MaimaiUpdateServer,
        credential: granted.credential,
        transient: false,
        auth_type: 'OAUTH',
        display_name: granted.display_name || granted.username || null,
    })
    await storageSave('MaimaiCN', {
        ...storage.value,
        update: {
            ...storage.value.update,
            strategy: strategy as NonNullable<MaimaiStorage['update']>['strategy'],
        },
    }, { successMessage: `已绑定${sourceName.value}账号` })
    await navigateTo(props.returnTo, { replace: true })
}

onMounted(exchange)
</script>

<template>
    <div class="space-y-4">
        <div v-if="phase === 'exchanging' || phase === 'saving'" class="flex items-center gap-3 text-sm text-base-content/70">
            <span class="loading loading-spinner loading-sm" />
            <span>{{ phase === 'exchanging' ? `正在完成${sourceName}授权…` : '正在保存到卡片…' }}</span>
        </div>

        <template v-else>
            <div class="alert alert-error text-sm">
                <Icon name="mdi:alert-circle-outline" class="w-5 h-5" />
                <span>{{ errorMessage }}</span>
            </div>
            <NuxtLink :to="returnTo" class="btn btn-primary">
                返回卡片
            </NuxtLink>
        </template>
    </div>
</template>
