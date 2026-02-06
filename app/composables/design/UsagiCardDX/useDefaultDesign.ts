export function useDefaultDesign(overrideDesign: Ref<Partial<UsagiCardDxDesign>> = ref({})) {
    const defaultDesign: UsagiCardDxDesign = {
        game_version: 'Ver.CN1.53-J',
        simplified_code: 'UsagiCard',
        character_name: '百合咲ミカ',
        friend_code: '',
        display_name: '',
        dx_rating: '',
        card_number: '',
        card_number_label: '',
        override_qrcode: '',
        player_info_color: '#ffffff',
        chara_info_color: '#fee37c',
        enable_qrcode_front: false,
        enable_qrcode_back: false,
        enable_chara_info: true,
        enable_landscape: false,
        enable_mask: false,
        character_id: '9bc837c2-0f9a-4d98-9874-15c0f00bce52',
        mask_id: '0cc5d8e5-8bb8-4c48-bfca-6f334319b530',
        background_id: '0324f864-8b48-48cf-a63b-a77cf3529150',
        cardback_id: 'fa52e0c6-656a-4812-818b-fb19455b1043',
        frame_id: '5b863e4d-b730-4150-804c-23e86c3dca1a',
        passname_id: '',
    }

    return {
        currentDesign: computed(() => {
            return { ...defaultDesign, ...overrideDesign.value }
        }),
    }
}
