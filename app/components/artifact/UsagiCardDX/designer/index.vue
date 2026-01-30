<script setup lang="ts">
import { useCharacterMetadata } from '~/composables/artifact/UsagiCardDX/useCharacterMetadata'
import { useImageSelector } from '~/composables/artifact/UsagiCardDX/useImageSelector'

const props = defineProps<{
    artifactCtx: UseArtifactCtx
    artifactDesign: UsagiCardDxDesign
}>()

const { t } = useI18n()
const currentDesign = ref<UsagiCardDxDesign>({ ...props.artifactDesign })
const { matchCharacterMetadata, showMatchCharacterMetadataHelp } = await useCharacterMetadata(currentDesign)
const imageSelectorCtx = await useImageSelector(currentDesign)

function goToPrev() {
    watch(() => props.artifactCtx.isSavingDesign, (newVal, oldVal) => {
        if (oldVal === true && newVal === false)
            useRouter().go(-1)
    })
}
</script>

<template>
    <div class="min-h-screen bg-base-200">
        <ImageSelector :selector-ctx="imageSelectorCtx" />

        <div class="mx-auto w-full max-w-6xl px-4 py-4 lg:py-10">
            <!-- Guest mode banner -->
            <section v-if="imageSelectorCtx.selectorReadonlyMode" class="rounded-box border border-warning bg-warning/10 p-4 mb-4">
                <div class="flex items-center gap-3">
                    <svg class="h-6 w-6 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                        <p class="font-semibold text-warning">
                            访客模式
                        </p>
                        <p class="text-sm text-base-content/70">
                            您正在使用访客模式，将无法上传自定义图片。
                        </p>
                    </div>
                </div>
            </section>

            <form class="space-y-4" @submit.prevent="artifactCtx.saveDesign(currentDesign)">
                <!-- 偏好设置标题 -->
                <div class="divider my-2">
                    {{ t("sections.preference") }}
                </div>

                <!-- 偏好设置表单 -->
                <div class="grid gap-4 md:grid-cols-2">
                    <!-- 玩家名称 -->
                    <div class="form-control flex flex-col gap-2 rounded-lg px-4 py-3">
                        <label>
                            <p class="font-medium text-sm">
                                {{ t("fields.displayName.label") }}
                            </p>
                            <p class="text-xs text-base-content/60">
                                {{ t(`fields.displayName.helper`) }}
                            </p>
                        </label>
                        <div class="flex items-center gap-3">
                            <input
                                v-model="currentDesign.display_name" class="input input-bordered flex-1"
                                type="text" :placeholder="t('fields.displayName.placeholder')"
                            >
                        </div>
                    </div>

                    <!-- 卡面标签 -->
                    <div class="form-control flex flex-col gap-2 rounded-lg px-4 py-3">
                        <label>
                            <p class="font-medium text-sm">
                                {{ t("fields.simplifiedCode.label") }}
                            </p>
                            <p class="text-xs text-base-content/60">
                                {{ t(`fields.simplifiedCode.helper`) }}
                            </p>
                        </label>
                        <div class="flex items-center gap-3">
                            <input
                                v-model="currentDesign.simplified_code" class="input input-bordered flex-1"
                                type="text" :placeholder="t('fields.simplifiedCode.placeholder')"
                            >
                        </div>
                    </div>

                    <!-- 好友代码 -->
                    <div class="form-control flex flex-col gap-2 rounded-lg px-4 py-3">
                        <label>
                            <p class="font-medium text-sm">
                                {{ t("fields.friendCode.label") }}
                            </p>
                            <p class="text-xs text-base-content/60">
                                {{ t(`fields.friendCode.helper`) }}
                            </p>
                        </label>
                        <div class="flex items-center gap-3">
                            <input
                                v-model="currentDesign.friend_code" class="input input-bordered flex-1"
                                type="text" :placeholder="t('fields.friendCode.placeholder')"
                            >
                        </div>
                    </div>

                    <!-- 游戏版本 -->
                    <div class="form-control flex flex-col gap-2 rounded-lg px-4 py-3">
                        <label>
                            <p class="font-medium text-sm">
                                {{ t("fields.maimaiVersion.label") }}
                            </p>
                            <p class="text-xs text-base-content/60">
                                {{ t(`fields.maimaiVersion.helper`) }}
                            </p>
                        </label>
                        <div class="flex items-center gap-3">
                            <input
                                v-model="currentDesign.game_version" class="input input-bordered flex-1"
                                type="text" :placeholder="t('fields.maimaiVersion.placeholder')"
                            >
                        </div>
                    </div>

                    <!-- 玩家评分 -->
                    <div class="form-control flex flex-col gap-2 rounded-lg px-4 py-3">
                        <label>
                            <p class="font-medium text-sm">
                                {{ t("fields.dxRating.label") }}
                            </p>
                            <p class="text-xs text-base-content/60">
                                {{ t(`fields.dxRating.helper`) }}
                            </p>
                        </label>
                        <div class="flex items-center gap-3">
                            <input
                                v-model="currentDesign.dx_rating" class="input input-bordered flex-1"
                                type="text" :placeholder="t('fields.dxRating.placeholder')"
                            >
                        </div>
                    </div>

                    <!-- 立绘名称 -->
                    <div class="form-control flex flex-col gap-2 rounded-lg px-4 py-3">
                        <label>
                            <p class="font-medium text-sm">
                                {{ t("fields.characterName.label") }}
                            </p>
                            <p class="text-xs text-base-content/60">
                                {{ t(`fields.characterName.helper`) }}
                            </p>
                        </label>
                        <div class="flex items-center gap-3">
                            <input
                                v-model="currentDesign.character_name" class="input input-bordered flex-1"
                                type="text" :placeholder="t('fields.characterName.placeholder')"
                            >
                        </div>
                    </div>

                    <!-- 角色立绘区颜色 -->
                    <div class="form-control flex flex-col gap-2 rounded-lg px-4 py-3">
                        <label>
                            <p class="font-medium text-sm">
                                {{ t("fields.charaInfoColor.label") }}
                            </p>
                            <p class="text-xs text-base-content/60">
                                {{ t(`fields.charaInfoColor.helper`) }}
                            </p>
                        </label>
                        <div class="flex items-center gap-3">
                            <input
                                v-model="currentDesign.chara_info_color" class="input input-bordered flex-1"
                                type="color"
                            >
                        </div>
                    </div>

                    <!-- 玩家信息区颜色 -->
                    <div class="form-control flex flex-col gap-2 rounded-lg px-4 py-3">
                        <label>
                            <p class="font-medium text-sm">
                                {{ t("fields.playerInfoColor.label") }}
                            </p>
                            <p class="text-xs text-base-content/60">
                                {{ t(`fields.playerInfoColor.helper`) }}
                            </p>
                        </label>
                        <div class="flex items-center gap-3">
                            <input
                                v-model="currentDesign.player_info_color" class="input input-bordered flex-1"
                                type="color"
                            >
                        </div>
                    </div>

                    <!-- 二维码尺寸 -->
                    <div class="form-control flex flex-col gap-2 rounded-lg px-4 py-3">
                        <label>
                            <p class="font-medium text-sm">
                                {{ t("fields.qrSize.label") }}
                            </p>
                            <p class="text-xs text-base-content/60">
                                {{ t("fields.qrSize.helper") }}
                            </p>
                        </label>
                        <div class="flex items-center gap-3 h-10">
                            <input
                                v-model="currentDesign.qr_size" class="range range-primary flex-1" type="range" min="8"
                                max="40"
                            >
                            <span class="badge badge-lg">
                                {{ currentDesign.qr_size }}
                                {{ t("fields.qrSize.unit") }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- 显示设置标题 -->
                <div class="divider my-2">
                    {{ t("sections.display") }}
                </div>

                <!-- 显示设置表单 -->
                <div class="grid gap-4 md:grid-cols-2">
                    <!-- 显示玩家名称 -->
                    <div class="form-control flex items-center justify-between gap-4 rounded-lg px-4 py-3">
                        <div>
                            <p class="font-medium text-sm">
                                {{ t("fields.showDisplayName.label") }}
                            </p>
                            <p class="text-xs text-base-content/70">
                                {{ t("fields.showDisplayName.helper") }}
                            </p>
                        </div>
                        <input
                            v-model="currentDesign.show_display_name" class="toggle toggle-primary"
                            type="checkbox"
                        >
                    </div>

                    <!-- 显示好友代码 -->
                    <div class="form-control flex items-center justify-between gap-4 rounded-lg px-4 py-3">
                        <div>
                            <p class="font-medium text-sm">
                                {{ t("fields.showFriendCode.label") }}
                            </p>
                            <p class="text-xs text-base-content/70">
                                {{ t("fields.showFriendCode.helper") }}
                            </p>
                        </div>
                        <input
                            v-model="currentDesign.show_friend_code" class="toggle toggle-primary"
                            type="checkbox"
                        >
                    </div>

                    <!-- 显示玩家评分 -->
                    <div class="form-control flex items-center justify-between gap-4 rounded-lg px-4 py-3">
                        <div>
                            <p class="font-medium text-sm">
                                {{ t("fields.showDxRating.label") }}
                            </p>
                            <p class="text-xs text-base-content/70">
                                {{ t("fields.showDxRating.helper") }}
                            </p>
                        </div>
                        <input
                            v-model="currentDesign.show_dx_rating" class="toggle toggle-primary"
                            type="checkbox"
                        >
                    </div>

                    <!-- 开启遮罩图层 -->
                    <div class="form-control flex items-center justify-between gap-4 rounded-lg px-4 py-3">
                        <div>
                            <p class="font-medium text-sm">
                                {{ t("fields.enableMask.label") }}
                            </p>
                            <p class="text-xs text-base-content/70">
                                {{ t("fields.enableMask.helper") }}
                            </p>
                        </div>
                        <input
                            v-model="currentDesign.enable_mask" class="toggle toggle-primary"
                            type="checkbox"
                        >
                    </div>
                </div>

                <!-- 图片设置标题 -->
                <div class="divider my-2">
                    {{ t("sections.images") }}
                </div>

                <!-- 图片设置表单 -->
                <div class="grid gap-4 md:grid-cols-2" data-tour="image-settings">
                    <!-- 角色立绘 -->
                    <ImageChooseImage
                        :image-id="currentDesign.character_id"
                        :label="t('images.character.label')"
                        :helper="t('images.character.helper')"
                        :alt="t('images.character.label')"
                        :allow-clear="true"
                        @select="imageSelectorCtx.openImageSelector('character')"
                        @clear="imageSelectorCtx.clearImageSelect('character')"
                    >
                        <template #actions>
                            <div class="flex items-center gap-1">
                                <button class="btn btn-sm btn-outline" type="button" @click="matchCharacterMetadata">
                                    匹配数据
                                </button>
                                <button class="btn btn-ghost btn-xs btn-circle" type="button" title="查看说明" @click="showMatchCharacterMetadataHelp">
                                    <span class="text-xs">?</span>
                                </button>
                            </div>
                        </template>
                    </ImageChooseImage>

                    <!-- 遮罩图层 -->
                    <ImageChooseImage
                        :image-id="currentDesign.mask_id"
                        :label="t('images.mask.label')"
                        :helper="t('images.mask.helper')"
                        :alt="t('images.mask.label')"
                        :allow-clear="true"
                        @select="imageSelectorCtx.openImageSelector('mask')"
                        @clear="imageSelectorCtx.clearImageSelect('mask')"
                    />

                    <!-- 背景 -->
                    <ImageChooseImage
                        :image-id="currentDesign.background_id"
                        :label="t('images.background.label')"
                        :helper="t('images.background.helper')"
                        :alt="t('images.background.label')"
                        :allow-clear="false"
                        @select="imageSelectorCtx.openImageSelector('background')"
                        @clear="imageSelectorCtx.clearImageSelect('background')"
                    />

                    <!-- 边框 -->
                    <ImageChooseImage
                        :image-id="currentDesign.frame_id"
                        :label="t('images.frame.label')"
                        :helper="t('images.frame.helper')"
                        :alt="t('images.frame.label')"
                        :allow-clear="true"
                        @select="imageSelectorCtx.openImageSelector('frame')"
                        @clear="imageSelectorCtx.clearImageSelect('frame')"
                    />
                </div>

                <footer class="flex justify-end">
                    <button class="btn btn-primary w-full md:w-auto" type="submit" data-tour="save-button" :disabled="artifactCtx.isSavingDesign" @click.stop="goToPrev()">
                        <span v-if="artifactCtx.isSavingDesign" class="loading loading-spinner" />
                        <span>保存修改</span>
                    </button>
                </footer>
            </form>
        </div>
    </div>
</template>

<i18n lang="yaml">
zh-CN:
  sections:
    preference: 自定义选项
    display: 显示设置
    images: 图片预览与设定
    accounts: 账号绑定
  fields:
    displayName:
      label: 玩家名称
      helper: 覆盖卡面右上方显示的玩家名称
      placeholder: 留空以自动获取
    simplifiedCode:
      label: 卡面标签
      helper: 覆盖卡面底栏左侧显示的随机码内容
      placeholder: 留空以自动获取
    friendCode:
      label: 好友代码
      helper: 覆盖卡面右上方显示的好友代码
      placeholder: 留空以自动获取
    characterName:
      label: 立绘名称
      helper: 覆盖卡面左下方显示的角色立绘名称
      placeholder: 留空以隐藏
    maimaiVersion:
      label: 游戏版本
      helper: 覆盖卡面底栏右侧显示的机台版本信息
      placeholder: 留空以自动获取
    dxRating:
      label: DX 分数
      helper: 覆盖卡面顶栏右侧显示的 DX Rating
      placeholder: 留空以自动获取
    qrSize:
      label: 二维码尺寸
      helper: 调整展示在卡面右下方的二维码大小
      unit: px
    charaInfoColor:
      label: 角色立绘区颜色
      helper: 角色立绘信息区的背景颜色
    playerInfoColor:
      label: 玩家信息区颜色
      helper: 玩家信息区的背景颜色
    showDisplayName:
      label: 显示玩家名称
      helper: 是否显示右上方玩家名称
    showFriendCode:
      label: 显示好友代码
      helper: 是否显示右上方好友代码
    showDxRating:
      label: 显示 DX 分数
      helper: 是否显示顶栏右侧 DX Rating
    showDate:
      label: 显示日期
      helper: 是否显示左下方日期
    enableMask:
      label: 开启遮罩图层
      helper: 是否在角色立绘上应用遮罩图层渐变效果
    account:
      server: 选择服务器
      credentials: 账号凭据
  images:
    title-default: 选择图片
    character:
      label: 角色立绘
      title: 选择角色立绘
      helper: 卡面正面展示的角色形象
    mask:
      label: 遮罩图层
      title: 选择遮罩图层
      helper: 覆盖在立绘上的装饰或遮挡层
    background:
      label: 背景
      title: 选择背景
      helper: 角色背后展示的背景
    frame:
      label: 边框
      title: 选择边框
      helper: 包裹卡面的装饰框体
    passname:
      label: 名牌横幅
      title: 选择名牌横幅
      helper: 卡片顶部显示名牌的横幅
</i18n>
