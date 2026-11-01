/** 对象可逐字段更新；数组始终整体替换，null 保留为显式置空。 */
export type StoragePatch<T> = T extends readonly unknown[] ? T
    : T extends object ? { [K in keyof T]?: StoragePatch<T[K]> } : T

function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function sameValue(left: unknown, right: unknown): boolean {
    if (Object.is(left, right))
        return true
    if (Array.isArray(left) && Array.isArray(right))
        return left.length === right.length && left.every((value, index) => sameValue(value, right[index]))
    if (isRecord(left) && isRecord(right)) {
        const keys = Object.keys(left)
        return keys.length === Object.keys(right).length && keys.every(key => Object.hasOwn(right, key) && sameValue(left[key], right[key]))
    }
    return false
}

function difference(current: unknown, next: unknown): unknown {
    if (next === undefined || sameValue(current, next))
        return undefined
    if (!isRecord(next))
        return next
    const previous = isRecord(current) ? current : {}
    const result: Record<string, unknown> = {}
    for (const key of Object.keys(next)) {
        const changed = difference(previous[key], next[key])
        if (changed !== undefined)
            result[key] = changed
    }
    // 新对象的 {} 可用于初始化默认值；已有对象的 {} 是无操作，不代表删除。
    return Object.keys(result).length || !isRecord(current) ? result : undefined
}

/** 只比较调用方提交的键，省略键不视为删除，兼容现有完整对象调用。 */
export function diffStorage<T>(current: T | undefined, next: StoragePatch<T>): StoragePatch<T> {
    return (difference(current, next) ?? {}) as StoragePatch<T>
}

/** 仅回滚此次提交的字段；请求期间产生的新编辑不会被失败响应覆盖。 */
export function rollbackStoragePatch(target: unknown, current: unknown, submitted: unknown): void {
    if (!isRecord(target) || !isRecord(submitted))
        return
    const previous = isRecord(current) ? current : {}
    for (const key of Object.keys(submitted)) {
        if (isRecord(previous[key]) && isRecord(target[key]) && isRecord(submitted[key])) {
            rollbackStoragePatch(target[key], previous[key], submitted[key])
        }
        else if (sameValue(target[key], submitted[key])) {
            if (Object.hasOwn(previous, key))
                target[key] = previous[key]
            else
                Reflect.deleteProperty(target, key)
        }
        else if (isRecord(target[key]) && isRecord(submitted[key])) {
            rollbackStoragePatch(target[key], previous[key], submitted[key])
        }
    }
}
