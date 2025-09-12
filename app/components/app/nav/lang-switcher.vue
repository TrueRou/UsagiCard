<script setup lang="ts">
const { t, locale, locales, setLocale, localeProperties } = useI18n()

const langSw = ref<HTMLElement | null>(null)

const OFFSET = 127397

function getFlagURL(flag: string) {
    let url = 'https://cdn.jsdelivr.net/npm/@twemoji/svg@latest/'

    for (let i = 0; i < flag.length; i++) {
        url += (flag.charCodeAt(i) + OFFSET).toString(16)
        i !== flag.length - 1 && (url += '-')
    }

    return `${url}.svg`
}
</script>
<template>
    <li tabindex="0">
        <details ref="langSw">
            <summary>
                <icon name="tabler:world" class="w-5 h-5" />{{ localeProperties.name }}
            </summary>
            <ul class="right-0 w-64 mt-0">
                <li v-for="l in locales" :key="l.code" :class="{
                    disabled: l.code === locale,
                }">
                    <a class="whitespace-nowrap" :class="{
                        active: l.code === locale,
                    }" @click="setLocale(l.code), langSw?.toggleAttribute('open', false)">
                        <img :alt="l.name" class="h-6" :src="getFlagURL((l as any).flag)"> {{ l.name }}
                    </a>
                </li>
            </ul>
        </details>
    </li>
</template>