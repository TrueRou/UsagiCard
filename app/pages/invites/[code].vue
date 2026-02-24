<script setup lang="ts">
const route = useRoute()
const code = route.params.code as string

const { loggedIn } = useUserSession()
const isProcessing = ref(false)

const { data: redemption, error } = await useLeporid<PlatformRedemptionPreviewPublic>(
    `/api/redemptions/${code}`,
    { server: true },
)

// 兑换码不存在，跳转首页
if (error.value) {
    await navigateTo('/')
}

// 已领取，跳转到对应订单
if (redemption.value?.claimed_at && redemption.value?.order_id) {
    await navigateTo(`/orders/${redemption.value.order_id}`)
}

useHead({
    title: `领取 ${redemption.value?.preset?.product_name ?? '商品'} - UsagiLab`,
})

async function handleClaim() {
    if (!loggedIn.value) {
        return navigateTo(`/auth/login?redirect=${encodeURIComponent(route.fullPath)}`)
    }

    isProcessing.value = true
    try {
        const order = await useNuxtApp().$leporid<{ id: string }>(
            `/api/redemptions/${code}/claim`,
            { method: 'POST' },
        )
        await navigateTo(`/orders/${(order as any).id}`)
    }
    finally {
        isProcessing.value = false
    }
}
</script>

<template>
    <div class="container mx-auto px-4 py-12 max-w-lg">
        <template v-if="redemption">
            <h1 class="text-2xl font-bold mb-2">
                领取 {{ redemption.preset.product_name }}
            </h1>
            <p class="text-base-content/60 mb-8">
                {{ redemption.preset.product_description }}
            </p>

            <div class="mb-8">
                <p class="text-sm font-medium text-base-content/50 mb-2 uppercase tracking-wide">
                    收货信息
                </p>
                <p class="font-medium">
                    {{ redemption.shipping_name }} · {{ redemption.shipping_phone }}
                </p>
                <p class="text-base-content/70">
                    {{ redemption.shipping_address }}
                </p>
            </div>

            <div v-if="!loggedIn" role="alert" class="alert alert-warning mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
                </svg>
                <span>请先登录以领取商品</span>
            </div>

            <button
                class="btn btn-primary w-full"
                :disabled="isProcessing"
                @click="handleClaim"
            >
                <span v-if="isProcessing" class="loading loading-spinner loading-sm" />
                {{ loggedIn ? '立即领取' : '登录后领取' }}
            </button>
        </template>
    </div>
</template>
