<script setup lang="ts">
import { z } from 'zod'

const props = defineProps<{
    artifact: ArtifactUserResponse
}>()
const { storageSave, storageSaving } = await useArtifact(props.artifact.id)

const storage = ref<MaimaiStorage>({
    rem_accounts: [],
    updating_behavior: 'adhoc',
    ...props.artifact.storage,
})

const serverOptions = [
    {
        identifier: 'diving_fish' as const,
        name: '水鱼查分器',
        description: 'DivingFish',
        tipsTitle: '水鱼查分器使用指南',
        tipsDesc: '如果您没有使用过水鱼查分器，开始之前，建议您先注册一个查分器账户。登录水鱼后，点击编辑个人资料，复制成绩导入 Token，填入下方即可。',
        tipsUrl: 'https://www.diving-fish.com/maimaidx/prober/',
        credentialsName: '水鱼 Import-Token',
    },
    {
        identifier: 'lxns' as const,
        name: '落雪查分器',
        description: 'LXNS',
        tipsTitle: '落雪查分器使用指南',
        tipsDesc: '使用落雪查分器之前，请先注册落雪账号，并且通过落雪官方途径至少上传一次成绩。完成后，进入账号详情，点击第三方应用，复制个人 API 密钥，填入下方即可。',
        tipsUrl: 'https://maimai.lxns.net/',
        credentialsName: '个人 API 密钥',
    },
]

const updatingBehaviors = [
    {
        value: 'adhoc' as const,
        label: '广播更新',
        description: '从一个数据源更新到其他数据源',
    },
    {
        value: 'aggregate' as const,
        label: '聚合更新',
        description: '从所有数据源拉取、聚合后更新到所有数据源',
    },
]

// 对话框状态管理
const showAddDialog = ref(false)

// 添加账号表单验证
const addAccountSchema = z.object({
    label: z.string().min(1, '标签不能为空'),
    server: z.enum(['diving_fish', 'lxns']),
    credential: z.string().min(1, '凭据不能为空'),
})

const addAccountForm = reactive({
    label: '',
    server: 'diving_fish' as 'diving_fish' | 'lxns',
    credential: '',
})

const { validate, ve, clearErrors } = useFormValidation(addAccountSchema, addAccountForm)

const selectedServerOption = computed(() =>
    serverOptions.find(o => o.identifier === addAccountForm.server),
)

function openDialog() {
    showAddDialog.value = true
}

function closeDialog() {
    showAddDialog.value = false
    // 重置表单
    addAccountForm.label = ''
    addAccountForm.server = 'diving_fish'
    addAccountForm.credential = ''
    clearErrors()
}

function confirmAdd() {
    if (!validate())
        return

    storage.value.rem_accounts = [
        ...(storage.value.rem_accounts ?? []),
        {
            label: addAccountForm.label,
            server: addAccountForm.server,
            credential: addAccountForm.credential,
        },
    ]
    closeDialog()
}

function removeAccount(index: number) {
    storage.value.rem_accounts = (storage.value.rem_accounts ?? []).filter((_, i) => i !== index)
}

function serverName(identifier: string) {
    return serverOptions.find(o => o.identifier === identifier)?.name ?? identifier
}
</script>

