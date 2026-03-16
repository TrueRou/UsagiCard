<script setup lang="ts">
const dialogStore = useDialogStore()

const seriesParams = reactive({ page_number: 1, page_size: 20 })
const { data: seriesPage, refresh: refreshSeries } = await useLeporid<any>('/api/admin/marketplace/series', {
    params: seriesParams,
})

const skuParams = reactive({ page_number: 1, page_size: 20 })
const { data: skuPage, refresh: refreshSkus } = await useLeporid<any>('/api/admin/marketplace/skus', {
    params: skuParams,
})

const { data: presetPage } = await useLeporid<any>('/api/admin/platform/presets', {
    params: { page_number: 1, page_size: 100 },
})

const presets = computed(() => presetPage.value?.records ?? [])

const isProcessing = ref(false)

const showSeriesModal = ref(false)
const editingSeriesId = ref<string | null>(null)
const seriesForm = reactive({
    key: '',
    name: '',
    title: '',
    summary: '',
    cover_url: '',
    showcase_video_url: '',
    feedback_urls_text: '',
})

function openSeriesCreate() {
    editingSeriesId.value = null
    Object.assign(seriesForm, {
        key: '',
        name: '',
        title: '',
        summary: '',
        cover_url: '',
        showcase_video_url: '',
        feedback_urls_text: '',
    })
    showSeriesModal.value = true
}

function openSeriesEdit(item: any) {
    editingSeriesId.value = item.id
    Object.assign(seriesForm, {
        key: item.key,
        name: item.name,
        title: item.title,
        summary: item.summary,
        cover_url: item.cover_url || '',
        showcase_video_url: item.showcase_video_url || '',
        feedback_urls_text: (item.feedback_image_urls || []).join('\n'),
    })
    showSeriesModal.value = true
}

async function saveSeries() {
    isProcessing.value = true
    try {
        const feedbackUrls = seriesForm.feedback_urls_text
            .split('\n')
            .map(v => v.trim())
            .filter(Boolean)

        const body = {
            key: seriesForm.key,
            name: seriesForm.name,
            title: seriesForm.title,
            summary: seriesForm.summary,
            cover_url: seriesForm.cover_url,
            showcase_video_url: seriesForm.showcase_video_url || null,
            feedback_image_urls: feedbackUrls,
        }

        if (editingSeriesId.value) {
            await useNuxtApp().$leporid(`/api/admin/marketplace/series/${editingSeriesId.value}`, {
                method: 'PATCH',
                body,
                showSuccessToast: true,
                successMessage: '市场系列已更新',
            })
        }
        else {
            await useNuxtApp().$leporid('/api/admin/marketplace/series', {
                method: 'POST',
                body,
                showSuccessToast: true,
                successMessage: '市场系列已创建',
            })
        }
        showSeriesModal.value = false
        await refreshSeries()
    }
    finally {
        isProcessing.value = false
    }
}

async function deleteSeries(id: string) {
    if (!await dialogStore.confirm('确定删除此市场系列？', { danger: true }))
        return
    isProcessing.value = true
    try {
        await useNuxtApp().$leporid(`/api/admin/marketplace/series/${id}`, {
            method: 'DELETE',
            showSuccessToast: true,
            successMessage: '市场系列已删除',
        })
        await refreshSeries()
    }
    finally {
        isProcessing.value = false
    }
}

const showSkuModal = ref(false)
const editingSkuId = ref<string | null>(null)
const skuForm = reactive({
    slug: '',
    name: '',
    subtitle: '',
    start_price: '',
    description: '',
    material_tags_text: '',
    function_tags_text: '',
    designer_type: 0 as 0 | 1,
    preset_id: '',
    series_id: '',
})

function openSkuCreate() {
    editingSkuId.value = null
    Object.assign(skuForm, {
        slug: '',
        name: '',
        subtitle: '',
        start_price: '',
        description: '',
        material_tags_text: '',
        function_tags_text: '',
        designer_type: 0,
        preset_id: presets.value[0]?.id || '',
        series_id: seriesPage.value?.records?.[0]?.id || '',
    })
    showSkuModal.value = true
}

