import introJs from 'intro.js'
import 'intro.js/minified/introjs.min.css'

export default defineNuxtPlugin(() => {
    return {
        provide: {
            intro: introJs,
        },
    }
})
