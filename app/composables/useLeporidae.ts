import type { UseFetchOptions } from 'nuxt/app'

// showErrorToast / showSuccessToast / successMessage 已通过 types/fetch.d.ts 增强到 ofetch 的 FetchOptions，
// UseFetchOptions 会继承它们；这里只声明 useLeporidae 包装层自身的选项。
interface UseApiOptions {
    /** SSR 请求失败时不抛出错误页，交由页面通过 error ref 自行渲染 */
    soft?: boolean
}

export async function useLeporidae<T = any>(url: string, options: UseFetchOptions<T> & UseApiOptions = {}) {
    const { soft, ...fetchOptions } = options
    const nuxtApp = useNuxtApp()
    // useFetch 的选项类型依赖未决的条件类型（ResT extends void ? 路由推断 : ResT），
    // 泛型 T 下的 UseFetchOptions<T> 无法直接赋值，只在转发处擦除选项类型
    const asyncData = await useFetch<T>(url, {
        ...(fetchOptions as object),
        $fetch: nuxtApp.$leporidae,
    })

    if (import.meta.server && asyncData.error.value && !soft) {
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
