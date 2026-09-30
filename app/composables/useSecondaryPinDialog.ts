let resolveRequest: ((token: string | null) => void) | null = null
let pendingRequest: Promise<string | null> | null = null

export function useSecondaryPinDialog() {
    const artifactId = useState<string | null>('secondary-pin-artifact-id', () => null)
    const open = useState('secondary-pin-dialog-open', () => false)
    const requestId = useState('secondary-pin-request-id', () => 0)
    const errorMessage = useState('secondary-pin-error', () => '')

    function request(nextArtifactId: string, message = ''): Promise<string | null> {
        if (pendingRequest && artifactId.value === nextArtifactId)
            return pendingRequest
        resolveRequest?.(null)
        resolveRequest = null
        artifactId.value = nextArtifactId
        open.value = true
        errorMessage.value = message
        requestId.value += 1

        pendingRequest = new Promise((resolve) => {
            resolveRequest = resolve
        })
        return pendingRequest
    }

    function finish(token: string | null) {
        const resolve = resolveRequest
        resolveRequest = null
        pendingRequest = null
        open.value = false
        artifactId.value = null
        resolve?.(token)
    }

    return {
        artifactId,
        open,
        requestId,
        errorMessage,
        request,
        handleVerified: (token: string) => finish(token),
        handleClose: () => finish(null),
    }
}
