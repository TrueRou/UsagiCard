<script setup lang="ts">
import type { QRCodeToDataURLOptions } from 'qrcode'
import type { UseDesignCtx } from '~/composables/useDesign'
import type { UsagiCardDxDesign } from '~/types/api'
import QRCode from 'qrcode'
import { joinURL } from 'ufo'
import { useTemplateRef, watchEffect } from 'vue'

const props = defineProps<{
    useDesignCtx?: UseDesignCtx
    design: Required<UsagiCardDxDesign>
}>()

const qrcodeOpts = {
    errorCorrectionLevel: 'L',
    type: 'image/jpeg',
    quality: 0.3,
    margin: 1,
} as QRCodeToDataURLOptions

const qrImage = useTemplateRef('qr-image')

const qrUrl = computed(() => {
    if (props.design.override_qrcode) {
        return props.design.override_qrcode
    }
    if (props.useDesignCtx?.fromArtifact.value?.id) {
        return joinURL(useRuntimeConfig().public.URL, 'artifacts', props.useDesignCtx.fromArtifact.value.id)
    }
    return useRuntimeConfig().public.URL
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
    <div class="w-full h-full rounded bg-white">
        <img ref="qr-image" class="w-full h-full">
    </div>
</template>
