interface UseSwipeOptions {
    onSwipeLeft?: () => void | Promise<void>
    onSwipeRight?: () => void | Promise<void>
    distance?: number
    directionRatio?: number
}

export function useSwipe(options: UseSwipeOptions = {}) {
    const swipeStart = ref<{ x: number, y: number, pointerId: number } | null>(null)
    const swipeTracking = ref(false)
    const distance = options.distance ?? 72
    const directionRatio = options.directionRatio ?? 1.5

    function isMobileViewport() {
        return import.meta.client && window.matchMedia('(max-width: 1023px)').matches
    }

    function shouldIgnoreSwipeTarget(target: EventTarget | null) {
        return target instanceof Element && Boolean(target.closest('button, a, input, textarea, select, [role="button"], [data-no-swipe]'))
    }

    function onSwipePointerDown(event: PointerEvent) {
        if (!isMobileViewport() || event.pointerType === 'mouse' || shouldIgnoreSwipeTarget(event.target))
            return
        swipeStart.value = { x: event.clientX, y: event.clientY, pointerId: event.pointerId }
        swipeTracking.value = true
    }

    function onSwipePointerMove(event: PointerEvent) {
        const start = swipeStart.value
        if (!start || start.pointerId !== event.pointerId)
            return
        const deltaX = event.clientX - start.x
        const deltaY = event.clientY - start.y
        swipeTracking.value = Math.abs(deltaX) > Math.abs(deltaY) * directionRatio
    }

    function onSwipePointerEnd(event: PointerEvent) {
        const start = swipeStart.value
        if (!start || start.pointerId !== event.pointerId)
            return

        swipeStart.value = null
        const canSwipe = swipeTracking.value
        swipeTracking.value = false
        if (!canSwipe)
            return

        const deltaX = event.clientX - start.x
        const deltaY = event.clientY - start.y
        if (Math.abs(deltaX) < distance || Math.abs(deltaX) <= Math.abs(deltaY) * directionRatio)
            return

        if (deltaX < 0)
            options.onSwipeLeft?.()
        else
            options.onSwipeRight?.()
    }

    function onSwipePointerCancel() {
        swipeStart.value = null
        swipeTracking.value = false
    }

    return {
        onSwipePointerCancel,
        onSwipePointerDown,
        onSwipePointerEnd,
        onSwipePointerMove,
    }
}
