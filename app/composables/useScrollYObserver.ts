const scrollY = ref(0)
let done = false

if (import.meta.client && !done) {
  window.addEventListener('scroll', () => (scrollY.value = window.scrollY))
  done = true
}

export const useScrollYObserver = () => {
  return scrollY
}
