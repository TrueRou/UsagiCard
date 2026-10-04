/** 静默模式下遇到二级密码保护时返回的标记 */
export const PIN_LOCKED = Symbol('pin-locked')

interface WithSecondaryPinOptions {
    /** false 时遇到 423 不弹出 PIN 输入框，直接返回 PIN_LOCKED */
    prompt?: boolean
}

function isLockedError(error: any) {
    return (error?.statusCode ?? error?.status) === 423
}

export function useArtifactPin(artifactId: string) {
    const key = `artifact:${artifactId}:secondary-pin`
    const pin = useState<string | null>(key, () => null)
    const { request } = useSecondaryPinDialog()

    function setPin(value: string | null) {
        pin.value = value
        if (import.meta.client) {
            if (value)
                sessionStorage.setItem(key, value)
            else
                sessionStorage.removeItem(key)
        }
    }

    function withSecondaryPin<T>(action: (headers: Record<string, string>) => Promise<T>, options: { prompt: false }): Promise<T | undefined | typeof PIN_LOCKED>
    function withSecondaryPin<T>(action: (headers: Record<string, string>) => Promise<T>, options?: WithSecondaryPinOptions): Promise<T | undefined>
    async function withSecondaryPin<T>(action: (headers: Record<string, string>) => Promise<T>, options: WithSecondaryPinOptions = {}): Promise<T | undefined | typeof PIN_LOCKED> {
        const prompt = options.prompt ?? true
        if (import.meta.client)
            pin.value = sessionStorage.getItem(key)
        let rejected = false
        while (true) {
            try {
                return await action(pin.value ? { 'X-Pin': pin.value } : {})
            }
            catch (error: any) {
                if (!isLockedError(error))
                    throw error
                const hadPin = Boolean(pin.value)
                setPin(null)
                if (!prompt)
                    return PIN_LOCKED
                const nextPin = await request(artifactId, rejected || hadPin ? '密码错误，请重新输入' : '')
                if (!nextPin)
                    return undefined
                setPin(nextPin)
                rejected = true
            }
        }
    }

    return { withSecondaryPin }
}
