export type MarketplaceSeriesKey = 'usagicard'

export interface MarketplaceSku {
    slug: string
    series: MarketplaceSeriesKey
    name: string
    subtitle: string
    description: string
    difference: string
    materialTags: string[]
    functionTags: string[]
    designerType: ProductTypeDesign
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
    {
        slug: 'usagicard-maimai',
        series: 'usagicard',
        name: '双面定制 NFC 卡 舞萌款',
        subtitle: '完整 UsagiCard 体验款，包含兔卡账号系统和舞萌账号系统。',
        description: '双面都可自定义，包含基础款的全部功能，并额外支持舞萌账号系统，适合机台更新查分器等功能。',
        difference: '',
        materialTags: ['双面定制', 'NFC 卡'],
        functionTags: ['兔卡账号', '舞萌账号'],
        designerType: 0,
    },
    {
        slug: 'usagicard-basic',
        series: 'usagicard',
        name: '双面定制 NFC 卡 基础款',
        subtitle: '基础 UsagiCard 体验款，包含兔卡账号系统。',
        description: '双面都可自定义，支持卡片主页，可以后续升级账号系统，适合主要用作装饰。',
        difference: '',
        materialTags: ['双面定制', 'NFC 卡'],
        functionTags: ['兔卡账号'],
        designerType: 0,
    },
    {
        slug: 'usagicard-aime',
        series: 'usagicard',
        name: '双面定制 AIME 蓝白卡',
        subtitle: '官方蓝白卡底材',
        description: '官方蓝白卡方案，手感与稳定性优秀，可通过二维码进入卡片主页。',
        difference: '',
        materialTags: ['双面定制', 'AIME 卡'],
        functionTags: ['兔卡账号'],
        designerType: 0,
    },
    {
        slug: 'usagicard-sticker',
        series: 'usagicard',
        name: '双面定制 水晶卡贴',
        subtitle: '轻便贴贴款',
        description: '背面自带背胶，可直接贴附使用，不支持卡片主页与账号系统。',
        difference: '',
        materialTags: ['双面定制'],
        functionTags: [],
        designerType: 0,
    },
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
