import type { UseFetchOptions } from 'nuxt/app'
import type { CommonResponse } from '~/def'

interface UseApiOptions {
    showErrorToast?: boolean
    showSuccessToast?: boolean
    successMessage?: string
}

export const useLeporid = <T = any>(
    url: string,
    options: UseFetchOptions<T> & UseApiOptions = {}
) => {
    return useFetch<T>(url, {
        ...(options as any),
        $fetch: useNuxtApp().$leporid,
    })
}