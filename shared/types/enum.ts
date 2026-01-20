/**
 * 图片可见性枚举
 */
export enum ImageVisibility {
    DELETED = -1,
    PRIVATE = 0,
    PUBLIC = 1,
}

/**
 * 订单状态枚举
 */
export enum OrderStatus {
    CANCELED = -1,
    UNPAID = 0,
    PAID = 1,
    SHIPPED = 2,
    SUCCESS = 3,
    CLOSED = 4,
}

/**
 * 认证策略枚举
 */
export enum AuthStrategy {
    LOCAL = 0,
    DIVING_FISH = 1,
    LXNS = 2,
}
