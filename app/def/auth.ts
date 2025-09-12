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

/**
 * 用户信息响应
 */
export interface UserResponse {
    /** 用户 ID */
    id: number
    /** 用户名 */
    username: string
    /** 手机号 */
    phone?: string
    /** 用户权限 */
    privileges: string[]
}

/**
 * 用户令牌创建响应
 */
export interface UserTokenCreateResponse {
    /** 访问令牌 */
    access_token: string
    /** 刷新令牌 */
    refresh_token: string
    /** 令牌类型 */
    token_type: string
    /** 令牌过期时间（秒） */
    expires_in: number
}

/**
 * 用户令牌创建请求
 */
export interface UserTokenCreateRequest {
    /** 用户名 */
    username?: string
    /** 密码 */
    password?: string
    /** 刷新令牌 */
    refresh_token?: string
}

/**
 * 用户注册请求
 */
export interface UserRegisterRequest {
    /** 用户名 */
    username: string
    /** 密码 */
    password: string
    /** 手机号 */
    phone?: string
}