import { PaymentMethod, OrderStatus } from './common'

/**
 * 订单项目请求
 */
export interface OrderItemRequest {
    /** 商品 ID */
    product_id: number
    /** 数量 */
    quantity: number
}

/**
 * 订单创建请求
 */
export interface OrderCreateRequest {
    /** 收货人姓名 */
    shipping_name: string
    /** 收货人电话 */
    shipping_phone: string
    /** 收货人地址 */
    shipping_address: string
    /** 支付方式 */
    payment_method: PaymentMethod
    /** 订单项目 */
    items: OrderItemRequest[]
}

/**
 * 订单搜索请求
 */
export interface OrderSearchRequest {
    /** 关键字 */
    keyword?: string
    /** 订单状态 */
    status?: OrderStatus
    /** 页码 */
    page_number: number
    /** 每页大小 */
    page_size: number
}