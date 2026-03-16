export type MarketplaceSeriesKey = string

export interface MarketplaceSku {
    slug: string
    series: MarketplaceSeriesKey
    name: string
    subtitle: string
    startPrice: string
    description: string
    materialTags: string[]
    functionTags: string[]
    designerType: ProductTypeDesign
    presetId: string
}

export interface MarketplaceSeries {
    key: MarketplaceSeriesKey
    name: string
    title: string
    summary: string
    cover: string
    showcaseVideo: string
    feedbackImages: string[]
    skus: MarketplaceSku[]
}

interface MarketplaceSkuApi {
    slug: string
    name: string
    subtitle: string
    start_price: string
    description: string
    material_tags: string[]
    function_tags: string[]
    designer_type: ProductTypeDesign
    preset_id: string
}

interface MarketplaceSeriesApi {
    key: string
    name: string
    title: string
    summary: string
    cover_url: string
    showcase_video_url: string | null
    feedback_image_urls: string[]
    skus: MarketplaceSkuApi[]
}

export function useMarketplaceSeriesMap() {
    const { data: rawSeries, pending, refresh } = useLeporid<MarketplaceSeriesApi[]>('/api/platform/marketplace/series', {
        server: true,
    })

    const allSeries = computed<MarketplaceSeries[]>(() => {
        return (rawSeries.value ?? []).map(series => ({
            key: series.key,
            name: series.name,
            title: series.title,
            summary: series.summary,
            cover: series.cover_url,
            showcaseVideo: series.showcase_video_url ?? '',
            feedbackImages: series.feedback_image_urls ?? [],
            skus: (series.skus ?? []).map(sku => ({
                slug: sku.slug,
                series: series.key,
                name: sku.name,
                subtitle: sku.subtitle,
                startPrice: sku.start_price,
                description: sku.description,
                materialTags: sku.material_tags ?? [],
                functionTags: sku.function_tags ?? [],
                designerType: sku.designer_type,
                presetId: sku.preset_id,
            })),
        }))
    })

    const allSkus = computed<MarketplaceSku[]>(() => allSeries.value.flatMap(series => series.skus))

    const seriesByKey = computed<Record<MarketplaceSeriesKey, MarketplaceSeries>>(() => {
        return allSeries.value.reduce<Record<MarketplaceSeriesKey, MarketplaceSeries>>((acc, item) => {
            acc[item.key] = item
            return acc
        }, {})
    })

    const skuBySlug = computed<Record<string, MarketplaceSku>>(() => {
        return allSkus.value.reduce<Record<string, MarketplaceSku>>((acc, item) => {
            acc[item.slug] = item
            return acc
        }, {})
    })

    const findSkuBySlug = (slug: string) => skuBySlug.value[slug]

    return {
        allSeries,
        allSkus,
        seriesByKey,
        skuBySlug,
        findSkuBySlug,
        pending,
        refresh,
    }
}
