import { joinURL } from 'ufo'

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
            // refresh token
            // await clearUserSession(event)
        }
        headers['Authorization'] = `Bearer ${session.secure.accessToken}`
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