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

    async function withSecondaryPin<T>(action: (headers: Record<string, string>) => Promise<T>): Promise<T | undefined> {
        if (import.meta.client)
            pin.value = sessionStorage.getItem(key)
        let rejected = false
        while (true) {
            try {
                return await action(pin.value ? { 'X-Pin': pin.value } : {})
            }
            catch (error: any) {
                if ((error?.statusCode ?? error?.status) !== 423)
                    throw error
                const hadPin = Boolean(pin.value)
                setPin(null)
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
