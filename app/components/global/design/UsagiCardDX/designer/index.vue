<script setup lang="ts">
import { useCharacterMetadata } from '~/composables/design/UsagiCardDX/useCharacterMetadata'
import { useDefaultDesign } from '~/composables/design/UsagiCardDX/useDefaultDesign'
import { useImageSelector } from '~/composables/design/UsagiCardDX/useImageSelector'
import PreviewStack from './preview-stack.vue'

const props = defineProps<{
    useDesignCtx: UseDesignCtx
}>()

const { productSaveDesign: save, productSaving: isSaving, goToPrev, productAvailable } = await useProductDesigner(props.useDesignCtx.fromProduct)
const currentDesign: Ref<UsagiCardDxDesign> = useDefaultDesign(props.useDesignCtx.currentDesign)
const { matchCharacterMetadata, showMatchCharacterMetadataHelp } = await useCharacterMetadata(currentDesign)
const imageSelectorCtx = await useImageSelector(currentDesign)

const sketchpadComponent = computed(() => props.useDesignCtx.sketchpadComponent.value)

const showMobilePreview = ref(false)
</script>

<template>
    <div class="flex flex-col lg:flex-row h-full w-full">
        <ImageSelector :selector-ctx="imageSelectorCtx" />

        <!-- 左侧/顶部 预览区域 -->
        <div class="block w-full lg:w-1/2 shrink-0 bg-base-200 lg:h-full lg:py-0 py-20">
            <div class="p-4 flex flex-col items-center justify-center min-h-[40vh] lg:min-h-full">
                <div class="sticky top-4 flex justify-center w-full">
                    <PreviewStack :use-design-ctx="useDesignCtx" :sketchpad-component="sketchpadComponent" />
                </div>
            </div>
        </div>

        <!-- 右侧/底部 编辑区域 -->
        <div class="w-full lg:w-1/2 flex-1 lg:overflow-y-auto lg:mt-10 bg-base-100">
            <div class="p-4">
                <form class="space-y-4" @submit.prevent="save(currentDesign)">
                    <!-- 偏好设置标题 -->
                    <div class="divider my-2">
                        偏好设置
                    </div>

                    <!-- 偏好设置表单 -->
                    <div class="grid gap-4 md:grid-cols-2">
                        <!-- 玩家名称 -->
                        <div class="form-control flex flex-col gap-2 rounded-lg px-4 py-3">
                            <label>
                                <p class="font-medium text-sm">
                                    玩家名称
                                </p>
                                <p class="text-xs text-base-content/60">
                                    卡面右上方显示的玩家名称
                                </p>
                            </label>
                            <div class="flex items-center gap-3">
                                <input
                                    v-model="currentDesign.display_name" class="input input-bordered flex-1"
                                    type="text" placeholder="留空以隐藏角色信息框"
                                >
                            </div>
                        </div>

                        <!-- 卡面标签 -->
                        <div class="form-control flex flex-col gap-2 rounded-lg px-4 py-3">
                            <label>
                                <p class="font-medium text-sm">
                                    卡面标签
                                </p>
                                <p class="text-xs text-base-content/60">
                                    卡面底栏左侧显示的文字内容
                                </p>
                            </label>
                            <div class="flex items-center gap-3">
                                <input
                                    v-model="currentDesign.simplified_code" class="input input-bordered flex-1"
                                    type="text" placeholder="留空以隐藏文本"
                                >
                            </div>
                        </div>

                        <!-- 好友代码 -->
                        <div class="form-control flex flex-col gap-2 rounded-lg px-4 py-3">
                            <label>
                                <p class="font-medium text-sm">
                                    好友代码
                                </p>
                                <p class="text-xs text-base-content/60">
                                    卡面右上方显示的好友代码
                                </p>
                            </label>
                            <div class="flex items-center gap-3">
                                <input
                                    v-model="currentDesign.friend_code" class="input input-bordered flex-1"
                                    type="text" placeholder="留空以隐藏好友代码区域"
                                >
                            </div>
                        </div>

                        <!-- 游戏版本 -->
                        <div class="form-control flex flex-col gap-2 rounded-lg px-4 py-3">
                            <label>
                                <p class="font-medium text-sm">
                                    游戏版本
                                </p>
                                <p class="text-xs text-base-content/60">
                                    卡面底栏右侧显示的机台版本信息
                                </p>
                            </label>
                            <div class="flex items-center gap-3">
                                <input
                                    v-model="currentDesign.game_version" class="input input-bordered flex-1"
                                    type="text" placeholder="留空以隐藏文本"
                                >
                            </div>
                        </div>

                        <!-- 玩家评分 -->
                        <div class="form-control flex flex-col gap-2 rounded-lg px-4 py-3">
                            <label>
                                <p class="font-medium text-sm">
                                    DX 分数
                                </p>
                                <p class="text-xs text-base-content/60">
                                    卡面顶栏右侧显示的 DX Rating
                                </p>
                            </label>
                            <div class="flex items-center gap-3">
                                <input
                                    v-model="currentDesign.dx_rating" class="input input-bordered flex-1"
                                    type="text" placeholder="留空以隐藏分数框"
                                >
                            </div>
                        </div>

                        <!-- 立绘名称 -->
                        <div class="form-control flex flex-col gap-2 rounded-lg px-4 py-3">
                            <label>
                                <p class="font-medium text-sm">
                                    立绘名称
                                </p>
                                <p class="text-xs text-base-content/60">
                                    卡面左下方显示的角色立绘名称
                                </p>
                            </label>
                            <div class="flex items-center gap-3">
                                <input
                                    v-model="currentDesign.character_name" class="input input-bordered flex-1"
                                    type="text" placeholder="留空以单独隐藏立绘名称"
                                >
                            </div>
                        </div>

                        <!-- 卡号标签 -->
                        <div class="form-control flex flex-col gap-2 rounded-lg px-4 py-3">
                            <label>
                                <p class="font-medium text-sm">
                                    卡号标签
                                </p>
                                <p class="text-xs text-base-content/60">
                                    卡面左下方显示的卡号标签
                                </p>
                            </label>
                            <div class="flex items-center gap-3">
                                <input
                                    v-model="currentDesign.card_number_label" class="input input-bordered flex-1"
                                    type="text" placeholder="カード 番号"
                                >
                            </div>
                        </div>

                        <!-- 卡号内容 -->
                        <div class="form-control flex flex-col gap-2 rounded-lg px-4 py-3">
                            <label>
                                <p class="font-medium text-sm">
                                    卡号内容
                                </p>
                                <p class="text-xs text-base-content/60">
                                    卡面左下方显示的卡号内容
                                </p>
                            </label>
                            <div class="flex items-center gap-3">
                                <input
                                    v-model="currentDesign.card_number" class="input input-bordered flex-1"
                                    type="text" placeholder="0721"
                                >
                            </div>
                        </div>

                        <!-- 角色立绘区颜色 -->
                        <div class="form-control flex flex-col gap-2 rounded-lg px-4 py-3">
                            <label>
                                <p class="font-medium text-sm">
                                    角色立绘区颜色
                                </p>
                                <p class="text-xs text-base-content/60">
                                    角色立绘信息区的背景颜色
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
                                    玩家信息区颜色
                                </p>
                                <p class="text-xs text-base-content/60">
                                    玩家信息区的背景颜色
                                </p>
                            </label>
                            <div class="flex items-center gap-3">
                                <input
                                    v-model="currentDesign.player_info_color" class="input input-bordered flex-1"
                                    type="color"
                                >
                            </div>
                        </div>
                    </div>

                    <!-- 显示设置标题 -->
                    <div class="divider my-2">
                        显示设置
                    </div>

                    <!-- 显示设置表单 -->
                    <div class="grid gap-4 md:grid-cols-2">
                        <!-- 显示正面二维码 -->
                        <div class="form-control flex items-center justify-between gap-4 rounded-lg px-4 py-3">
                            <div>
                                <p class="font-medium text-sm">
                                    显示正面二维码
                                </p>
                                <p class="text-xs text-base-content/70">
                                    在卡片正面显示二维码
                                </p>
                            </div>
                            <input
                                v-model="currentDesign.enable_qrcode_front" class="toggle toggle-primary"
                                type="checkbox"
                            >
                        </div>

                        <!-- 显示正面二维码 -->
                        <div class="form-control flex items-center justify-between gap-4 rounded-lg px-4 py-3">
                            <div>
                                <p class="font-medium text-sm">
                                    显示反面二维码
                                </p>
                                <p class="text-xs text-base-content/70">
                                    在卡片反面显示二维码
                                </p>
                            </div>
                            <input
                                v-model="currentDesign.enable_qrcode_back" class="toggle toggle-primary"
                                type="checkbox"
                            >
                        </div>

                        <!-- 显示立绘信息 -->
                        <div class="form-control flex items-center justify-between gap-4 rounded-lg px-4 py-3">
                            <div>
                                <p class="font-medium text-sm">
                                    显示立绘信息
                                </p>
                                <p class="text-xs text-base-content/70">
                                    显示卡面左下方的立绘信息
                                </p>
                            </div>
                            <input
                                v-model="currentDesign.enable_chara_info" class="toggle toggle-primary"
                                type="checkbox"
                            >
                        </div>

                        <!-- 启用横版显示 -->
                        <div class="form-control flex items-center justify-between gap-4 rounded-lg px-4 py-3">
                            <div>
                                <p class="font-medium text-sm">
                                    启用横版布局
                                </p>
                                <p class="text-xs text-base-content/70">
                                    使用横版卡面布局
                                </p>
                            </div>
                            <input
                                v-model="currentDesign.enable_landscape" class="toggle toggle-primary"
                                type="checkbox"
                            >
                        </div>

                        <!-- 开启遮罩图层 -->
                        <div class="form-control flex items-center justify-between gap-4 rounded-lg px-4 py-3">
                            <div>
                                <p class="font-medium text-sm">
                                    开启遮罩图层
                                </p>
                                <p class="text-xs text-base-content/70">
                                    在立绘上应用遮罩图层渐变效果
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
                        图片设置
                    </div>

                    <!-- 图片设置表单 -->
                    <div class="grid gap-4 md:grid-cols-2">
                        <!-- 角色立绘 -->
                        <ImageChooseImage
                            :image-id="currentDesign.character_id"
                            label="角色立绘"
                            helper="覆盖在立绘上的装饰或遮挡层"
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
                            label="遮罩图层"
                            helper="覆盖在立绘上的装饰或遮挡层"
                            :allow-clear="true"
                            @select="imageSelectorCtx.openImageSelector('mask')"
                            @clear="imageSelectorCtx.clearImageSelect('mask')"
                        />

                        <!-- 正面背景 -->
                        <ImageChooseImage
                            :image-id="currentDesign.background_id"
                            label="正面背景"
                            helper="角色背后展示的背景"
                            :allow-clear="false"
                            @select="imageSelectorCtx.openImageSelector('background')"
                            @clear="imageSelectorCtx.clearImageSelect('background')"
                        />

                        <!-- 反面背景 -->
                        <ImageChooseImage
                            :image-id="currentDesign.cardback_id"
                            label="反面背景"
                            helper="卡背印刷的图片"
                            :allow-clear="false"
                            @select="imageSelectorCtx.openImageSelector('cardback', 'background')"
                            @clear="imageSelectorCtx.clearImageSelect('cardback')"
                        />

                        <!-- 边框 -->
                        <ImageChooseImage
                            :image-id="currentDesign.frame_id"
                            label="边框"
                            helper="包裹卡面的装饰框体"
                            :allow-clear="true"
                            @select="imageSelectorCtx.openImageSelector('frame')"
                            @clear="imageSelectorCtx.clearImageSelect('frame')"
                        />
                    </div>

                    <!-- 额外设置标题 -->
                    <div class="divider my-2">
                        额外设置
                    </div>

                    <!-- 额外设置表单 -->
                    <div class="grid gap-4 md:grid-cols-2">
                        <!-- 覆盖二维码 -->
                        <div class="form-control flex flex-col gap-2 rounded-lg px-4 py-3">
                            <label>
                                <p class="font-medium text-sm">
                                    覆盖二维码
                                </p>
                                <p class="text-xs text-base-content/60">
                                    覆盖二维码扫描内容
                                </p>
                            </label>
                            <div class="flex items-center gap-3">
                                <input
                                    v-model="currentDesign.override_qrcode" class="input input-bordered flex-1"
                                    type="text" placeholder="留空以保持默认行为"
                                >
                            </div>
                        </div>
                    </div>

                    <footer class="flex justify-end">
                        <button class="btn btn-primary w-full md:w-auto" type="submit" :disabled="isSaving || !productAvailable" @click.stop="goToPrev()">
                            <span v-if="isSaving" class="loading loading-spinner" />
                            <span>保存修改</span>
                        </button>
                    </footer>
                </form>
            </div>
        </div>

        <!-- 移动端预览悬浮按钮 -->
        <button
            class="btn btn-primary btn-circle fixed right-6 bottom-6 lg:hidden shadow-xl z-40 w-14 h-14"
            @click="showMobilePreview = true"
        >
            <div class="i-mingcute-eye-2-line text-2xl" />
        </button>

        <!-- 移动端预览模态框 -->
        <dialog class="modal modal-bottom sm:modal-middle" :class="{ 'modal-open': showMobilePreview }">
            <div class="modal-box bg-base-200 p-6 overflow-hidden max-h-screen relative flex flex-col items-center justify-center">
                <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 z-50" @click="showMobilePreview = false">
                    <div class="i-mingcute-close-line text-xl" />
                </button>
                <div class="w-full flex justify-center py-8">
                    <PreviewStack :use-design-ctx="useDesignCtx" :sketchpad-component="sketchpadComponent" />
                </div>
            </div>
            <form method="dialog" class="modal-backdrop">
                <button @click="showMobilePreview = false">
                    关闭
                </button>
            </form>
        </dialog>
    </div>
</template>
