<script setup lang="ts">
import { useCharacterMetadata } from '~/composables/design/UsagiCardDX/useCharacterMetadata'
import { useDefaultDesign } from '~/composables/design/UsagiCardDX/useDefaultDesign'
import { useImageSelector } from '~/composables/design/UsagiCardDX/useImageSelector'

const props = defineProps<{
    useDesignCtx: UseDesignCtx
}>()

const { productSaveDesign: save, productSaving: isSaving } = await useProduct(props.useDesignCtx.productId)
const currentDesign = ref<UsagiCardDxDesign>({ ...useDefaultDesign(props.useDesignCtx.rawDesign).currentDesign.value })
const { matchCharacterMetadata, showMatchCharacterMetadataHelp } = await useCharacterMetadata(currentDesign)
const imageSelectorCtx = await useImageSelector(currentDesign)

function goToPrev() {
    watch(() => isSaving.value, (newVal, oldVal) => {
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
                        :image-id="currentDesign.background_id"
                        label="反面背景"
                        helper="卡背印刷的图片"
                        :allow-clear="false"
                        @select="imageSelectorCtx.openImageSelector('background')"
                        @clear="imageSelectorCtx.clearImageSelect('background')"
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
                    <button class="btn btn-primary w-full md:w-auto" type="submit" :disabled="isSaving" @click.stop="goToPrev()">
                        <span v-if="isSaving" class="loading loading-spinner" />
                        <span>保存修改</span>
                    </button>
                </footer>
            </form>
        </div>
    </div>
</template>
