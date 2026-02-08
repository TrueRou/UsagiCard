<script setup lang="ts">
const props = defineProps<{
    currentDesign: UsagiCardDxDesign
}>()

const ratingLevels: any = [
    1000,
    2000,
    4000,
    7000,
    10000,
    12000,
    13000,
    14000,
    14500,
    15000,
]

const canvasRef = ref<HTMLCanvasElement | null>(null)

const getNum = (id: string) => new URL(`../../assets/icons/rating/num/UI_CMN_Num_26p_${id}.png`, import.meta.url).href
const getBase = (id: string) => new URL(`../../assets/icons/rating/UI_CMA_Rating_Base_${id}.png`, import.meta.url).href

function countOccurrences(str: string, searchTerm: string) {
    let count = 0
    let index = str.indexOf(searchTerm)
    while (index !== -1) {
        count++
        index = str.indexOf(searchTerm, index + searchTerm.length)
    }
    return count
}

const currentRating = computed(() => {
    return props.currentDesign.dx_rating
})

const numImages = computed(() => {
    const numValue = currentRating.value.replace(/\+/g, '').replace(/-/g, '')
    if (!numValue || Number.isNaN(Number(numValue)))
        return []
    const arr = numValue.split('')
    while (arr.length < 5) arr.unshift('10')
    const finalValue = arr.map(num => getNum(num))
    return finalValue.slice(0, 5)
})

const baseImage = computed(() => {
    const numValue = currentRating.value.replace(/\+/g, '').replace(/-/g, '')
    if (!numValue || Number.isNaN(Number(numValue)))
        return getBase('0')
    let rating = Number.parseInt(numValue)
    rating = Math.max(ratingLevels[0], Math.min(rating, ratingLevels[9]))
    let stage = 0
    while (rating >= ratingLevels[stage + 1]) stage++

    const sideEffect = countOccurrences(currentRating.value || '', '+') - countOccurrences(currentRating.value || '', '-')
    const finalValue = Math.max(Math.min(stage + 1 + sideEffect, 10), 0)

    return getBase(String(finalValue))
})

async function drawCanvas() {
    const scale = 0.8
    const canvas = canvasRef.value
    if (!canvas)
        return

    const ctx = canvas.getContext('2d')
    if (!ctx)
        return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const baseImg = new Image()
    baseImg.fetchPriority = 'high'
    baseImg.src = baseImage.value

    baseImg.onload = () => {
        ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height)

        const numImgPromises = numImages.value.map((src) => {
            const img = new Image()
            img.fetchPriority = 'high'
            img.src = src
            return new Promise<HTMLImageElement>((resolve) => {
                img.onload = () => resolve(img)
                img.onerror = () => resolve(img)
            })
        })

        Promise.all(numImgPromises).then((numImgs) => {
            numImgs.forEach((img, index) => {
                if (img.complete && img.naturalHeight !== 0) {
                    ctx.drawImage(img, 115 + index * 28, 20, 34 * scale, 40 * scale)
                }
            })
        })
    }
}

watch([() => currentRating.value, baseImage, numImages, canvasRef], drawCanvas)
</script>

<template>
    <div class="w-full" :class="{ invisible: currentDesign.dx_rating === undefined || isNaN(parseInt(currentDesign.dx_rating)) }">
        <canvas ref="canvasRef" width="269" height="70" class="w-full" />
    </div>
</template>
