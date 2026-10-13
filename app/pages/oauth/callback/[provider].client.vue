<script setup lang="ts">
import type { ProberOAuthPending } from '~/composables/function/MaimaiCN/useProberOAuth'
import { getMaimaiUpdateSourceDef, MAIMAI_UPDATE_SERVER_TO_CHAIN_LABEL } from '~/composables/function/MaimaiCN/useMaimaiUpdatePlan'
import { consumeProberOAuthPending } from '~/composables/function/MaimaiCN/useProberOAuth'

definePageMeta({
    layout: 'default',
})

useHead({
    title: '查分器授权 - 兔兔实验室',
    // 回调地址携带一次性授权码，避免经 Referer 泄露
    meta: [{ name: 'referrer', content: 'no-referrer' }],
})

const route = useRoute()
const router = useRouter()

const provider = String(route.params.provider ?? '')
const code = typeof route.query.code === 'string' ? route.query.code : ''
const state = typeof route.query.state === 'string' ? route.query.state : ''
const upstreamError = typeof route.query.error === 'string' ? route.query.error : ''

// 立即从地址栏移除授权码，避免刷新时重复提交
void router.replace({ path: route.path, query: {} })

const pending: ProberOAuthPending | null = state ? consumeProberOAuthPending(state) : null
let errorMessage = ''
if (!pending)
    errorMessage = '授权请求已过期或不是由本设备发起，请返回卡片重新授权。'
else if (MAIMAI_UPDATE_SERVER_TO_CHAIN_LABEL[pending.server] !== provider)
    errorMessage = '授权回调与发起的查分器不一致，请重新授权。'
else if (upstreamError)
    errorMessage = upstreamError === 'access_denied' ? '你已取消授权。' : `授权失败（${upstreamError}），请重新授权。`
else if (!code)
    errorMessage = '回调缺少授权码，请重新授权。'
// 仅允许跳回卡片页面
const returnTo = pending
    ? (pending.returnTo.startsWith('/artifacts/') ? pending.returnTo : `/artifacts/${pending.artifactId}`)
    : '/'

const sourceName = computed(() => (pending ? getMaimaiUpdateSourceDef(pending.server)?.name : null) ?? '查分器')
</script>

<template>
    <main class="min-h-screen bg-linear-to-b from-base-200 to-base-100 px-6 py-12">
        <section class="mx-auto max-w-md space-y-6">
            <h1 class="text-2xl font-bold text-base-content">
                绑定{{ sourceName }}账号
            </h1>

            <template v-if="errorMessage">
                <div class="alert alert-warning text-sm">
                    <Icon name="mdi:alert-circle-outline" class="w-5 h-5" />
                    <span>{{ errorMessage }}</span>
                </div>
                <NuxtLink :to="returnTo" class="btn btn-primary">
                    {{ pending ? '返回卡片' : '返回首页' }}
                </NuxtLink>
            </template>

            <FunctionMaimaiCnOauthCallbackSaver
                v-else-if="pending"
                :pending="pending"
                :provider="provider"
                :code="code"
                :state="state"
                :return-to="returnTo"
            />
        </section>
    </main>
</template>
