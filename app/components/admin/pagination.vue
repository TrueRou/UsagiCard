<script setup lang="ts">
interface Props {
    totalPages: number
    currentPage: number
}

interface Emits {
    (e: 'update:currentPage', page: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

function getPageNumbers() {
    const totalPages = props.totalPages
    const current = props.currentPage
    const pages: (number | string)[] = []

    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i)
    }
    else {
        pages.push(1)
        if (current > 3)
            pages.push('...')
        const start = Math.max(2, current - 1)
        const end = Math.min(totalPages - 1, current + 1)
        for (let i = start; i <= end; i++) pages.push(i)
        if (current < totalPages - 2)
            pages.push('...')
        pages.push(totalPages)
    }
    return pages
}

function goToPage(page: number) {
    emit('update:currentPage', page)
}
</script>

<template>
    <div v-if="totalPages > 1" class="flex justify-center mt-6">
        <div class="join">
            <button
                class="join-item btn btn-sm"
                :disabled="currentPage <= 1"
                @click="goToPage(currentPage - 1)"
            >
                上一页
            </button>
            <template v-for="page in getPageNumbers()" :key="page">
                <button
                    v-if="page !== '...'"
                    class="join-item btn btn-sm"
                    :class="{ 'btn-active': page === currentPage }"
                    @click="goToPage(page as number)"
                >
                    {{ page }}
                </button>
                <span v-else class="join-item btn btn-sm btn-disabled">...</span>
            </template>
            <button
                class="join-item btn btn-sm"
                :disabled="currentPage >= totalPages"
                @click="goToPage(currentPage + 1)"
            >
                下一页
            </button>
        </div>
    </div>
</template>
