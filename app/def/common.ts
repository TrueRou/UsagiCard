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
    AFDIAN = 'AFDIAN'
}

/**
 * 订单状态枚举
 */
export enum OrderStatus {
    CANCELED = 'CANCELED',
    UNPAID = 'UNPAID',
    PAID = 'PAID',
    SHIPPED = 'SHIPPED',
    SUCCESS = 'SUCCESS',
    CLOSED = 'CLOSED'
}

/**
 * 商品状态枚举
 */
export enum ProductStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    OUT_OF_STOCK = 'OUT_OF_STOCK'
}