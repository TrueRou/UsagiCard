<script setup lang="ts">
import CharaInfo from './widget/chara-info.vue'
import DXRating from './widget/dx-rating.vue'
import PlayerInfo from './widget/player-info.vue'
import QRCode from './widget/qr-code.vue'

import '../assets/css/main.css'

defineProps<{
    artifactCtx: UseArtifactCtx
    artifactDesign: UsagiCardDxDesign
}>()

const { img } = useUtils()
</script>

<template>
    <div class="card-hw isolate relative absolute-center font-adjust" :style="{ zoom: artifactCtx.sketchpadScale.value }" data-theme="light">
        <!-- 卡片背面 -->
        <template v-if="artifactCtx.displayMode.value === ArtifactDisplayMode.SKETCHPAD_BACK">
            <!-- 卡片背景 -->
            <img class="cover-image -z-20" :src="img(artifactDesign.cardback_id)">

            <!-- 二维码 -->
            <div v-if="artifactDesign.show_qrcode_back" class="qrcode-hw back absolute">
                <QRCode :artifact-ctx="artifactCtx" :artifact-design="artifactDesign" />
            </div>
        </template>

        <!-- 卡片正面 -->
        <template v-else>
            <!-- 卡片背景 -->
            <img class="cover-image -z-20" :src="img(artifactDesign.background_id)">
            <img class="cover-image -z-15" :src="img(artifactDesign.character_id)">
            <img class="contain-image upper -z-5" :src="img(artifactDesign.frame_id)">
            <img class="contain-image under -z-5" :src="img(artifactDesign.frame_id)">

            <!-- DX分数框 -->
            <div v-if="artifactDesign.show_dx_rating" class="dx-rating-hw absolute">
                <DXRating :artifact-ctx="artifactCtx" :artifact-design="artifactDesign" />
            </div>

            <!-- 玩家信息框 -->
            <div v-if="artifactDesign.show_character_name" class="player-info-hw absolute">
                <PlayerInfo :artifact-ctx="artifactCtx" :artifact-design="artifactDesign" />
            </div>

            <!-- 角色信息框 -->
            <div v-if="artifactDesign.show_character_name" class="chara-info-hw absolute">
                <CharaInfo :artifact-ctx="artifactCtx" :artifact-design="artifactDesign" />
            </div>

            <!-- 二维码 -->
            <div v-if="artifactDesign.show_qrcode_front" class="qrcode-hw absolute">
                <QRCode :artifact-ctx="artifactCtx" :artifact-design="artifactDesign" />
            </div>

            <!-- 底部版本 -->
            <div
                v-if="artifactDesign.simplified_code || artifactDesign.game_version"
                class="footer-hw absolute flex justify-center"
            >
                <div class="w-[90%] flex justify-between py-0.5 rounded-2xl bg-gray-800 text-white opacity-85 px-1">
                    <p class="footer-text font-sega">
                        {{ artifactDesign.simplified_code }}
                    </p>
                    <p class="footer-text font-sega">
                        {{ artifactDesign.game_version }}
                    </p>
                </div>
            </div>
        </template>
    </div>
</template>

<style scoped>
.card-hw {
    width: 2.125in;
    height: 3.370in;
}

.qrcode-hw {
    bottom: 0.22in;
    right: 0.04in;
    width: 0.5in;
}

.qrcode-hw.back {
    bottom: 0.05in;
}

.dx-rating-hw {
    top: 0.068in;
    right: 0.01in;
    width: 0.86in;
}

.player-info-hw {
    top: 0.32in;
    right: 0.01in;
    width: 1in;
}

.chara-info-hw {
    bottom: 0.5in;
    width: 0.9in;
}

.footer-hw {
    bottom: 0.04in;
    width: 100%;
    font-size: 4px;
    line-height: 120%;
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