function openSkuEdit(item: any) {
    editingSkuId.value = item.id
    Object.assign(skuForm, {
        slug: item.slug,
        name: item.name,
        subtitle: item.subtitle,
        start_price: item.start_price,
        description: item.description,
        material_tags_text: (item.material_tags || []).join('\n'),
        function_tags_text: (item.function_tags || []).join('\n'),
        designer_type: item.designer_type,
        preset_id: item.preset_id,
        series_id: item.series_id,
    })
    showSkuModal.value = true
}

async function saveSku() {
    isProcessing.value = true
    try {
        const body = {
            slug: skuForm.slug,
            name: skuForm.name,
            subtitle: skuForm.subtitle,
            start_price: skuForm.start_price,
            description: skuForm.description,
            material_tags: skuForm.material_tags_text.split('\n').map(v => v.trim()).filter(Boolean),
            function_tags: skuForm.function_tags_text.split('\n').map(v => v.trim()).filter(Boolean),
            designer_type: skuForm.designer_type,
            preset_id: skuForm.preset_id,
            series_id: skuForm.series_id,
        }

        if (editingSkuId.value) {
            await useNuxtApp().$leporid(`/api/admin/marketplace/skus/${editingSkuId.value}`, {
                method: 'PATCH',
                body,
                showSuccessToast: true,
                successMessage: '市场SKU已更新',
            })
        }
        else {
            await useNuxtApp().$leporid('/api/admin/marketplace/skus', {
                method: 'POST',
                body,
                showSuccessToast: true,
                successMessage: '市场SKU已创建',
            })
        }
        showSkuModal.value = false
        await refreshSkus()
    }
    finally {
        isProcessing.value = false
    }
}

async function deleteSku(id: string) {
    if (!await dialogStore.confirm('确定删除此市场SKU？', { danger: true }))
        return
    isProcessing.value = true
    try {
        await useNuxtApp().$leporid(`/api/admin/marketplace/skus/${id}`, {
            method: 'DELETE',
            showSuccessToast: true,
            successMessage: '市场SKU已删除',
        })
        await refreshSkus()
    }
    finally {
        isProcessing.value = false
    }
}

function formatDateTime(iso: string) {
    return new Date(iso).toLocaleString()
}

useHead({ title: '市场设置' })

definePageMeta({
    layout: 'admin',
    middleware: ['require-admin'],
})
</script>

