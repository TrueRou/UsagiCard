<script setup lang="ts">
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
        description: 'DivingFish - 舞萌 DX 查分器',
        tipsTitle: '水鱼查分器使用指南',
        tipsDesc: '如果您没有使用过水鱼查分器，开始之前，建议您先注册一个查分器账户。登录水鱼后，点击编辑个人资料，复制成绩导入 Token，填入下方即可。',
        tipsUrl: 'https://www.diving-fish.com/maimaidx/prober/',
        credentialsName: '水鱼 Import-Token',
    },
    {
        identifier: 'lxns' as const,
        name: '落雪查分器',
        description: '落雪咖啡屋 - maimai DX 查分器',
        tipsTitle: '落雪查分器使用指南',
        tipsDesc: '使用落雪查分器之前，请先注册落雪账号，并且通过落雪官方途径至少上传一次成绩。完成后，进入账号详情，点击第三方应用，复制个人 API 密钥，填入下方即可。',
        tipsUrl: 'https://maimai.lxns.net/',
        credentialsName: '个人 API 密钥',
    },
]

const updatingBehaviors = [
    {
        value: 'adhoc' as const,
        label: '广播发布',
        description: '从一个数据源更新到其他数据源',
    },
    {
        value: 'aggregate' as const,
        label: '聚合同步',
        description: '从所有数据源拉取、聚合后更新到所有数据源',
    },
]

const newAccount = ref<{ server: 'diving_fish' | 'lxns', credential: string }>({
    server: 'diving_fish',
    credential: '',
})

const selectedServerOption = computed(() =>
    serverOptions.find(o => o.identifier === newAccount.value.server),
)

function addAccount() {
    const cred = newAccount.value.credential.trim()
    if (!cred)
        return
    storage.value.rem_accounts = [
        ...(storage.value.rem_accounts ?? []),
        { server: newAccount.value.server, credential: cred },
    ]
    newAccount.value.credential = ''
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
        <!-- 更新行为 -->
        <div class="divider my-2">
            更新行为
        </div>

        <div class="grid gap-4 md:grid-cols-2">
            <div
                v-for="behavior in updatingBehaviors"
                :key="behavior.value"
                class="form-control rounded-lg px-4 py-3 cursor-pointer"
                :class="storage.updating_behavior === behavior.value ? 'outline-2 outline-primary' : ''"
                @click="storage.updating_behavior = behavior.value"
            >
                <label class="flex items-center gap-3 cursor-pointer">
                    <input
                        v-model="storage.updating_behavior"
                        class="radio radio-primary"
                        type="radio"
                        :value="behavior.value"
                    >
                    <div>
                        <p class="font-medium text-sm">
                            {{ behavior.label }}
                        </p>
                        <p class="text-xs text-base-content/60">
                            {{ behavior.description }}
                        </p>
                    </div>
                </label>
            </div>
        </div>

        <!-- 账号信息（只读） -->
        <div class="divider my-2">
            账号信息
        </div>

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
                    :value="storage.updating_at ?? ''"
                    class="input w-full input-bordered input-disabled"
                    type="text"
                    placeholder="尚未同步"
                    disabled
                >
            </div>
        </div>

        <!-- 查分账号 -->
        <div class="divider my-2">
            查分账号
        </div>

        <div class="flex flex-col gap-3">
            <!-- 已绑定账号列表 -->
            <div
                v-for="(account, index) in (storage.rem_accounts ?? [])"
                :key="index"
                class="flex items-center justify-between gap-3 rounded-lg px-4 py-3 bg-base-200"
            >
                <div class="flex items-center gap-3">
                    <span class="font-medium text-sm">{{ serverName(account.server) }}</span>
                    <span class="badge badge-ghost badge-sm">凭据已保存</span>
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

            <!-- 添加新账号 -->
            <div class="rounded-lg border border-base-300 px-4 py-3 flex flex-col gap-3">
                <p class="font-medium text-sm">
                    添加查分账号
                </p>

                <!-- 服务器选择 -->
                <div class="grid gap-3 md:grid-cols-2">
                    <div
                        v-for="option in serverOptions"
                        :key="option.identifier"
                        class="form-control rounded-lg px-3 py-2 cursor-pointer"
                        :class="newAccount.server === option.identifier ? 'outline-2 outline-primary' : ''"
                        @click="newAccount.server = option.identifier"
                    >
                        <label class="flex items-center gap-3 cursor-pointer">
                            <input
                                v-model="newAccount.server"
                                class="radio radio-primary radio-sm"
                                type="radio"
                                :value="option.identifier"
                            >
                            <div>
                                <p class="font-medium text-sm">
                                    {{ option.name }}
                                </p>
                                <p class="text-xs text-base-content/60">
                                    {{ option.description }}
                                </p>
                            </div>
                        </label>
                    </div>
                </div>

                <!-- 选中服务器的使用指南 -->
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

                <!-- 凭据输入 -->
                <div class="flex items-center gap-2">
                    <input
                        v-model="newAccount.credential"
                        class="input input-bordered flex-1"
                        type="text"
                        :placeholder="selectedServerOption?.credentialsName ?? '凭据'"
                        @keydown.enter.prevent="addAccount()"
                    >
                    <button
                        class="btn btn-outline btn-sm shrink-0"
                        type="button"
                        @click="addAccount()"
                    >
                        添加
                    </button>
                </div>
            </div>
        </div>

        <footer class="flex justify-end">
            <button class="btn btn-primary w-full md:w-auto" type="submit" :disabled="storageSaving">
                <span v-if="storageSaving" class="loading loading-spinner" />
                <span>保存修改</span>
            </button>
        </footer>
    </form>
</template>
