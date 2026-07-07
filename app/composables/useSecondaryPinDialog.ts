let resolveRequest: ((token: string | null) => void) | null = null

export function useSecondaryPinDialog() {
    const artifactId = useState<string | null>('secondary-pin-artifact-id', () => null)
    const open = useState('secondary-pin-dialog-open', () => false)

    function request(nextArtifactId: string): Promise<string | null> {
        resolveRequest?.(null)
        resolveRequest = null
        artifactId.value = nextArtifactId
        open.value = true

        return new Promise((resolve) => {
            resolveRequest = resolve
        })
    }

    function finish(token: string | null) {
        const resolve = resolveRequest
        resolveRequest = null
        open.value = false
        artifactId.value = null
        resolve?.(token)
    }

    return {
        artifactId,
        open,
        request,
        handleVerified: (token: string) => finish(token),
        handleClose: () => finish(null),
    }
}
