import type { InjectionKey, Ref } from 'vue'
import { computed, inject, onBeforeUnmount, onMounted, provide, shallowRef } from 'vue'

const functionsHeaderKey: InjectionKey<Readonly<Ref<HTMLElement | null>>> = Symbol('functions-header')

/** Suspense may mount children before the shell is attached to the document. */
export function useProvideFunctionsHeader() {
    const target = shallowRef<HTMLElement | null>(null)
    const mounted = shallowRef(false)

    onMounted(() => mounted.value = true)
    onBeforeUnmount(() => mounted.value = false)

    provide(functionsHeaderKey, computed(() => mounted.value ? target.value : null))
    return target
}

export function useFunctionsHeader() {
    return inject(functionsHeaderKey, computed(() => null))
}
