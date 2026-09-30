<script setup lang="ts">
import type { UsagiCardStorage } from '~/types/api'
import UsagiCardNfc from '~/components/function/usagi-card/settings/nfc.vue'

const route = useRoute()
const artifactId = route.params.id as string
const { storageOf, storageSave, storageSaving } = await useArtifact(artifactId)

const storage = ref<UsagiCardStorage>({
    ...storageOf('UsagiCard').value,
})

const derivedBehaviors = [
    { value: 'off' as const, label: '不处理', description: '忽略派生关系，直接使用本工件的内容' },
    { value: 'redirect' as const, label: '重定向', description: '自动重定向到源工件，始终跟随源工件的最新内容' },
]

async function setDerivedMode(enabledMode: 'off' | 'redirect') {
    storage.value.derived = {
        ...storage.value.derived,
        enabled_mode: enabledMode,
    }
    await storageSave('UsagiCard', storage.value, { showSuccessToast: false })
}
</script>

<template>
    <div class="p-4 space-y-5">
        <section class="rounded-xl border border-base-300 p-4 space-y-4">
            <div>
                <p class="font-medium text-sm">
                    NFC 写入
                </p>
                <p class="text-xs text-base-content/60">
                    重新写入卡片链接和启动模式
                </p>
            </div>
            <UsagiCardNfc :artifact-id="artifactId" />
        </section>

        <section v-if="storage.derived?.derived_from" class="rounded-xl border border-base-300 p-4 space-y-4">
            <div class="flex items-center justify-between gap-3">
                <div>
                    <p class="font-medium text-sm">
                        派生行为
                    </p>
                    <p class="text-xs text-base-content/60">
                        配置派生卡片的访问方式
                    </p>
                </div>
                <span v-if="storageSaving" class="loading loading-spinner loading-xs" />
            </div>

            <div
                v-for="behavior in derivedBehaviors"
                :key="behavior.value"
                class="rounded-xl border px-4 py-3 cursor-pointer"
                :class="storage.derived?.enabled_mode === behavior.value ? 'border-primary bg-primary/5' : 'border-base-300'"
                @click="setDerivedMode(behavior.value)"
            >
                <label class="flex items-center gap-3 cursor-pointer">
                    <input :checked="storage.derived?.enabled_mode === behavior.value" class="radio radio-primary" type="radio" :value="behavior.value" readonly>
                    <span>
                        <span class="block font-medium text-sm">{{ behavior.label }}</span>
                        <span class="block text-xs text-base-content/60">{{ behavior.description }}</span>
                    </span>
                </label>
            </div>
        </section>
    </div>
</template>
