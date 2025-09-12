/**
 * 通用响应体
 */
export interface CommonResponse<T = any> {
    /** 响应码 */
    code: number
    /** 响应消息 */
    message: string
    /** 响应数据 */
    data: T | null
}

/**
 * 支付方式枚举
 */
export enum PaymentMethod {
    WECHAT_PAY = 'WECHAT_PAY',
    ALIPAY = 'ALIPAY',
    CREDIT_CARD = 'CREDIT_CARD'
}

/**
 * 订单状态枚举
 */
export enum OrderStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED'
}

/**
 * 商品状态枚举
 */
export enum ProductStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    OUT_OF_STOCK = 'OUT_OF_STOCK'
}