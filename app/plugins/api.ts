export default defineNuxtPlugin((nuxtApp) => {
    const leporid = $fetch.create({
        onRequest(context) {
            if (import.meta.server) {
                const reqHeaders = useRequestHeaders(['cookie'])
                context.options.headers.set('cookie', reqHeaders.cookie || '')
            }

            if (import.meta.client) {
                const loadingIndicator = useLoadingIndicator()
                loadingIndicator.start()
            }
        },
        onResponse(context) {
            const rawData = context.response._data

            if (rawData.code == 0 && rawData.data !== undefined) {
                context.response._data = rawData.data // unwrap data
            }

            if (import.meta.client) {
                const loadingIndicator = useLoadingIndicator()
                loadingIndicator.finish()
            }
        },
        onResponseError(context) {
            const leporidResp = context.response._data.data
            let errMessage = "Unexcpected response format from API"

            if (leporidResp.code && leporidResp.code !== 0) {
                errMessage = leporidResp.message // format error message
            }

            if (import.meta.client) {
                const { addNotification } = useNotificationsStore()
                addNotification({
                    type: 'error',
                    message: errMessage
                })
                Promise.reject(errMessage) // reject the promise
            }
        }
    })

    return {
        provide: {
            leporid: leporid
        }
    }
})