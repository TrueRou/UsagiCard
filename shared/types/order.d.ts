/**
 * 支付方式枚举
 */
export enum PaymentMethod {
    AFDIAN = 'AFDIAN',
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
    CLOSED = 'CLOSED',
}

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

/**
 * 订单商品响应
 */
export interface OrderProductResponse {
    /** 商品 ID */
    id: number
    /** 商品名称 */
    name: string
    /** 商品描述 */
    description: string
}

/**
 * 订单项目响应
 */
export interface OrderItemResponse {
    /** 订单项目 ID */
    id: number
    /** 订单 ID */
    order_id: number
    /** 商品 ID */
    product_id: number
    /** 数量 */
    quantity: number
    /** 单价 */
    unit_price: number
    /** 总价 */
    total_price: number
    /** 商品信息 */
    product: OrderProductResponse
}

/**
 * 订单响应
 */
export interface OrderResponse {
    /** 订单 ID */
    id: number
    /** 订单序列号 */
    sn: number
    /** 用户 ID */
    user_id: number
    /** 订单状态 */
    status: number
    /** 商品金额 */
    product_money: number
    /** 运费 */
    shipping_money: number
    /** 支付金额 */
    payment_money: number
    /** 支付方式 */
    payment_method: PaymentMethod
    /** 收货人姓名 */
    shipping_name: string
    /** 收货人电话 */
    shipping_phone: string
    /** 收货人地址 */
    shipping_address: string
    /** 物流单号 */
    shipping_sn?: string
    /** 支付时间 */
    paid_at?: number
    /** 发货时间 */
    shipped_at?: number
    /** 关闭时间 */
    closed_at?: number
    /** 创建时间 */
    created_at: number
    /** 更新时间 */
    updated_at: number
    /** 订单项目 */
    items: OrderItemResponse[]
}

/**
 * 分页订单响应
 */
export interface OrderPageResponse {
    /** 订单列表 */
    records: OrderResponse[]
    /** 总数 */
    totalRow: number
    /** 当前页码 */
    page: number
    /** 每页大小 */
    pageSize: number
    /** 总页数 */
    totalPage: number
}
