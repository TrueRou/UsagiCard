interface ApiFetchOptions {
    showErrorToast?: boolean
    showSuccessToast?: boolean
    successMessage?: string
}

interface ApiResponse<T = unknown> {
    code?: number
    message?: string
    data?: T
    timestamp?: string
    detail?: string
}

const UNAUTHORIZED = 401
const LOCKED = 423

export default defineNuxtPlugin<{ leporid: ReturnType<typeof $fetch.create> }>((nuxtApp) => {
    let pendingRequestCount = 0

    const startGlobalLoading = () => {
        if (!import.meta.client)
            return

        pendingRequestCount += 1
        if (pendingRequestCount === 1)
            useLoadingIndicator().start()
    }

    const stopGlobalLoading = () => {
        if (!import.meta.client)
            return

        pendingRequestCount = Math.max(0, pendingRequestCount - 1)
        if (pendingRequestCount === 0)
            useLoadingIndicator().finish()
    }

    const addToast = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
        if (!import.meta.client)
            return

        useNotificationsStore().addNotification({ type, message })
    }

    const shouldShowErrorToast = (options: ApiFetchOptions | undefined, method: string, status: number) => {
        if (options?.showErrorToast !== undefined)
            return options.showErrorToast

        if (method.toUpperCase() !== 'GET')
            return true

        return status >= 500
    }

    const resolveMessage = (rawData: ApiResponse | undefined, fallback: string) => {
        return rawData?.message || rawData?.detail || fallback
    }

    const handleUnauthorized = async (message?: string) => {
        const msg = message || '登录状态过期，请重新登录。'

        if (import.meta.server) {
            throw createError({
                statusCode: UNAUTHORIZED,
                statusMessage: '需要登录',
                message: msg,
                data: { to: '/auth/login', hint: '重新登录', clear: true },
            })
        }

        const route = useRoute()

        if (route.path === '/auth/login') {
            addToast('error', msg)
            return
        }

        await useUserSession().clear()
        addToast('error', msg)
        const redirect = encodeURIComponent(route.fullPath || '/')
        await nuxtApp.runWithContext(() => navigateTo(`/auth/login?redirect=${redirect}&clear=1`))
    }

    const leporid = $fetch.create({
        onRequest(context) {
            if (import.meta.server) {
                const reqHeaders = useRequestHeaders(['cookie'])
                const headers = new Headers(context.options.headers as HeadersInit | undefined)
                headers.set('cookie', reqHeaders.cookie || '')
                context.options.headers = headers
            }

            startGlobalLoading()
        },
        onRequestError(context) {
            stopGlobalLoading()

            const options = context.options as ApiFetchOptions
            const method = context.options.method?.toString() || 'GET'
            if (shouldShowErrorToast(options, method, 0))
                addToast('error', '网络连接失败，请检查网络后重试。')
        },
        onResponse(context) {
            stopGlobalLoading()

            const options = context.options as ApiFetchOptions
            const rawData = context.response._data as ApiResponse | undefined

            if (!rawData || typeof rawData.code !== 'number')
                return

            if (rawData.code !== 200) {
                const message = resolveMessage(rawData, context.response.statusText || '请求失败')

                if (rawData.code === UNAUTHORIZED) {
                    if (import.meta.client)
                        handleUnauthorized(message).catch(() => {})
                    throw createError({
                        statusCode: UNAUTHORIZED,
                        statusMessage: '需要登录',
                        message,
                        data: rawData,
                    })
                }

                if (rawData.code !== LOCKED && shouldShowErrorToast(options, context.options.method?.toString() || 'GET', rawData.code))
                    addToast('error', message)

                throw createError({
                    statusCode: rawData.code,
                    statusMessage: context.response.statusText,
                    data: rawData,
                    message,
                })
            }

            if (options?.showSuccessToast === true)
                addToast('success', options.successMessage || rawData.message || '操作成功')

            if (rawData.data !== undefined)
                context.response._data = rawData.data
        },
        async onResponseError(context) {
            stopGlobalLoading()

            const options = context.options as ApiFetchOptions
            const status = context.response.status
            const rawData = context.response._data as ApiResponse | undefined
            const isAppResponse = typeof rawData?.code === 'number'
            const message = resolveMessage(rawData, context.response.statusText || '请求失败')

            if (status === UNAUTHORIZED) {
                await handleUnauthorized(isAppResponse ? message : undefined)
                return
            }

            if (status === LOCKED)
                return

            if (shouldShowErrorToast(options, context.options.method?.toString() || 'GET', status))
                addToast('error', status >= 500 && !isAppResponse ? '服务暂时不可用，请稍后重试。' : message)
        },
    })

    return {
        provide: {
            leporid,
        },
    }
})
