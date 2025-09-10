import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { ref, computed } from 'vue'
import axios from 'axios'

interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

interface User {
  id: number
  username: string
  phone: string
  privileges: string[]
}

export const useAuthStore = defineStore('auth', () => {
  // 持久化 token
  const accessToken = useStorage<string | null>('access_token', null)
  const refreshToken = useStorage<string | null>('refresh_token', null)
  const tokenType = useStorage<string | null>('token_type', null)
  const expiresAt = useStorage<number | null>('expires_at', null) // 过期时间戳
  const user = useStorage<User | null>('user', null)

  const isLoggedIn = computed(() => !!accessToken.value && Date.now() < (expiresAt.value || 0))

  // 登录
  async function login(username: string, password: string) {
    const res = await axios.post<TokenResponse>(
      '/auth/token?grant_type=password&username=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(password)
    )
    setToken(res.data)
    // 可选：获取用户信息
    // await fetchUser()
  }

  // 登出
  function logout() {
    accessToken.value = null
    refreshToken.value = null
    tokenType.value = null
    expiresAt.value = null
    user.value = null
  }

  // 刷新 token
  async function refresh() {
    if (!refreshToken.value) throw new Error('No refresh token')
    const res = await axios.post<TokenResponse>(
      '/auth/token?grant_type=refresh_token&refresh_token=' + encodeURIComponent(refreshToken.value)
    )
    setToken(res.data)
  }

  // 设置 token
  function setToken(data: TokenResponse) {
    accessToken.value = data.access_token
    refreshToken.value = data.refresh_token
    tokenType.value = data.token_type
    expiresAt.value = Date.now() + (data.expires_in * 1000) - 10000 // 提前10秒过期
  }

  // 自动刷新 token
  async function getValidAccessToken() {
    if (!accessToken.value || Date.now() >= (expiresAt.value || 0)) {
      await refresh()
    }
    return accessToken.value
  }

  // 可选：获取用户信息
  // async function fetchUser() {
  //   const res = await axios.get<User>('/user/me', {
  //     headers: { Authorization: `${tokenType.value} ${accessToken.value}` }
  //   })
  //   user.value = res.data
  // }

  return {
    accessToken,
    refreshToken,
    tokenType,
    expiresAt,
    user,
    isLoggedIn,
    login,
    logout,
    refresh,
    getValidAccessToken,
    // fetchUser
  }
})