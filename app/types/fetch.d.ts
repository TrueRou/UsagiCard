/**
 * `$leporidae`（基于 ofetch 的 $fetch.create）通过 onResponse 拦截器实现了
 * `showErrorToast` / `showSuccessToast` / `successMessage` 三个自定义请求选项。
 * ofetch 的 FetchOptions 不认识它们，直接以内联字面量传入会触发 excess-property 校验。
 * 这里对 ofetch 的选项类型做模块增强，使调用点（含 plugin/api.ts 内部）获得类型支持。
 */
declare module 'ofetch' {
    interface FetchOptions {
        /** 是否在请求失败时弹出错误 toast（默认：非 GET 或状态码 >= 500 时弹出） */
        showErrorToast?: boolean
        /** 是否在请求成功时弹出成功 toast */
        showSuccessToast?: boolean
        /** 成功 toast 的文案（默认取后端返回的 message） */
        successMessage?: string
    }
}

export {}
