export async function useCharacterMetadata(currentDesign: Ref<UsagiCardDxDesign>) {
    const notificationsStore = useNotificationsStore()
    const { $leporid } = useNuxtApp()

    async function matchCharacterMetadata() {
        const response: {
            mask_image?: ImageSimplePublic
            source: string
            character_name?: string
            version?: string
        } = await $leporid('/api/nuxt/image/metadata', {
            method: 'GET',
            query: {
                id: currentDesign.value.character_id,
            },
        })

        let message = '未能匹配到任何数据。'

        if (response.source) {
            message = `数据来源： ${response.source} \n`

            if (response.mask_image) {
                currentDesign.value.mask_id = response.mask_image.id
                message += `遮罩图层： ${response.mask_image.name} \n`
            }

            if (response.character_name) {
                currentDesign.value.character_name = response.character_name
                message += `立绘名称： ${response.character_name} \n`
            }

            if (response.version) {
                currentDesign.value.game_version = response.version
                message += `游戏版本： ${response.version} \n`
            }
        }

        notificationsStore.addNotification({ type: response.source ? 'success' : 'warning', message, duration: 5000 })
    }

    function showMatchCharacterMetadataHelp() {
        const notificationsStore = useNotificationsStore()
        notificationsStore.addNotification({
            type: 'info',
            message: '根据当前选择的角色立绘，自动匹配游戏版本、立绘名称、遮罩图层。',
            duration: 10000,
        })
    }

    return {
        matchCharacterMetadata,
        showMatchCharacterMetadataHelp,
    }
}
