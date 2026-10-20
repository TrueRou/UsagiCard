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

    const refreshToken = session.secure?.refreshToken
    const fetch = !reqAuthorization && refreshToken
        ? createOAuthProxyFetch({
                refresh: () => refreshTokens(refreshToken),
                save: async (tokens) => {
                    await setUserSession(event, {
                        ...session,
                        secure: {
                            accessToken: tokens.access_token,
                            refreshToken: tokens.refresh_token,
                        },
                    })
                },
                clear: async () => {
                    console.warn(`[auth] refresh token invalid for user=${userId}, clearing session.`)
                    await clearUserSession(event)
                },
            })
        : undefined

    return proxyRequest(event, target, { headers: buildHeaders(session.secure?.accessToken), fetch })
})
