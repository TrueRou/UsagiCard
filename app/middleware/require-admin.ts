export default defineNuxtRouteMiddleware(async (_to, _from) => {
    const { loggedIn, user } = useUserSession()

    if (loggedIn.value === false) {
        if (import.meta.client) {
            const { addNotification } = useNotificationsStore()
            addNotification({
                type: 'warning',
                message: '请登录以访问此页面。',
            })
        }
        return navigateTo(`/auth/login?redirect=${encodeURIComponent(_to.fullPath)}`)
    }

    // 检查用户是否持有任意管理权限
    const permissions = user.value?.permissions || []
    const hasAdminPermission = permissions.includes(UserPermission.ANY_ADMIN)

    if (!hasAdminPermission) {
        if (import.meta.client) {
            const { addNotification } = useNotificationsStore()
            addNotification({
                type: 'error',
                message: '您没有管理员权限。',
            })
        }
        return navigateTo('/')
    }
})
