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

            if (rawData.code == 200 && rawData.data !== undefined) {
                context.response._data = rawData.data // unwrap data
            }

            if (import.meta.client) {
                const loadingIndicator = useLoadingIndicator()
                loadingIndicator.finish()
            }
        },
        onResponseError(context) {
            if (import.meta.client) {
                const nuxtApp = useNuxtApp()
                const leporidResp = context.response._data.data

                if (leporidResp.code && leporidResp.code !== 200) {
                    const errMessage = nuxtApp.$i18n.t(`exceptions.${leporidResp.node}`) || nuxtApp.$i18n.t('exceptions.unknown-error')
                    const { addNotification } = useNotificationsStore()
                    addNotification({
                        type: 'error',
                        message: errMessage
                    })
                    Promise.reject(leporidResp) // reject the promise
                }
            }
        }
    })

    return {
        provide: {
            leporid: leporid
        }
    }
})