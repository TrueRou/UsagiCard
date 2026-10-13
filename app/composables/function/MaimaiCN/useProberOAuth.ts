import type { MaimaiUpdateServer } from './useMaimaiUpdatePlan'
import { joinURL } from 'ufo'
import { MAIMAI_UPDATE_SERVER_TO_CHAIN_LABEL } from './useMaimaiUpdatePlan'

/** 发起授权前写入的本地记录，回调时据此核对 state（防止他人伪造的回调链接被当前浏览器接受） */
export interface ProberOAuthPending {
    server: MaimaiUpdateServer
    artifactId: string
    zone: 'sources' | 'targets'
    returnTo: string
    createdAt: number
}

interface ProberOAuthAuthorizeResponse {
    authorize_url: string
    state: string
    expires_in: number
}

export interface ProberOAuthCallbackResponse {
    credential: string
    provider: string
    auth_type: 'OAUTH'
    username: string
    display_name: string
    context: Record<string, string>
}

const PENDING_PREFIX = 'usagicard:prober-oauth:'
const PENDING_TTL_MS = 10 * 60 * 1000

export function getProberOAuthRedirectUri(chainLabel: string) {
    return joinURL(useRuntimeConfig().public.URL, '/oauth/callback', chainLabel)
}

/** 向后端申请授权页地址并跳转（离开当前页面） */
export async function startProberOAuth(server: MaimaiUpdateServer, options: Omit<ProberOAuthPending, 'server' | 'createdAt'>) {
    const chainLabel = MAIMAI_UPDATE_SERVER_TO_CHAIN_LABEL[server]
    const authorization = await useNuxtApp().$leporidae<ProberOAuthAuthorizeResponse>(`/api/maimai/oauth/${chainLabel}/authorize`, {
        method: 'POST',
        body: {
            redirect_uri: getProberOAuthRedirectUri(chainLabel),
            context: { app: 'usagicard', artifact_id: options.artifactId, zone: options.zone },
        },
    })
    const pending: ProberOAuthPending = { ...options, server, createdAt: Date.now() }
    // 使用 localStorage：部分移动端浏览器会在新标签页中完成授权跳转
    localStorage.setItem(PENDING_PREFIX + authorization.state, JSON.stringify(pending))
    window.location.assign(authorization.authorize_url)
}

/** 取出并删除 state 对应的本地记录；不存在或已过期时返回 null */
export function consumeProberOAuthPending(state: string): ProberOAuthPending | null {
    const key = PENDING_PREFIX + state
    const raw = localStorage.getItem(key)
    localStorage.removeItem(key)
    // 顺带清理过期记录
    for (let i = localStorage.length - 1; i >= 0; i--) {
        const other = localStorage.key(i)
        if (!other?.startsWith(PENDING_PREFIX))
            continue
        try {
            if (Date.now() - (JSON.parse(localStorage.getItem(other) || '{}').createdAt ?? 0) > PENDING_TTL_MS)
                localStorage.removeItem(other)
        }
        catch {
            localStorage.removeItem(other)
        }
    }
    if (!raw)
        return null
    try {
        const pending = JSON.parse(raw) as ProberOAuthPending
        return Date.now() - pending.createdAt > PENDING_TTL_MS ? null : pending
    }
    catch {
        return null
    }
}
