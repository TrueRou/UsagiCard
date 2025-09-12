import { joinURL } from 'ufo'
import type { TokenResponse } from '~/def/api'

export default defineEventHandler(async (event) => {
    const session = await getUserSession(event)
    const proxyUrl = useRuntimeConfig().leporidApi
    const headers: Record<string, string> = {}

    // forward auth header for internal requests
    if (event.headers.get('Authorization') !== undefined) {
        headers['Authorization'] = event.headers.get('Authorization') as string
    }

    // override auth header if we have a session
    if (session.secure) {
        if (session.secure.expiresAt < Date.now()) {
            try {
                // token expired, try to refresh
                const resp = await $fetch<TokenResponse>('/api/auth/token', {
                    method: 'POST', query: {
                        "grant_type": "refresh_token",
                        "refresh_token": session.secure.refreshToken,
                    }
                })
                headers['Authorization'] = `Bearer ${resp.access_token}`
                await setUserSession(event, {
                    user: session.user,
                    secure: {
                        accessToken: resp.access_token,
                        refreshToken: resp.refresh_token,
                        expiresAt: Date.now() + (resp.expires_in * 1000),
                    }
                })
            } catch (error) {
                // refresh failed, clear session and return 401
                await clearUserSession(event)
                throw createError({ statusCode: 401, statusMessage: 'Session expired' })
            }
        } else {
            // valid session, just set the header
            headers['Authorization'] = `Bearer ${session.secure.accessToken}`
        }
    }

    const path = event.path.replace(/^\/api\//, '')
    const target = joinURL(proxyUrl, path)
    const method = event.method

    // readBody inside a GET request returns 405 so we have to check request method
    const body = method !== 'GET' ? await readBody(event) : null

    try {
        return await $fetch(target, {
            method: method,
            body: body,
            headers: headers,
        })
    } catch (error) {
        throw createError(error as Error)
    }
})