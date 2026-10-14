import { withQuery } from 'ufo'

/** UsagiLab 账号登录入口（服务端 OAuth 授权码 + PKCE），登录完成后回到 redirect */
export function loginURL(redirect: string, prompt?: 'create') {
    return withQuery('/api/nuxt/auth/leporidae', { redirect, prompt })
}

/** 登出：服务端先吊销 refresh token 再清除 session，随后同步客户端状态 */
export async function logout() {
    await $fetch('/api/nuxt/auth/logout', { method: 'POST' })
    await useUserSession().clear()
    useNotificationsStore().addNotification({ type: 'info', message: '已退出登录。' })
}