<template>
    <form class="space-y-4" @submit.prevent="storageSave(storage)">
        <!-- 账号信息（只读） -->
        <div class="grid gap-4 md:grid-cols-2">
            <div class="form-control flex flex-col gap-2 rounded-lg px-4">
                <label>
                    <p class="font-medium text-sm">
                        玩家名称
                    </p>
                    <p class="text-xs text-base-content/60">
                        上次从数据源获取的玩家名称
                    </p>
                </label>
                <input
                    :value="storage.player_name ?? ''"
                    class="input w-full input-bordered input-disabled"
                    type="text"
                    placeholder="尚未同步"
                    disabled
                >
            </div>

            <div class="form-control flex flex-col gap-2 rounded-lg px-4">
                <label>
                    <p class="font-medium text-sm">
                        玩家 Rating
                    </p>
                    <p class="text-xs text-base-content/60">
                        上次从数据源获取的玩家 Rating
                    </p>
                </label>
                <input
                    :value="storage.player_rating ?? ''"
                    class="input w-full input-bordered input-disabled"
                    type="text"
                    placeholder="尚未同步"
                    disabled
                >
            </div>

            <div class="form-control flex flex-col gap-2 rounded-lg px-4">
                <label>
                    <p class="font-medium text-sm">
                        好友代码
                    </p>
                    <p class="text-xs text-base-content/60">
                        上次从数据源获取的好友代码
                    </p>
                </label>
                <input
                    :value="storage.friend_code ?? ''"
                    class="input w-full input-bordered input-disabled"
                    type="text"
                    placeholder="尚未同步"
                    disabled
                >
            </div>

            <div class="form-control flex flex-col gap-2 rounded-lg px-4">
                <label>
                    <p class="font-medium text-sm">
                        最后同步时间
                    </p>
                    <p class="text-xs text-base-content/60">
                        上次成功同步数据的时间
                    </p>
                </label>
                <input
                    :value="storage.updating_at ? new Date(storage.updating_at).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }) : ''"
                    class="input w-full input-bordered input-disabled"
                    type="text"
                    placeholder="尚未同步"
                    disabled
                >
            </div>
            <!-- 更新行为 -->
            <div class="form-control flex flex-col gap-2 rounded-lg px-4">
                <label>
                    <p class="font-medium text-sm">
                        分数更新行为
                    </p>
                    <p class="text-xs text-base-content/60">
                        {{ updatingBehaviors.find(b => b.value === storage.updating_behavior)?.description }}
                    </p>
                </label>
                <select
                    v-model="storage.updating_behavior"
                    class="select select-bordered w-full"
                >
                    <option
                        v-for="behavior in updatingBehaviors"
                        :key="behavior.value"
                        :value="behavior.value"
                    >
                        {{ behavior.label }}
                    </option>
                </select>
            </div>
        </div>

        <div class="divider my-2">
            查分账号
        </div>

        <!-- 查分账号 -->
        <div class="form-control flex flex-col gap-2 rounded-lg px-4">
            <div class="flex items-center justify-between">
                <label>
                    <p class="font-medium text-sm">
                        已记住的账号
                    </p>
                    <p class="text-xs text-base-content/60">
                        管理已记住的查分器账号
                    </p>
                </label>
                <!-- 添加账号按钮 -->
                <button
                    data-tour="maicn-add-account"
                    class="btn btn-outline btn-sm"
                    type="button"
                    @click="openDialog()"
                >
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>添加</span>
                </button>
            </div>
            <div class="flex flex-col gap-2">
                <!-- 已绑定账号列表 -->
                <div
                    v-for="(account, index) in (storage.rem_accounts ?? [])"
                    :key="index"
                    :data-tour="`maicn-account-${index}`"
                    class="flex items-center justify-between gap-3 rounded-lg px-4 py-3 bg-base-200"
                >
                    <div class="flex items-center gap-3">
                        <span class="font-medium text-sm">{{ serverName(account.server) }}</span>
                        <span class="badge badge-ghost badge-sm">{{ account.label || '凭据已保存' }}</span>
                    </div>
                    <button
                        class="btn btn-ghost btn-sm btn-circle text-error shrink-0"
                        type="button"
                        @click="removeAccount(index)"
                    >
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        <footer class="flex">
            <button class="btn btn-primary w-full md:w-auto" type="submit" :disabled="storageSaving">
                <span v-if="storageSaving" class="loading loading-spinner" />
                <span>保存修改</span>
            </button>
        </footer>
    </form>

    <!-- 添加查分账号对话框 -->
    <dialog v-if="showAddDialog" class="modal modal-open">
        <div class="modal-box max-w-2xl">
            <!-- 关闭按钮 -->
            <form method="dialog">
                <button
                    class="btn btn-sm btn-circle btn-ghost absolute right-4 top-4"
                    type="button"
                    @click="closeDialog()"
                >
                    ✕
                </button>
            </form>

            <!-- 标题 -->
            <h3 class="font-semibold text-lg mb-4">
                添加查分账号
            </h3>

            <!-- 表单内容 -->
            <div class="space-y-4">
                <!-- 服务器选择下拉框 -->
                <div>
                    <label class="block text-sm font-medium mb-2">
                        选择查分器
                    </label>
                    <select
                        v-model="addAccountForm.server"
                        class="select select-bordered w-full"
                    >
                        <option
                            v-for="option in serverOptions"
                            :key="option.identifier"
                            :value="option.identifier"
                        >
                            {{ option.name }} - {{ option.description }}
                        </option>
                    </select>
                </div>

                <!-- 使用指南提示 -->
                <div v-if="selectedServerOption" class="rounded-lg bg-info/10 px-4 py-3 flex flex-col gap-1">
                    <p class="font-medium text-sm text-info">
                        {{ selectedServerOption.tipsTitle }}
                    </p>
                    <p class="text-xs text-base-content/70">
                        {{ selectedServerOption.tipsDesc }}
                    </p>
                    <a
                        :href="selectedServerOption.tipsUrl"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-xs text-primary underline mt-1"
                    >
                        前往 {{ selectedServerOption.name }} →
                    </a>
                </div>

                <!-- 标签输入 -->
                <div>
                    <label class="block text-sm font-medium mb-2">
                        账号标签
                    </label>
                    <input
                        v-model="addAccountForm.label"
                        class="input input-bordered w-full"
                        :class="{ 'input-error': ve('label') }"
                        type="text"
                        placeholder="使用标签来区分不同账号"
                        @keydown.enter.prevent="confirmAdd()"
                    >
                    <p v-if="ve('label')" class="text-error text-sm mt-1">
                        {{ ve('label') }}
                    </p>
                </div>

                <!-- 凭据输入 -->
                <div>
                    <label class="block text-sm font-medium mb-2">
                        账号凭据
                    </label>
                    <input
                        v-model="addAccountForm.credential"
                        class="input input-bordered w-full"
                        :class="{ 'input-error': ve('credential') }"
                        type="text"
                        :placeholder="selectedServerOption?.credentialsName ?? '输入凭据'"
                        @keydown.enter.prevent="confirmAdd()"
                    >
                    <p v-if="ve('credential')" class="text-error text-sm mt-1">
                        {{ ve('credential') }}
                    </p>
                </div>
            </div>

            <!-- 操作按钮 -->
            <div class="modal-action">
                <button class="btn" type="button" @click="closeDialog()">
                    取消
                </button>
                <button class="btn btn-primary" type="button" @click="confirmAdd()">
                    添加
                </button>
            </div>
        </div>
    </dialog>
</template>
