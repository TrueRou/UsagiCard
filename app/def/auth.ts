declare module '#auth-utils' {
    interface User {
        id: number
        username: string
        phone?: string
        privileges: string[]
    }

    interface UserSession {
        // Add your own fields
    }

    interface SecureSessionData {
        accessToken: string
        refreshToken: string
        expiresAt: number
    }
}

export { };