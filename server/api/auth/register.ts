import type { RegisterRequest, ApiResponse } from '~/def/api'

export default defineEventHandler(async (event) => {
    const body: RegisterRequest = await readBody(event)

    try {
        const response = await $fetch<ApiResponse>('/api/auth/register', {
            method: 'POST',
            body: body
        })

        return response
    } catch (error) {
        throw createError(error as Error)
    }
})