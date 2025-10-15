/**
 * 用户权限枚举
 */
export enum UserPrivilege {
    NORMAL = 'NORMAL',
    ADMIN = 'ADMIN'
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

/**
 * 用户登录请求
 */
export interface UserTokenCreateRequest {
    /** 用户名 */
    username: string
    /** 密码 */
    password: string
    /** 刷新令牌 */
    refresh_token?: string
}

/**
 * 令牌响应
 */
export interface UserTokenCreateResponse {
    /** 访问令牌 */
    access_token: string
    /** 刷新令牌 */
    refresh_token: string
    /** 令牌类型 */
    token_type: string
    /** 过期时间（秒） */
    expires_in: number
}

/**
 * 用户响应
 */
export interface UserResponse {
    /** 用户 ID */
    id: number
    /** 用户名 */
    username: string
    /** 手机号 */
    phone: string
    /** 用户权限 */
    privileges: UserPrivilege[]
}

