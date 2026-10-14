declare module '#auth-utils' {
    interface User {
        id: string
        username: string
        email: string
    }

    interface SecureSessionData {
        accessToken: string
        refreshToken: string
    }
}

export { }
