export type MarketplaceSeriesKey = 'usagicard'

export interface MarketplaceSku {
    slug: string
    series: MarketplaceSeriesKey
    name: string
    subtitle: string
    description: string
    difference: string
    priceHint: string
    tags: string[]
    designerType: ProductTypeDesign
    accountSupport: boolean
    cardPageSupport: boolean
}

export interface MarketplaceSeries {
    key: MarketplaceSeriesKey
    name: string
    title: string
    summary: string
    cover: string
    skus: MarketplaceSku[]
}

const usagiCardSkus: MarketplaceSku[] = [
    // {
    //     slug: 'usagicard-pro',
    //     series: 'usagicard',
    //     name: '双面定制 NFC 卡 Pro',
    //     subtitle: '完整 UsagiCard 体验款',
    //     description: '双面都可自定义，支持卡片主页与账号系统，适合追求完整体验的你。',
    //     difference: '完整功能 + 双面设计 + 兼顾颜值与实用',
    //     priceHint: '中高配',
    //     tags: ['主推', '双面定制', 'NFC'],
    //     designerType: 0,
    //     accountSupport: true,
    //     cardPageSupport: true,
    // },
    // {
    //     slug: 'usagicard-aime-bluewhite',
    //     series: 'usagicard',
    //     name: '双面定制 AIME 蓝白卡',
    //     subtitle: '官方蓝白卡底材',
    //     description: '官方蓝白卡方案，手感与稳定性优秀，可通过二维码进入卡片主页。',
    //     difference: '官方底材，成本更高，成品质感更稳',
    //     priceHint: '高配',
    //     tags: ['官方底材', '双面定制', '二维码'],
    //     designerType: 0,
    //     accountSupport: true,
    //     cardPageSupport: true,
    // },
    // {
    //     slug: 'usagicard-aime-compatible',
    //     series: 'usagicard',
    //     name: '双面定制 AIME 兼容卡',
    //     subtitle: '轻量预算友好款',
    //     description: '兼容卡方案，预算友好，可通过二维码进入卡片主页，适合先上手体验。',
    //     difference: '成本更低，功能适中，适合体验党',
    //     priceHint: '中配',
    //     tags: ['兼容卡', '双面定制', '入门友好'],
    //     designerType: 0,
    //     accountSupport: false,
    //     cardPageSupport: true,
    // },
    // {
    //     slug: 'usagicard-nfc-basic',
    //     series: 'usagicard',
    //     name: '双面定制 NFC 卡 Basic',
    //     subtitle: '纯卡片主页体验',
    //     description: '可进入卡片主页，但不包含账号系统联动，适合偏展示用途。',
    //     difference: '保留主页展示，去掉账号系统能力',
    //     priceHint: '中配',
    //     tags: ['NFC', '双面定制', '展示向'],
    //     designerType: 0,
    //     accountSupport: false,
    //     cardPageSupport: true,
    // },
    // {
    //     slug: 'usagicard-crystal-sticker',
    //     series: 'usagicard',
    //     name: '双面定制水晶卡贴',
    //     subtitle: '轻便贴贴款',
    //     description: '背面自带背胶，可直接贴附使用，不支持卡片主页与账号系统。',
    //     difference: '便携轻量，主打装饰与个性表达',
    //     priceHint: '入门',
    //     tags: ['卡贴', '背胶', '轻便'],
    //     designerType: 0,
    //     accountSupport: false,
    //     cardPageSupport: false,
    // },
]

const seriesList: MarketplaceSeries[] = [
    {
        key: 'usagicard',
        name: 'UsagiCard',
        title: 'UsagiCard 系列',
        summary: '兔卡系列，满足你对 NFC 卡片的各种幻想，轻轻一扫享受丰富功能。',
        cover: '/media/placeholders/usagicard-cover.webp',
        skus: usagiCardSkus,
    },
]

export function useMarketplaceSeriesMap() {
    const allSeries = computed(() => seriesList)
    const allSkus = computed(() => seriesList.flatMap(series => series.skus))

    const seriesByKey = computed<Record<MarketplaceSeriesKey, MarketplaceSeries>>(() => {
        return allSeries.value.reduce((acc, item) => {
            acc[item.key] = item
            return acc
        }, {} as Record<MarketplaceSeriesKey, MarketplaceSeries>)
    })

    const skuBySlug = computed<Record<string, MarketplaceSku>>(() => {
        return allSkus.value.reduce((acc, item) => {
            acc[item.slug] = item
            return acc
        }, {} as Record<string, MarketplaceSku>)
    })

    const findSkuBySlug = (slug: string) => skuBySlug.value[slug]

    return {
        allSeries,
        allSkus,
        seriesByKey,
        skuBySlug,
        findSkuBySlug,
    }
}
