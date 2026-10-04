/** 复制文本并给出提示 */
export function useClipboardToast() {
    const notifications = useNotificationsStore()

    async function copy(text: string | number, label = '内容') {
        try {
            await navigator.clipboard.writeText(String(text))
            notifications.addNotification({ type: 'success', message: `已复制${label}到剪贴板` })
        }
        catch {
            notifications.addNotification({ type: 'error', message: '复制失败，请手动复制' })
        }
    }

    return { copy }
}
