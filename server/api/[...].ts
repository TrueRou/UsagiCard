import { joinURL } from 'ufo'

export default defineEventHandler(async (event) => {
    const session = await getUserSession(event)
    const config = useRuntimeConfig()
    const baseURL = config.leporidae.baseURL

    const path = event.path.replace(/^\/api\//, '')
    const target = joinURL(baseURL, path)

    const reqAuthorization = getHeader(event, 'authorization')
    const userId = session?.user?.username ?? 'anonymous'

    // 调用方显式携带的 Authorization 优先；否则使用登录 session 中的 access token
    const buildHeaders = (accessToken?: string): Record<string, string> => {
        const headers: Record<string, string> = {
            'x-developer-token': config.leporidae.developerToken,
        }
        if (reqAuthorization)
            headers.Authorization = reqAuthorization
        else if (accessToken)
            headers.Authorization = `Bearer ${accessToken}`
        return headers
    }

    let val = await proxyRequest(event, target, { headers: buildHeaders(session.secure?.accessToken) })

    // access token 过期：以 refresh token 轮换后重试一次
    if (event.node.res.statusCode === 401 && !reqAuthorization && session.secure?.refreshToken) {
        try {
            const tokens = await refreshTokens(session.secure.refreshToken)
            await setUserSession(event, {
                ...session,
                secure: {
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token,
                },
            })
            val = await proxyRequest(event, target, { headers: buildHeaders(tokens.access_token) })
        }
        catch {
            console.warn(`[auth] ${new Date().toISOString()} refresh failed for user=${userId}, clearing session.`)
            await clearUserSession(event)
            return val
        }
    }

    if (event.node.res.statusCode === 401 && !reqAuthorization && session.secure?.accessToken)
        await clearUserSession(event)

    return val
})
