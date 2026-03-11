<script setup lang="ts">
import { useDefaultDesign } from '~/composables/design/UsagiCardDX/useDefaultDesign'
import CharaInfo from './widget/chara-info.vue'
import DXRating from './widget/dx-rating.vue'
import PlayerInfo from './widget/player-info.vue'

import QRCode from './widget/qr-code.vue'
import '../assets/css/main.css'

const props = defineProps<{ useDesignCtx: UseDesignCtx }>()
const { img } = useUtils()
const { currentDesign } = useDefaultDesign(props.useDesignCtx.rawDesign)
const { processImage } = useImageProcessor({
    rotate: Math.PI / 2, // 旋转90度
    scale: 0.5, // 缩放到75%
    featherSize: 50, // 50像素羽化
})

const landscapeCharacterImage = asyncComputed(() => {
    return currentDesign.value.enable_landscape ? processImage(currentDesign.value.character_id) : undefined
})
</script>

<template>
    <div class="card-hw isolate relative absolute-center font-adjust" :style="{ zoom: useDesignCtx.sketchpadScale.value }" data-theme="light">
        <!-- 卡片背面 -->
        <template v-if="useDesignCtx.displayMode.value === ArtifactDisplayMode.SKETCHPAD_BACK">
            <!-- 卡片背景 -->
            <img class="cover-image -z-20" :src="img(currentDesign.cardback_id)">

            <!-- 二维码 -->
            <div v-if="currentDesign.enable_qrcode_back" class="qrcode-hw back absolute">
                <QRCode :use-design-ctx="useDesignCtx" :current-design="currentDesign" />
            </div>
        </template>
        <!-- 卡片正面（横版） -->
        <template v-else-if="currentDesign.enable_landscape">
            <!-- 卡片背景 -->
            <img class="cover-image -z-20" :src="img(currentDesign.background_id)">
            <img v-if="landscapeCharacterImage" class="cover-image -z-15 character-landscape" :src="landscapeCharacterImage">

            <!-- DX分数框 -->
            <div class="dx-rating-hw-landscape absolute">
                <DXRating :current-design="currentDesign" />
            </div>

            <!-- 玩家信息框 -->
            <div class="player-info-hw-landscape absolute">
                <PlayerInfo :current-design="currentDesign" />
            </div>

            <!-- 角色信息框 -->
            <div class="chara-info-hw-landscape absolute">
                <CharaInfo :current-design="currentDesign" />
            </div>

            <!-- 二维码 -->
            <div v-if="currentDesign.enable_qrcode_front" class="qrcode-hw-landscape absolute">
                <QRCode :use-design-ctx="useDesignCtx" :current-design="currentDesign" />
            </div>

            <!-- 底部版本 -->
            <div
                v-if="currentDesign.simplified_code || currentDesign.game_version"
                class="footer-hw-landscape absolute flex justify-center"
            >
                <div class="w-[90%] flex justify-between py-0.5 rounded-2xl bg-gray-800 text-white opacity-85 px-1">
                    <p class="footer-text font-sega">
                        {{ currentDesign.simplified_code }}
                    </p>
                    <p class="footer-text font-sega">
                        {{ currentDesign.game_version }}
                    </p>
                </div>
            </div>
        </template>
        <!-- 卡片正面（竖版） -->
        <template v-else>
            <!-- 卡片背景 -->
            <img class="cover-image -z-20" :src="img(currentDesign.background_id)">
            <img class="cover-image -z-15" :src="img(currentDesign.character_id)">
            <img class="contain-image upper -z-5" :src="img(currentDesign.frame_id)">
            <img class="contain-image under -z-5" :src="img(currentDesign.frame_id)">

            <!-- DX分数框 -->
            <div class="dx-rating-hw absolute">
                <DXRating :current-design="currentDesign" />
            </div>

            <!-- 玩家信息框 -->
            <div class="player-info-hw absolute">
                <PlayerInfo :current-design="currentDesign" />
            </div>

            <!-- 角色信息框 -->
            <div class="chara-info-hw absolute">
                <CharaInfo :current-design="currentDesign" />
            </div>

            <!-- 二维码 -->
            <div v-if="currentDesign.enable_qrcode_front" class="qrcode-hw absolute">
                <QRCode :use-design-ctx="useDesignCtx" :current-design="currentDesign" />
            </div>

            <!-- 底部版本 -->
            <div
                v-if="currentDesign.simplified_code || currentDesign.game_version"
                class="footer-hw absolute flex justify-center"
            >
                <div class="w-[90%] flex justify-between py-0.5 rounded-2xl bg-gray-800 text-white opacity-85 px-1">
                    <p class="footer-text font-sega">
                        {{ currentDesign.simplified_code }}
                    </p>
                    <p class="footer-text font-sega">
                        {{ currentDesign.game_version }}
                    </p>
                </div>
            </div>
        </template>
    </div>
</template>

<style scoped>
.absolute-center {
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    transform-origin: top left;
}

.card-hw {
    width: 2.125in;
    height: 3.370in;
}

.qrcode-hw {
    bottom: 0.22in;
    right: 0.04in;
    width: 0.5in;
}

.qrcode-hw-landscape {
    bottom: 0in;
    right: 1.96in;
    width: 0.5in;
    transform-origin: bottom right; /* 以左上角为中心旋转 */
    transform: rotate(90deg);
}

.qrcode-hw.back {
    bottom: 0.05in;
}

.dx-rating-hw {
    top: 0.068in;
    right: 0.01in;
    width: 0.86in;
}

.character-landscape {
    left: 0.12in;
}

.dx-rating-hw-landscape {
    bottom: 0in;
    right: 0.25in;
    width: 0.86in;
    transform-origin: bottom right;
    transform: rotate(90deg);
}

.player-info-hw {
    top: 0.32in;
    right: 0.01in;
    width: 1in;
}

.player-info-hw-landscape {
    bottom: 0in;
    right: 0.6in;
    width: 1in;
    transform-origin: bottom right;
    transform: rotate(90deg);
    text-align: end;
}

.chara-info-hw {
    bottom: 0.5in;
    width: 0.9in;
}

.chara-info-hw-landscape {
    top: 0in;
    left: 0.48in;
    width: 0.9in;
    transform-origin: top left;
    transform: rotate(90deg);
}

.footer-hw {
    bottom: 0.04in;
    width: 100%;
    font-size: 4px;
    line-height: 120%;
}

.footer-hw-landscape {
    left: 0.12in;
    top: -0.16in;
    width: 3.68in;
    font-size: 4px;
    line-height: 120%;
    transform-origin: top left;
    transform: rotate(90deg);
}

.control-hw {
    bottom: 0.045in;
    width: 100%;
}

.cover-image {
    position: absolute;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.contain-image {
    position: absolute;
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.contain-image.upper {
    object-position: left top;
    clip-path: polygon(0 0, 100% 0, 100% 50%, 0 50%);
}

.contain-image.under {
    object-position: left bottom;
    clip-path: polygon(0 50%, 100% 50%, 100% 100%, 0 100%);
}
</style>
