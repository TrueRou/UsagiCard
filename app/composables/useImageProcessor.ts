interface ImageProcessOptions {
    rotate?: number // 旋转角度（弧度）
    scale?: number // 缩放比例
    featherSize?: number // 羽化大小（像素）
}

export function useImageProcessor(options: ImageProcessOptions = {}, imageUrl: string) {
    /**
     * 对图片边缘应用羽化效果
     */
    const applyFeather = (ctx: CanvasRenderingContext2D, width: number, height: number, featherSize: number) => {
        const imageData = ctx.getImageData(0, 0, width, height)
        const data: any = imageData.data

        // 找到图片内容的边界（非透明像素）
        let minX = width
        let maxX = 0
        let minY = height
        let maxY = 0

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4
                if (data[idx + 3] > 0) {
                    // 有内容的像素
                    minX = Math.min(minX, x)
                    maxX = Math.max(maxX, x)
                    minY = Math.min(minY, y)
                    maxY = Math.max(maxY, y)
                }
            }
        }

        // 对图片内容边缘进行羽化
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4

                if (data[idx + 3] > 0) {
                    // 只处理有内容的像素
                    // 计算到图片内容边界的距离
                    const distLeft = x - minX
                    const distRight = maxX - x
                    const distTop = y - minY
                    const distBottom = maxY - y

                    // 取最小距离
                    const minDist = Math.min(distLeft, distRight, distTop, distBottom)

                    // 如果在羽化范围内，调整透明度
                    if (minDist < featherSize) {
                        const alpha = minDist / featherSize
                        data[idx + 3] *= alpha
                    }
                }
            }
        }

        ctx.putImageData(imageData, 0, 0)
    }

    /**
     * 处理图片：旋转、缩放、羽化
     * @returns 处理后的图片DataURL
     */
    const processImage = async (): Promise<string> => {
        const {
            rotate = 0,
            scale = 1,
            featherSize = 0,
        } = options

        // 创建图片对象
        const image = new Image()
        image.crossOrigin = 'anonymous'

        await new Promise((resolve, reject) => {
            image.onload = resolve
            image.onerror = reject
            image.src = imageUrl
        })

        // 创建canvas
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
            throw new Error('Failed to get canvas context')
        }

        // 计算旋转后的尺寸
        let canvasWidth: number
        let canvasHeight: number

        if (rotate === Math.PI / 2 || rotate === -Math.PI / 2) {
            // 90度或-90度旋转，宽高互换
            canvasWidth = image.height
            canvasHeight = image.width
        }
        else {
            canvasWidth = image.width
            canvasHeight = image.height
        }

        canvas.width = canvasWidth
        canvas.height = canvasHeight

        // 保存初始状态
        ctx.save()

        // 移动原点到画布中心
        ctx.translate(canvasWidth / 2, canvasHeight / 2)

        // 应用旋转
        if (rotate !== 0) {
            ctx.rotate(rotate)
        }

        // 应用缩放
        if (scale !== 1) {
            ctx.scale(scale, scale)
        }

        // 移回原点，绘制图片
        ctx.translate(-image.width / 2, -image.height / 2)
        ctx.drawImage(image, 0, 0)

        // 恢复状态
        ctx.restore()

        // 应用羽化效果
        if (featherSize > 0) {
            applyFeather(ctx, canvas.width, canvas.height, featherSize)
        }

        // 转换为DataURL
        return canvas.toDataURL('image/png')
    }

    return {
        processImage,
    }
}