<template>
    <div class="space-y-8">
        <section>
            <div class="flex items-center justify-between mb-4">
                <h1 class="text-2xl font-bold">
                    市场系列
                </h1>
                <button class="btn btn-primary btn-sm" @click="openSeriesCreate">
                    新增系列
                </button>
            </div>

            <div class="overflow-x-auto">
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th>Key</th>
                            <th>名称</th>
                            <th>标题</th>
                            <th>封面</th>
                            <th>晒图数量</th>
                            <th>创建时间</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in seriesPage?.records" :key="item.id">
                            <td class="font-mono text-xs">
                                {{ item.key }}
                            </td>
                            <td>{{ item.name }}</td>
                            <td>{{ item.title }}</td>
                            <td class="max-w-40 truncate text-xs">
                                {{ item.cover_url }}
                            </td>
                            <td>{{ item.feedback_image_urls?.length ?? 0 }}</td>
                            <td class="text-xs text-base-content/60">
                                {{ formatDateTime(item.created_at) }}
                            </td>
                            <td>
                                <div class="flex gap-1">
                                    <button class="btn btn-accent btn-xs" @click="openSeriesEdit(item)">
                                        编辑
                                    </button>
                                    <button class="btn btn-error btn-xs btn-outline" :disabled="isProcessing" @click="deleteSeries(item.id)">
                                        删除
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>

        <section>
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-2xl font-bold">
                    市场SKU
                </h2>
                <button class="btn btn-primary btn-sm" @click="openSkuCreate">
                    新增SKU
                </button>
            </div>

            <div class="overflow-x-auto">
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th>Slug</th>
                            <th>名称</th>
                            <th>副标题</th>
                            <th>起步价</th>
                            <th>系列ID</th>
                            <th>预设ID</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in skuPage?.records" :key="item.id">
                            <td class="font-mono text-xs">
                                {{ item.slug }}
                            </td>
                            <td>{{ item.name }}</td>
                            <td class="max-w-40 truncate">
                                {{ item.subtitle }}
                            </td>
                            <td>{{ item.start_price }}</td>
                            <td class="font-mono text-xs">
                                {{ item.series_id?.slice(-8) }}
                            </td>
                            <td class="font-mono text-xs">
                                {{ item.preset_id?.slice(-8) }}
                            </td>
                            <td>
                                <div class="flex gap-1">
                                    <button class="btn btn-accent btn-xs" @click="openSkuEdit(item)">
                                        编辑
                                    </button>
                                    <button class="btn btn-error btn-xs btn-outline" :disabled="isProcessing" @click="deleteSku(item.id)">
                                        删除
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>

        <dialog class="modal" :class="{ 'modal-open': showSeriesModal }">
            <div class="modal-box max-w-xl">
                <h3 class="text-lg font-bold mb-4">
                    {{ editingSeriesId ? '编辑系列' : '新增系列' }}
                </h3>
                <div class="space-y-2">
                    <input v-model="seriesForm.key" class="input input-bordered input-sm w-full" placeholder="key">
                    <input v-model="seriesForm.name" class="input input-bordered input-sm w-full" placeholder="名称">
                    <input v-model="seriesForm.title" class="input input-bordered input-sm w-full" placeholder="标题">
                    <input v-model="seriesForm.summary" class="input input-bordered input-sm w-full" placeholder="简介">
                    <input v-model="seriesForm.cover_url" class="input input-bordered input-sm w-full" placeholder="封面图片URL">
                    <input v-model="seriesForm.showcase_video_url" class="input input-bordered input-sm w-full" placeholder="展示视频URL(可选)">
                    <textarea v-model="seriesForm.feedback_urls_text" class="textarea textarea-bordered w-full h-28" placeholder="晒图URL（每行一个）" />
                </div>
                <div class="modal-action">
                    <button class="btn btn-outline btn-sm" @click="showSeriesModal = false">
                        取消
                    </button>
                    <button class="btn btn-primary btn-sm" :disabled="isProcessing" @click="saveSeries">
                        保存
                    </button>
                </div>
            </div>
        </dialog>

        <dialog class="modal" :class="{ 'modal-open': showSkuModal }">
            <div class="modal-box max-w-xl">
                <h3 class="text-lg font-bold mb-4">
                    {{ editingSkuId ? '编辑SKU' : '新增SKU' }}
                </h3>
                <div class="space-y-2">
                    <input v-model="skuForm.slug" class="input input-bordered input-sm w-full" placeholder="slug">
                    <input v-model="skuForm.name" class="input input-bordered input-sm w-full" placeholder="名称">
                    <input v-model="skuForm.subtitle" class="input input-bordered input-sm w-full" placeholder="副标题">
                    <input v-model="skuForm.start_price" class="input input-bordered input-sm w-full" placeholder="起步价文本，如 ￥199 起">
                    <input v-model="skuForm.description" class="input input-bordered input-sm w-full" placeholder="描述">
                    <textarea v-model="skuForm.material_tags_text" class="textarea textarea-bordered w-full h-20" placeholder="材料标签（每行一个）" />
                    <textarea v-model="skuForm.function_tags_text" class="textarea textarea-bordered w-full h-20" placeholder="功能标签（每行一个）" />
                    <select v-model="skuForm.designer_type" class="select select-bordered select-sm w-full">
                        <option :value="0">
                            UsagiCardDX
                        </option>
                        <option :value="1">
                            UsagiCardWars
                        </option>
                    </select>
                    <select v-model="skuForm.series_id" class="select select-bordered select-sm w-full">
                        <option v-for="item in seriesPage?.records || []" :key="item.id" :value="item.id">
                            {{ item.name }} ({{ item.key }})
                        </option>
                    </select>
                    <select v-model="skuForm.preset_id" class="select select-bordered select-sm w-full">
                        <option v-for="item in presets" :key="item.id" :value="item.id">
                            {{ item.product_name }}
                        </option>
                    </select>
                </div>
                <div class="modal-action">
                    <button class="btn btn-outline btn-sm" @click="showSkuModal = false">
                        取消
                    </button>
                    <button class="btn btn-primary btn-sm" :disabled="isProcessing" @click="saveSku">
                        保存
                    </button>
                </div>
            </div>
        </dialog>
    </div>
</template>
