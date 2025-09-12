interface UseApiOptions {
    showErrorToast?: boolean
    showSuccessToast?: boolean
    successMessage?: string
}

export const useLeporid = <T = any>(
    url: string,
    options: Parameters<typeof useFetch>[1] & UseApiOptions = {}
) => {
    const {
        showErrorToast = true,
        showSuccessToast = false,
        successMessage,
        ...fetchOptions
    } = options

    const { data, error, pending, refresh } = useFetch<{ data: T }>(url, {
        ...(fetchOptions as any),
        onResponse({ response }) {
            if (showSuccessToast && successMessage && import.meta.client) {
                const { addNotification } = useNotificationsStore()
                addNotification({
                    type: 'success',
                    message: successMessage
                })
            }
        },
        onResponseError({ response }) {
            if (showErrorToast && import.meta.client) {
                const apiError = response._data as { data?: any }
                const message = apiError.data?.message || '请求失败，请重试'

                const { addNotification } = useNotificationsStore()
                addNotification({
                    type: 'error',
                    message
                })
            }
        }
    })

    return {
        data: computed(() => data.value?.data as T),
        error,
        pending,
        refresh
    }
}