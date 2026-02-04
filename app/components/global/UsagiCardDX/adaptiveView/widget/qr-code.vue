<script setup lang="ts">
import type { QRCodeToDataURLOptions } from 'qrcode'
import QRCode from 'qrcode'
import { joinURL } from 'ufo'
import { useTemplateRef, watchEffect } from 'vue'

const props = defineProps<{
    artifactCtx: UseArtifactCtx
    artifactDesign: UsagiCardDxDesign
}>()

const qrcodeOpts = {
    errorCorrectionLevel: 'L',
    type: 'image/jpeg',
    quality: 0.3,
    margin: 1,
} as QRCodeToDataURLOptions

const qrImage = useTemplateRef('qr-image')

const qrUrl = computed(() => {
    if (props.artifactDesign.override_qrcode) {
        return props.artifactDesign.override_qrcode
    }
    return joinURL(useRuntimeConfig().public.baseURL, 'artifacts', props.artifactCtx.artifact.value.id)
})

watchEffect(() => {
    if (qrImage.value) {
        QRCode.toDataURL(qrUrl.value, qrcodeOpts, (err, url) => {
            if (err)
                console.error(err)
            qrImage.value!.src = url
        })
    }
})
</script>

<template>
    <div class="p-0.5 rounded bg-white">
        <img ref="qr-image" class="w-full h-full" fetchpriority="high">
    </div>
</template>
