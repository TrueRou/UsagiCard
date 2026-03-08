<script setup lang="ts">
const dialogStore = useDialogStore()

const inputValue = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

watch(() => dialogStore.visible, async (v) => {
    if (v && dialogStore.type === 'prompt') {
        inputValue.value = ''
        await nextTick()
        inputRef.value?.focus()
    }
})

function handleConfirm() {
    if (dialogStore.type === 'prompt') {
        dialogStore.respond(inputValue.value || null)
    }
    else {
        dialogStore.respond(true)
    }
}

function handleCancel() {
    dialogStore.respond(dialogStore.type === 'prompt' ? null : false)
}

function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter')
        handleConfirm()
}
</script>

<template>
    <dialog class="modal" :class="{ 'modal-open': dialogStore.visible }">
        <div class="modal-box max-w-sm">
            <p class="py-2 text-sm leading-relaxed">
                {{ dialogStore.message }}
            </p>
            <input
                v-if="dialogStore.type === 'prompt'"
                ref="inputRef"
                v-model="inputValue"
                class="input input-bordered input-sm w-full mt-1"
                :placeholder="dialogStore.placeholder"
                @keydown="handleKeydown"
            >
            <div class="modal-action mt-4">
                <button class="btn btn-ghost btn-sm" @click="handleCancel">
                    取消
                </button>
                <button
                    class="btn btn-sm"
                    :class="dialogStore.danger ? 'btn-error' : 'btn-primary'"
                    @click="handleConfirm"
                >
                    确定
                </button>
            </div>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button @click="handleCancel">
                close
            </button>
        </form>
    </dialog>
</template>
