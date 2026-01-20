export default defineEventHandler(async (event) => {
    const { username, password, strategy }: UserAuthRequest = await readBody(event)

    if (!username || !password) {
        return {
            code: 400,
            message: '用户名或密码不能为空',
            data: null,
        }
    }

    try {
        const tokenResponse = await $fetch<UserAuthResponse>(`/api/auth/token`, {
            method: 'POST',
            body: new URLSearchParams({
                grant_type: 'password',
                strategy: (strategy ?? AuthStrategy.LOCAL).toString(),
                username,
                password,
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })

        const userResponse = await $fetch<AppResponseUserPublic>(`/api/users/me`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${tokenResponse.access_token}`,
            },
        })

        if (!userResponse.data) {
            return {
                code: userResponse.code,
                message: userResponse.message,
                data: null,
            }
        }

        await setUserSession(event, {
            user: {
                id: userResponse.data.id,
                username: userResponse.data.username,
                email: userResponse.data.email,
                permissions: userResponse.data.permissions,
            },
            secure: {
                accessToken: tokenResponse.access_token,
                refreshToken: tokenResponse.refresh_token,
                expiresAt: Date.now() + (tokenResponse.expires_in * 1000),
            },
        })

        return {
            code: 200,
            message: '请求成功',
            data: {},
        }
    }
    catch (error: any) {
        return {
            code: error.statusCode || 500,
            message: error.data.message ?? '未知错误',
            data: null,
        }
    }
})
