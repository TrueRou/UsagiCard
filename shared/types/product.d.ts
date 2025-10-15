/**
 * 商品状态枚举
 */
export enum ProductStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    OUT_OF_STOCK = 'OUT_OF_STOCK',
}

/**
 * 商品元数据
 */
export interface ProductMetadata {
    // 根据实际业务需求定义具体字段
    [key: string]: any
}

/**
 * 商品咨询请求
 */
export interface ProductConsultRequest {
    /** 商品元数据 */
    metadata: ProductMetadata
}

/**
 * 商品咨询响应
 */
export interface ProductConsultResponse {
    /** 商品名称 */
    name: string
    /** 商品描述 */
    description: string
    /** 商品价格 */
    price: number
}

/**
 * 商品创建请求
 */
export interface ProductCreateRequest {
    /** 商品元数据 */
    metadata: ProductMetadata
}

/**
 * 商品创建响应
 */
export interface ProductCreateResponse {
    /** 商品 ID */
    id: number
    /** 商品名称 */
    name: string
    /** 商品描述 */
    description: string
    /** 商品价格 */
    price: number
    /** 商品状态 */
    status: ProductStatus
    /** 商品元数据 */
    metadata: ProductMetadata
}

/**
 * 商品更新请求
 */
export interface ProductUpdateRequest {
    /** 商品名称 */
    name: string
    /** 商品描述 */
    description: string
    /** 商品元数据 */
    metadata: ProductMetadata
}
