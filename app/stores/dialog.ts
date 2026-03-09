interface DialogOptions {
    danger?: boolean
}

export const useDialogStore = defineStore('dialog', () => {
    const visible = ref(false)
    const type = ref<'confirm' | 'prompt'>('confirm')
    const message = ref('')
    const placeholder = ref('')
    const danger = ref(false)
    const resolveFn = ref<((value: any) => void) | null>(null)

    function confirm(msg: string, options?: DialogOptions): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            message.value = msg
            type.value = 'confirm'
            placeholder.value = ''
            danger.value = options?.danger ?? false
            resolveFn.value = resolve
            visible.value = true
        })
    }

    function prompt(msg: string, ph = ''): Promise<string | null> {
        return new Promise<string | null>((resolve) => {
            message.value = msg
            type.value = 'prompt'
            placeholder.value = ph
            danger.value = false
            resolveFn.value = resolve
            visible.value = true
        })
    }

    function respond(value: boolean | string | null) {
        if (resolveFn.value) {
            resolveFn.value(value)
            resolveFn.value = null
        }
        visible.value = false
    }

    return {
        visible,
        type,
        message,
        placeholder,
        danger,
        confirm,
        prompt,
        respond,
    }
})
