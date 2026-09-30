import { joinURL } from 'ufo'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const baseURL = config.leporidae.baseURL

    const path = event.path.replace(/^\/api\//, '')
    const target = joinURL(baseURL, path)

    const reqAuthorization = getHeader(event, 'authorization')
    const headers: Record<string, string> = {
        'x-developer-token': config.leporidae.developerToken,
    }
    if (reqAuthorization)
        headers.Authorization = reqAuthorization

    return await proxyRequest(event, target, { headers })
})
