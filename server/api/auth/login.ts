export default defineEventHandler(async (event) => {
    const { username, password } = await readBody(event);

    const tokenResponse: any = await $fetch('/api/auth/token', {
        method: 'POST', query: {
            "grant_type": "password",
            "username": username,
            "password": password,
        }, event
    });

    const userResponse: any = await $fetch('/api/users/me', {
        method: 'GET', headers: {
            "Authorization": `Bearer ${tokenResponse.access_token}`
        }, event
    });

    await setUserSession(event, {
        user: {
            id: userResponse.data.id,
            username: userResponse.data.username,
            phone: userResponse.data.phone,
            privileges: userResponse.data.privileges,
        },
        secure: {
            accessToken: tokenResponse.access_token,
            refreshToken: tokenResponse.refresh_token,
            expiresAt: Date.now() + (tokenResponse.expires_in * 1000),
        }
    })
})