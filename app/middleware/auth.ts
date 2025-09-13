export default defineNuxtRouteMiddleware((to, from) => {
    const { loggedIn } = useUserSession()
    const nuxtApp = useNuxtApp()

    nuxtApp.$i18n

    if (loggedIn.value === false) {
        if (import.meta.client) {
            const { addNotification } = useNotificationsStore()
            addNotification({
                type: 'warning',
                message: nuxtApp.$i18n.t('middleware.login-required'),
            })
        }
        return navigateTo('/auth/login')
    }
})