<script setup lang="ts">
import NfcWriter from './nfc-writer.vue'

const props = defineProps<{
    artifactId: string
}>()

const showNfcWriter = ref(false)
</script>

<template>
    <section class="space-y-4">
        <div class="rounded-lg bg-base-200/60 px-4 py-3 text-sm text-base-content/70">
            <p>修改卡片的 NFC 配置</p>
            <p class="mt-1 text-xs text-base-content/50">
                Web NFC 需要 Android Chrome 等支持读写 NFC 的浏览器。
            </p>
        </div>

        <button class="btn btn-primary w-full" type="button" @click="showNfcWriter = true">
            <Icon name="mdi:nfc-variant" class="w-5 h-5" />
            开始写入
        </button>

        <NfcWriter
            :show="showNfcWriter"
            :artifact-id="props.artifactId"
            @close="showNfcWriter = false"
            @success="showNfcWriter = false"
        />
    </section>
</template>
