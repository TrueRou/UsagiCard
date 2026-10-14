/** leporidae OAuth 令牌响应（POST /oauth/token） */
export interface OAuthTokenResponse {
    access_token: string
    refresh_token: string
    token_type: string
    expires_in: number
}

/** leporidae 当前用户（GET /users/me） */
export interface UserResponse {
    id: string
    username: string
    email: string
}
