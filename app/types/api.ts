/**
 * leporidae 后端显式类型声明（替代 hey-api 生成的 leporidae.gen.ts）
 *
 * Storage 与后端 core/validation/schemas/storage 保持一致。
 */

// ===== 枚举（IntEnum → StrEnum，值为大写字符串）=====

export type ArtifactStatus = 'FAILED' | 'PENDING' | 'IN_PRODUCTION' | 'COMPLETED'
export type ImageVisibility = 'DELETED' | 'PRIVATE' | 'PUBLIC'
export enum ProductTypeFunction {
    USAGI_CARD = 'USAGI_CARD',
    MAIMAI_CN = 'MAIMAI_CN',
    MAIMAI_AQUA = 'MAIMAI_AQUA',
}
export enum ProductTypeDesign {
    USAGI_CARD_DX = 'USAGI_CARD_DX',
    USAGI_CARD_WARS = 'USAGI_CARD_WARS',
}

// ===== 分页 =====

export interface Page<T> {
    records: T[]
    total_row: number
    total_page: number
    page_number: number
    page_size: number
}

// ===== 统一响应包装 =====

export interface AppResponse<T> {
    data: T | null
    code: number
    message: string
    timestamp: string
}

// ===== 商品类型（artifact 详情内嵌）=====

export interface ProductTypeResponse {
    id: string
    name: string
    description: string
    design_type: ProductTypeDesign
    function_types: ProductTypeFunction[]
    tags: string[]
}

// ===== 工件 =====

export interface ArtifactUserResponse {
    id: string
    status: ArtifactStatus
    storage: ArtifactStorage
    order_id: string | null
    design_vid: string
    design: Record<string, unknown>
    type: ProductTypeResponse
    created_at: string
    updated_at: string
}

export interface ArtifactStorageUpdateRequest {
    storage: ArtifactStorage
}

// ===== 图片（公开读）=====

export interface ImageResponse {
    id: string
    name: string
    visibility: ImageVisibility
    labels: string[]
    original_id: string | null
    original_name: string | null
    user_id: string
    aspect_id: string
}

export interface ImageSummaryResponse {
    id: string
    name: string
    labels: string[]
    user_id: string
}

export interface ImageAspectResponse {
    id: string
    name: string
    description: string
    ratio_width_unit: number
    ratio_height_unit: number
}

export interface ImageSearchResponse {
    images: Page<ImageSummaryResponse>
    labels: string[]
}

// ===== 设计数据 =====

export interface UsagiCardDxDesign {
    game_version?: string
    simplified_code?: string
    character_name?: string
    friend_code?: string
    display_name?: string
    dx_rating?: string
    card_number?: string
    card_number_label?: string
    override_qrcode?: string
    player_info_color?: string
    chara_info_color?: string
    enable_qrcode_front?: boolean
    enable_qrcode_back?: boolean
    enable_chara_info?: boolean
    enable_landscape?: boolean
    enable_mask?: boolean
    character_id?: string
    mask_id?: string
    background_id?: string
    cardback_id?: string
    frame_id?: string
    passname_id?: string
}

export interface UsagiCardWarsDesign {
    character_name?: string
    skill_name?: string
    skill_description?: string
    miss?: number
    combo?: number
    chain?: number
    character_id?: string
    background_id?: string
    cardback_id?: string
    frame_id?: string
    label_id?: string
}

// ===== 工件存储（按功能命名空间）=====

export interface MaimaiStorage {
    bio: {
        player_name: string | null
        player_rating: number | null
        friend_code: string | null
    }
    update: {
        enabled_mode: 'off' | 'on'
        last_updated_at: string | null
        strategy: {
            sources: Array<{
                server: 'diving_fish' | 'lxns' | 'arcade_legacy' | 'arcade' | 'usagi_card'
                credential: string | null
                transient: boolean
            }>
            targets: Array<{
                server: 'diving_fish' | 'lxns' | 'arcade_legacy' | 'arcade' | 'usagi_card'
                credential: string | null
                transient: boolean
            }>
        }
    }
    /** 旧卡片在下次写入存储前没有该字段 */
    view?: MaimaiViewStorage
}

export type MaimaiViewMode = 'list' | 'tile'
export type MaimaiTileContent = 'rating' | 'achievement' | 'fc' | 'fs' | 'dx_rating' | 'level' | 'play_count' | 'none'

export interface MaimaiViewStorage {
    mode: MaimaiViewMode
    tile_content: MaimaiTileContent
}

export interface MaimaiAquaStorage {
    access_code: string | null
}

export interface UsagiCardStorage {
    bio: {
        card_title: string | null
        card_avatar: string | null
        card_profile: string | null
    }
    menu: {
        menu_tabs: string[]
        swipe: {
            enabled_mode: 'off' | 'on'
        }
    }
    derived: {
        enabled_mode: 'off' | 'redirect'
        derived_from: string | null
    }
}

export interface ArtifactStorage {
    UsagiCard?: UsagiCardStorage
    MaimaiCN?: MaimaiStorage
    MaimaiAqua?: MaimaiAquaStorage
}

// ===== 前端本地枚举（与后端无关）=====

export enum ArtifactDisplayMode {
    SKETCHPAD_FRONT = 0,
    SKETCHPAD_BACK = 1,
    ADAPTIVE_VIEW = 2,
}
