<script setup lang="ts">
const props = defineProps<{ ctx: UseQButtonCtx }>()
defineEmits<{
    onMaimaiUpdateComplete: []
}>()

const actions = computed(() => Object.entries(props.ctx.quickActions.value ?? {}))
</script>

<template>
    <Teleport to="body">
        <Transition name="modal">
            <div
                v-if="ctx.qDialogOpened.value"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                @click="ctx.qDialogOpen(false)"
            >
                <div
                    class="modal-card bg-base-100 rounded-2xl w-full max-w-md max-h-[90dvh] min-h-[50dvh] flex flex-col shadow-xl overflow-hidden"
                    @click.stop
                >
                    <!-- Tab 导航栏（兼作标题栏） -->
                    <div class="flex items-center border-b border-base-200 px-2 shrink-0">
                        <button
                            v-for="[key, action] in actions"
                            :key="key"
                            class="px-4 py-3 text-sm font-medium border-b-2 transition-colors"
                            :class="ctx.activeQuickActionKey.value === key
                                ? 'border-primary text-primary'
                                : 'border-transparent text-base-content/60 hover:text-base-content'"
                            @click="ctx.switchQuickAction(key)"
                        >
                            {{ action.label }}
                        </button>
                        <button class="btn btn-ghost btn-sm btn-circle ml-auto" @click="ctx.qDialogOpen(false)">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M18 6 6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <!-- 内容区 -->
                    <div class="flex-1 min-h-0 overflow-y-auto p-2">
                        <Transition name="tab-fade" mode="out-in">
                            <component
                                :is="ctx.activeQuickAction.value?.component"
                                :key="ctx.activeQuickActionKey.value"
                                :artifact-id="ctx.artifact.value.id"
                                class="w-full h-full"
                                @on-maimai-update-complete="$emit('onMaimaiUpdateComplete')"
                            />
                        </Transition>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-active .modal-card,
.modal-leave-active .modal-card {
    transition: transform 0.2s ease, opacity 0.2s ease;
}
.modal-enter-from .modal-card,
.modal-leave-to .modal-card {
    transform: scale(0.95) translateY(8px);
    opacity: 0;
}

.tab-fade-enter-active,
.tab-fade-leave-active {
    transition: opacity 0.15s ease;
}
.tab-fade-enter-from,
.tab-fade-leave-to {
    opacity: 0;
}
</style>
