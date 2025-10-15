import { joinURL } from 'ufo'

export default defineEventHandler(async (event) => {
    const proxyUrl = useRuntimeConfig().leporidApi

    const path = event.path.replace(/^\/api\//, '')
    const target = joinURL(proxyUrl, path)

    return proxyRequest(event, target)
})
