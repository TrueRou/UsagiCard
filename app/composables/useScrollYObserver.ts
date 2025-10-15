const scrollY = ref<number>(0)
let done = false

if (import.meta.client && !done) {
    window.addEventListener('scroll', () => (scrollY.value = window.scrollY))
    done = true
}

export function useScrollYObserver(): Ref<number> {
    return scrollY
}
