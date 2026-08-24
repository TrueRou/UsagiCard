import type { UseFetchOptions } from 'nuxt/app'

interface UseApiOptions {
    showErrorToast?: boolean
    showSuccessToast?: boolean
    successMessage?: string
    /** SSR 请求失败时不抛出错误页，交由页面通过 error ref 自行渲染 */
    soft?: boolean
}

export async function useLeporidae<T = any>(url: string, options: UseFetchOptions<T> & UseApiOptions = {}) {
    const nuxtApp = useNuxtApp()
    const asyncData = await useFetch<T>(url, {
        ...(options as any),
        $fetch: nuxtApp.$leporidae,
    })

    if (import.meta.server && asyncData.error.value && !options.soft) {
        const error = asyncData.error.value
        const statusCode = error.statusCode || error.status || 500
        const errorData = error.data as { message?: string } | undefined
        const message = errorData?.message || error.message

        if (statusCode >= 500) {
            throw createError({
                statusCode,
                statusMessage: '服务暂时不可用',
                message: message || '服务暂时不可用，请稍后重试。',
            })
        }

        throw createError({
            statusCode,
            statusMessage: error.statusMessage || '页面发生错误',
            message: message || '请求发生错误',
            data: error.data,
        })
    }

    return asyncData
}
