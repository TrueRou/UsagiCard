<script setup lang="ts">
interface Props {
    keyword?: string
    placeholder?: string
}

interface Emits {
    (e: 'search'): void
    (e: 'update:keyword', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
    keyword: '',
    placeholder: '搜索...',
})

const emit = defineEmits<Emits>()
</script>

<template>
    <div class="flex flex-col sm:flex-row gap-3 w-full">
        <input
            :value="keyword"
            type="text"
            :placeholder="placeholder"
            class="input input-bordered input-sm w-full sm:w-64"
            @input="emit('update:keyword', ($event.target as HTMLInputElement).value)"
            @keyup.enter="emit('search')"
        >
        <slot />
        <button class="btn btn-primary btn-sm" @click="emit('search')">
            搜索
        </button>
    </div>
</template>
