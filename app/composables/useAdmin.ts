/**
 * 管理端 API 调用封装
 * 基于 useLeporid 模式，提供所有管理端点的类型安全调用
 */

// ============================================================
// 统计
// ============================================================

export function useAdminStats() {
    return useLeporid<AdminStatsResponse>('/api/admin/stats')
}

// ============================================================
// 订单管理
// ============================================================

export function useAdminOrders(params: Ref<Record<string, any>>) {
    return useLeporid<PageOrderPublic>('/api/admin/orders', {
        params,
    })
}

export function useAdminOrder(orderId: string) {
    return useLeporid<OrderPublic>(`/api/admin/orders/${orderId}`)
}

export async function adminUpdateOrder(orderId: string, body: Record<string, any>) {
    return useNuxtApp().$leporid(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        body,
        showSuccessToast: true,
        successMessage: '订单已更新',
    })
}

export async function adminShipOrder(orderId: string, shippingSn: string) {
    return useNuxtApp().$leporid(`/api/admin/orders/${orderId}/ship`, {
        method: 'POST',
        body: { shipping_sn: shippingSn },
        showSuccessToast: true,
        successMessage: '订单已发货',
    })
}

export async function adminCancelOrder(orderId: string) {
    return useNuxtApp().$leporid(`/api/admin/orders/${orderId}/cancel`, {
        method: 'POST',
        showSuccessToast: true,
        successMessage: '订单已取消',
    })
}

// ============================================================
// 用户管理
// ============================================================

export function useAdminUsers(params: Ref<Record<string, any>>) {
    return useLeporid<PageAdminUserPublic>('/api/admin/users', {
        params,
    })
}

export async function adminUpdateUserPermissions(userId: string, permissions: string[]) {
    return useNuxtApp().$leporid(`/api/admin/users/${userId}/permissions`, {
        method: 'PATCH',
        body: { permissions },
        showSuccessToast: true,
        successMessage: '权限已更新',
    })
}

// ============================================================
// 工件管理
// ============================================================

export function useAdminArtifacts(params: Ref<Record<string, any>>) {
    return useLeporid<PageArtifactManufacturerResponse>('/api/artifacts', {
        params,
    })
}

export async function adminUpdateArtifactStatus(artifactId: string, status: number) {
    return useNuxtApp().$leporid(`/api/artifacts/${artifactId}/status`, {
        method: 'PATCH',
        body: { status },
        showSuccessToast: true,
        successMessage: '工件状态已更新',
    })
}

// ============================================================
// 批次管理
// ============================================================

export function useAdminBatches(params: Ref<Record<string, any>>) {
    return useLeporid<PageBatchPublic>('/api/batches', {
        params,
    })
}

export function useAdminBatch(batchId: string) {
    return useLeporid<BatchPublic>(`/api/batches/${batchId}`)
}

export async function adminCreateBatch(artifactIds: string[]) {
    return useNuxtApp().$leporid('/api/batches', {
        method: 'POST',
        body: { artifact_ids: artifactIds },
        showSuccessToast: true,
        successMessage: '批次已创建',
    })
}

export async function adminUpdateBatch(batchId: string, body: Record<string, any>) {
    return useNuxtApp().$leporid(`/api/batches/${batchId}`, {
        method: 'PATCH',
        body,
        showSuccessToast: true,
        successMessage: '批次已更新',
    })
}

export async function adminAdvanceBatch(batchId: string, targetStatus: number) {
    return useNuxtApp().$leporid(`/api/batches/${batchId}/advance`, {
        method: 'POST',
        body: { target_status: targetStatus },
        showSuccessToast: true,
        successMessage: '工件状态已批量推进',
    })
}

// ============================================================
// 平台管理
// ============================================================

export function useAdminPresets(params: Ref<Record<string, any>>) {
    return useLeporid<PageAdminPlatformPresetDetailPublic>('/api/admin/platform/presets', {
        params,
    })
}

export async function adminCreatePreset(body: Record<string, any>) {
    return useNuxtApp().$leporid('/api/admin/platform/presets', {
        method: 'POST',
        body,
        showSuccessToast: true,
        successMessage: '预设已创建',
    })
}

