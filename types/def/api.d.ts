export interface ApiResponse<T = any> {
    code: number
    message: string
    data: T
}

export interface UserResponse {
    id: number
    username: string
    phone: string
    privileges: string[]
}

export interface TokenResponse {
    access_token: string
    refresh_token: string
    token_type: string
    expires_in: number
}

export interface RegisterRequest {
    username: string
    password: string
    phone: string
}

export interface LoginRequest {
    username: string
    password: string
}