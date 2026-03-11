<script setup lang="ts">
import type { AdminRedemptionDetailPublic } from '~/shared/types'

const emit = defineEmits<{
    (e: 'saved'): void
}>()

const isOpen = ref(false)
const isSaving = ref(false)
const redemption = ref<AdminRedemptionDetailPublic | null>(null)
const redemptionId = ref<string | null>(null)

const editForm = reactive({
    platform: '',
    platform_trade_id: '',
    platform_user_id: '',
})

async function open(id: string) {
    redemptionId.value = id
    isOpen.value = true
    redemption.value = null
    const data = await useNuxtApp().$leporid<AdminRedemptionDetailPublic>(`/api/admin/platform/redemptions/${id}`)
    redemption.value = data
    editForm.platform = data.platform
    editForm.platform_trade_id = data.platform_trade_id
    editForm.platform_user_id = data.platform_user_id
}

async function handleSave() {
    if (!redemptionId.value)
        return
    isSaving.value = true
    try {
        await useNuxtApp().$leporid(`/api/admin/platform/redemptions/${redemptionId.value}`, {
            method: 'PATCH',
            body: editForm,
            showSuccessToast: true,
            successMessage: '兑换码信息已更新',
        })
        emit('saved')
        if (redemption.value) {
            redemption.value.platform = editForm.platform
            redemption.value.platform_trade_id = editForm.platform_trade_id
            redemption.value.platform_user_id = editForm.platform_user_id
        }
    }
    finally {
        isSaving.value = false
    }
}

function formatDateTime(iso: string | null) {
    return iso ? new Date(iso).toLocaleString() : '-'
}

defineExpose({ open })
</script>

<template>
    <dialog class="modal" :class="{ 'modal-open': isOpen }">
        <div class="modal-box max-w-lg">
            <h3 class="text-lg font-bold mb-4">
                兑换码详情
            </h3>

            <div v-if="!redemption" class="flex justify-center py-8">
                <span class="loading loading-spinner loading-md" />
            </div>

            <div v-else class="space-y-4">
                <!-- 基本信息（只读） -->
                <div class="bg-base-200 rounded-lg p-3 text-sm space-y-2">
                    <div class="flex justify-between">
                        <span class="text-base-content/50">兑换码</span>
                        <span class="font-mono font-semibold">{{ redemption.code }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-base-content/50">状态</span>
                        <span v-if="redemption.claimed_at" class="badge badge-sm badge-success">已领取</span>
                        <span v-else class="badge badge-sm badge-warning">未领取</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-base-content/50">领取时间</span>
                        <span>{{ formatDateTime(redemption.claimed_at) }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-base-content/50">创建时间</span>
                        <span>{{ formatDateTime(redemption.created_at) }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-base-content/50">收件人</span>
                        <span>{{ redemption.shipping_name || '-' }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-base-content/50">电话</span>
                        <span>{{ redemption.shipping_phone || '-' }}</span>
                    </div>
                    <div>
                        <span class="text-base-content/50">地址</span>
                        <p class="mt-0.5">
                            {{ redemption.shipping_address || '-' }}
                        </p>
                    </div>
                    <div class="pt-1 border-t border-base-300">
                        <NuxtLink
                            :to="`/admin/orders/${redemption.order_id}`"
                            class="text-primary text-xs hover:underline"
                            @click="isOpen = false"
                        >
                            查看关联订单详情 →
                        </NuxtLink>
                    </div>
                </div>

                <!-- 可编辑字段 -->
                <fieldset class="fieldset">
                    <legend class="fieldset-legend">
                        平台标识
                    </legend>
                    <input v-model="editForm.platform" type="text" class="input w-full">
                </fieldset>
                <fieldset class="fieldset">
                    <legend class="fieldset-legend">
                        平台交易 ID
                    </legend>
                    <input v-model="editForm.platform_trade_id" type="text" class="input w-full">
                </fieldset>
                <fieldset class="fieldset">
                    <legend class="fieldset-legend">
                        平台用户 ID
                    </legend>
                    <input v-model="editForm.platform_user_id" type="text" class="input w-full">
                </fieldset>
            </div>

            <div class="modal-action">
                <button class="btn btn-outline btn-sm" @click="isOpen = false">
                    关闭
                </button>
                <button
                    v-if="redemption"
                    class="btn btn-primary btn-sm"
                    :disabled="isSaving"
                    @click="handleSave"
                >
                    <span v-if="isSaving" class="loading loading-spinner loading-xs" />
                    保存
                </button>
            </div>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button @click="isOpen = false">
                close
            </button>
        </form>
    </dialog>
</template>