export async function adminUpdatePreset(presetId: string, body: Record<string, any>) {
    return useNuxtApp().$leporid(`/api/admin/platform/presets/${presetId}`, {
        method: 'PATCH',
        body,
        showSuccessToast: true,
        successMessage: '预设已更新',
    })
}

export async function adminDeletePreset(presetId: string) {
    return useNuxtApp().$leporid(`/api/admin/platform/presets/${presetId}`, {
        method: 'DELETE',
        showSuccessToast: true,
        successMessage: '预设已删除',
    })
}

export function useAdminSkus(params: Ref<Record<string, any>>) {
    return useLeporid<PageAdminPlatformSkuPublic>('/api/admin/platform/skus', {
        params,
    })
}

export async function adminCreateSku(body: Record<string, any>) {
    return useNuxtApp().$leporid('/api/admin/platform/skus', {
        method: 'POST',
        body,
        showSuccessToast: true,
        successMessage: 'SKU已创建',
    })
}

export async function adminUpdateSku(skuId: string, body: Record<string, any>) {
    return useNuxtApp().$leporid(`/api/admin/platform/skus/${skuId}`, {
        method: 'PATCH',
        body,
        showSuccessToast: true,
        successMessage: 'SKU已更新',
    })
}

export async function adminDeleteSku(skuId: string) {
    return useNuxtApp().$leporid(`/api/admin/platform/skus/${skuId}`, {
        method: 'DELETE',
        showSuccessToast: true,
        successMessage: 'SKU已删除',
    })
}

// ============================================================
// 兑换码管理
// ============================================================

export function useAdminRedemptions(params: Ref<Record<string, any>>) {
    return useLeporid<PageAdminRedemptionPublic>('/api/admin/platform/redemptions', {
        params,
    })
}

// ============================================================
// Types (临时，等 openapi-ts 重新生成后可删除)
// ============================================================

interface AdminStatsResponse {
    total_users: number
    total_orders: number
    total_revenue: string
    total_artifacts: number
    total_redemptions: number
    unclaimed_redemptions: number
    order_breakdown: {
        canceled: number
        unpaid: number
        paid: number
        shipped: number
        success: number
        closed: number
    }
    artifact_breakdown: {
        failed: number
        pending: number
        in_production: number
        completed: number
        activated: number
        unassigned: number
    }
}

interface AdminUserPublic {
    id: string
    username: string
    email: string
    permissions: string[]
    created_at: string
    updated_at: string
}

interface AdminRedemptionPublic {
    id: string
    code: string
    platform: string
    platform_trade_id: string
    shipping_name: string
    shipping_phone: string
    shipping_address: string
    claimed_at: string | null
    user_id: string | null
    order_id: string | null
    product_id: string | null
    preset: { id: string, product_name: string, product_description: string, created_at: string }
    created_at: string
}

interface AdminPlatformPresetDetailPublic {
    id: string
    product_name: string
    product_description: string
    product_design: Record<string, any>
    product_material_id: string
    product_type_id: string
    created_at: string
    updated_at: string
}

interface AdminPlatformSkuPublic {
    id: string
    platform: string
    plan_id: string
    sku_id: string | null
    quantity: number
    preset_id: string
    preset: { id: string, product_name: string, product_description: string, created_at: string }
    created_at: string
    updated_at: string
}

// 分页泛型（与后端 Page[T] 对应）
type PageOrderPublic = import('../shared/types/leporidae.gen').PageOrderPublic
type OrderPublic = import('../shared/types/leporidae.gen').OrderPublic
interface PageArtifactManufacturerResponse { records: any[], total_row: number, total_page: number, page_number: number, page_size: number }
interface PageBatchPublic { records: any[], total_row: number, total_page: number, page_number: number, page_size: number }
type BatchPublic = any
interface PageAdminUserPublic { records: AdminUserPublic[], total_row: number, total_page: number, page_number: number, page_size: number }
interface PageAdminPlatformPresetDetailPublic { records: AdminPlatformPresetDetailPublic[], total_row: number, total_page: number, page_number: number, page_size: number }
interface PageAdminPlatformSkuPublic { records: AdminPlatformSkuPublic[], total_row: number, total_page: number, page_number: number, page_size: number }
interface PageAdminRedemptionPublic { records: AdminRedemptionPublic[], total_row: number, total_page: number, page_number: number, page_size: number }
