<script setup lang="ts">
import { useDefaultDesign } from '~/composables/design/UsagiCardDX/useDefaultDesign'
import CharaInfo from './widget/chara-info.vue'
import DXRating from './widget/dx-rating.vue'
import PlayerInfo from './widget/player-info.vue'

import QRCode from './widget/qr-code.vue'
import '../assets/css/main.css'

const props = defineProps<{ useDesignCtx: UseDesignCtx }>()
const route = useRoute()
const tabKey = route.query.tab as string | undefined
const { img } = useUtils()
const { currentDesign } = useDefaultDesign(props.useDesignCtx.rawDesign)

const useQButtonCtx = asyncComputed(async () => {
    const artifact = props.useDesignCtx.fromArtifact
    if (artifact.value) {
        const storageDefaultTab = (artifact.value.storage as UsagiCardStorage)?.default_qbutton_tab ?? undefined
        return useQButton(artifact as Ref<ArtifactUserResponse>, tabKey || storageDefaultTab)
    }
})

watch(() => props.useDesignCtx.fromArtifact.value, () => {
    if (props.useDesignCtx.fromArtifact.value) {
        const storage = props.useDesignCtx.fromArtifact.value?.storage as MaimaiStorage
        if (storage.player_rating)
            currentDesign.value.dx_rating = String(storage.player_rating)
        if (storage.friend_code)
            currentDesign.value.friend_code = String(storage.friend_code)
        if (storage.player_name)
            currentDesign.value.display_name = String(storage.player_name)
    }
}, { immediate: true })

const cardContainer = useTemplateRef<HTMLElement>('card-container')
const { lengthX, lengthY } = useSwipe(cardContainer, {
    threshold: 50,
    onSwipeEnd(_e, direction) {
        if (Math.abs(lengthX.value) < Math.abs(lengthY.value) * 1.5)
            return
        if (direction === 'left') {
            const artifactId = props.useDesignCtx.fromArtifact.value?.id
            if (artifactId)
                navigateTo(`/artifacts/${artifactId}/functions`)
        }
        else if (direction === 'right') {
            useQButtonCtx.value?.qDialogOpen(true)
        }
    },
})
</script>

<template>
    <div ref="card-container" class="isolate h-dvh dark:bg-gray-800">
        <DialogQButton v-if="useQButtonCtx" :ctx="useQButtonCtx" />

        <div class="relative h-full w-fit mx-auto" data-theme="light">
            <img class="object-cover h-full" fetchpriority="low" :src="img(currentDesign.background_id)">
            <div class="absolute inset-0">
                <img class="chara-center h-full absolute object-cover" fetchpriority="low" :src="img(currentDesign.character_id)">
                <template v-if="currentDesign.enable_mask && currentDesign.mask_id">
                    <div class="lazer-mask h-full w-full absolute" :style="{ maskImage: `url(${img(currentDesign.mask_id)})` }">
                        <div class="h-full w-full flow-colorful" />
                    </div>
                </template>
                <img class="frame-upper h-full absolute" fetchpriority="low" :src="img(currentDesign.frame_id)">
                <div class="absolute inset-0">
                    <div class="relative space-y-2 w-full">
                        <DXRating data-tour="card-dx-rating" class="pt-4 w-[40%]" :current-design="currentDesign" />
                        <PlayerInfo data-tour="card-player-info" :current-design="currentDesign" />
                    </div>
                </div>

                <CharaInfo class="bottom-[18%] absolute" :cuttent-design="currentDesign" />

                <QRCode data-tour="card-qrcode" class="absolute right-0 bottom-[6%] z-10" :use-design-ctx="useDesignCtx" :current-design="currentDesign" />

                <div
                    id="c-footer" class="flex absolute bottom-0 items-center justify-center w-full pb-[0.8%]"
                    :style="{ '--b-bottom': `url(${img(currentDesign.frame_id)})` }"
                >
                    <button v-if="useQButtonCtx" data-tour="card-rocket-btn" class="cursor-pointer" @click="useQButtonCtx.qDialogOpen(true)">
                        <div class="p-1 rounded-full bg-white" aria-label="rocket" role="img">
                            <svg
                                xmlns="http://www.w3.org/2000/svg" class="footer-icon" viewBox="-4 -4 32 32"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" aria-hidden="true"
                            >
                                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
                            </svg>
                        </div>
                    </button>
                    <div class="footer-widget flex justify-between py-1 rounded-2xl bg-gray-800 text-white opacity-85">
                        <p class="footer-text font-sega">
                            {{ currentDesign.simplified_code }}
                        </p>
                        <p class="footer-text font-sega">
                            {{ currentDesign.game_version }}
                        </p>
                    </div>
                    <NuxtLink data-tour="card-functions-btn" :to="`/artifacts/${useDesignCtx.fromArtifact.value?.id}/functions`">
                        <div class="p-1 rounded-full bg-white" aria-label="settings" role="img">
                            <svg
                                xmlns="http://www.w3.org/2000/svg" class="footer-icon" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <path d="M5 12h14" />
                                <path d="M12 5l7 7-7 7" />
                            </svg>
                        </div>
                    </NuxtLink>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.frame-upper {
    object-fit: contain;
    object-position: center top;
    clip-path: polygon(0 0, 100% 0, 100% 50%, 0 50%);
}

.chara-center {
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%)
}

.header-widget {
    padding-left: 2%;
    padding-right: 2%;
    padding-top: 0.4%;
}

.footer-widget {
    width: 80%;
    padding-left: 3%;
    padding-right: 3%;
}

.footer-text {
    font-size: clamp(1.2dvh, 2dvw, 1.8vmin);
    line-height: 120%;
}

.footer-icon {
    width: clamp(2dvh, 4dvw, 3vmin);;
}

.qr-front {
    bottom: 7%;
    right: 1%;
}

#c-footer {
    &:before {
        content: "";
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding-top: 100vh;

        background-image: var(--b-bottom);
        background-size: contain;
        background-repeat: no-repeat;
        background-position: left bottom;
        clip-path: polygon(0 50%, 100% 50%, 100% 100%, 0 100%);
    }

    >* {
        z-index: 1;
    }
}

.lazer-mask {
    mask-mode: alpha;
    mask-repeat: no-repeat;
    mask-size: cover;
    mask-position: center;
}

.flow-colorful {
    background: linear-gradient(to bottom right, red, yellow, blue);
    animation: hue 4s linear infinite;
}

@keyframes hue {
    from {
        filter: hue-rotate(0deg);
    }

    to {
        filter: hue-rotate(360deg);
    }
}
</style>
