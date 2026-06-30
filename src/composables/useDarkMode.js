import { ref } from 'vue'

const isDark = ref(false)
const isReady = ref(false)

function applyTheme(dark) {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  isDark.value = dark
}

function initDarkMode() {
  const stored = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const dark = stored ? stored === 'dark' : prefersDark
  applyTheme(dark)
  isReady.value = true
}

function toggleDarkMode() {
  applyTheme(!isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

export function useDarkMode() {
  return { isDark, isReady, initDarkMode, toggleDarkMode }
}
