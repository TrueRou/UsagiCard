<script setup lang="ts">
withDefaults(defineProps<{
    boxClass?: string
    title?: string
}>(), {
    boxClass: 'max-w-2xl',
    title: undefined,
})

const open = defineModel<boolean>('open', { default: false })
const dialog = ref<HTMLDialogElement | null>(null)

function sync(value: boolean) {
    const el = dialog.value
    if (!el)
        return
    if (value && !el.open)
        el.showModal()
    else if (!value && el.open)
        el.close()
}

watch(open, value => sync(value), { flush: 'post' })
onMounted(() => sync(open.value))
</script>

<template>
    <!-- data-no-swipe：弹窗内横滑不触发外壳的翻页手势 -->
    <dialog ref="dialog" class="modal modal-bottom sm:modal-middle" data-no-swipe @close="open = false">
        <div class="modal-box flex max-h-[90dvh] flex-col overflow-hidden p-0" :class="boxClass">
            <header v-if="title || $slots.header" class="flex shrink-0 items-start justify-between gap-3 border-b border-base-200 px-4 py-3 sm:px-5">
                <slot name="header">
                    <h3 class="text-base font-bold">
                        {{ title }}
                    </h3>
                </slot>
                <button class="btn btn-ghost btn-circle shrink-0 sm:btn-sm" type="button" aria-label="关闭" @click="open = false">
                    <Icon name="mdi:close" class="h-5 w-5" />
                </button>
            </header>
            <div class="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5" :class="$slots.footer ? '' : 'pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-4'">
                <slot v-if="open" />
            </div>
            <footer
                v-if="$slots.footer"
                class="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-base-200 bg-base-200/40 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:px-5 sm:pb-3"
            >
                <slot name="footer" />
            </footer>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button type="submit" aria-label="关闭">
                close
            </button>
        </form>
    </dialog>
</template>
