<script setup lang="ts">
defineProps<{
    useDesignCtx: UseDesignCtx
    sketchpadComponent: string
}>()

const activeSide = ref<'front' | 'back'>('front')
</script>

<template>
    <div class="grid place-items-center mx-auto group perspective-1000">
        <!-- 反面卡片 -->
        <div
            class="col-start-1 row-start-1 w-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-pointer drop-shadow-xl"
            :class="[
                activeSide === 'back'
                    ? 'z-10 translate-y-0 translate-x-0 scale-100'
                    : 'z-0 translate-y-12 translate-x-12 scale-90 opacity-90 hover:translate-x-16 hover:translate-y-16 hover:-rotate-3',
            ]"
            @click="activeSide = 'back'"
        >
            <component
                :is="sketchpadComponent"
                :use-design-ctx="{ ...useDesignCtx, displayMode: toRef(ArtifactDisplayMode.SKETCHPAD_BACK), sketchpadScale: toRef(1.5) }"
                class="w-full h-full rounded-2xl overflow-hidden pointer-events-none"
            />
        </div>

        <!-- 正面卡片 -->
        <div
            class="col-start-1 row-start-1 w-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-pointer drop-shadow-xl"
            :class="[
                activeSide === 'front'
                    ? 'z-10 translate-y-0 translate-x-0 scale-100'
                    : 'z-0 translate-y-12 translate-x-12 scale-90 opacity-90 hover:translate-x-16 hover:translate-y-16 hover:-rotate-3',
            ]"
            @click="activeSide = 'front'"
        >
            <component
                :is="sketchpadComponent"
                :use-design-ctx="{ ...useDesignCtx, sketchpadScale: toRef(1.5) }"
                class="w-full h-full rounded-2xl overflow-hidden pointer-events-none"
            />
        </div>
    </div>
</template>

<style scoped>
.perspective-1000 {
    perspective: 1000px;
}
</style>
