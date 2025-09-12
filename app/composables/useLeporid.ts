import type { ApiResponse } from '~/def/common'

interface UseApiOptions {
    showErrorToast?: boolean
    showSuccessToast?: boolean
    successMessage?: string
}

export const useLeporid = () => {
    const { addNotification } = useNotifications()
    const { startLoading, stopLoading, isLoading } = useLoading()

    const request = async <T = any>(
        url: string,
        options: Parameters<typeof $fetch>[1] & UseApiOptions = {}
    ): Promise<T | null> => {
        const {
            showErrorToast = true,
            showSuccessToast = false,
            successMessage,
            ...fetchOptions
        } = options

        startLoading()

        try {
            const response: any = await $fetch<T>(url, fetchOptions)

            if (showSuccessToast && successMessage) {
                addNotification({
                    type: 'success',
                    message: successMessage
                })
            }

            return response.data as T
        } catch (error: any) {
            if (showErrorToast) {
                const apiError = error.data as { data?: ApiResponse }
                const message = apiError.data?.message || '请求失败，请重试'

                addNotification({
                    type: 'error',
                    message
                })
            }

            throw error
        } finally {
            stopLoading()
        }
    }

    return {
        request,
        isLoading: isLoading
    }
}