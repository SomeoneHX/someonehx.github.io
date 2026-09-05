import { ref } from 'vue'

const STORAGE_KEY = 'theme'
const MODES = ['light', 'dark', 'auto'] // 点击循环顺序：亮 → 暗 → 跟随系统

const mode = ref('auto')
const isDark = ref(false)
const isReady = ref(false)

function systemPrefersDark() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyTheme() {
  const dark =
    mode.value === 'dark' || (mode.value === 'auto' && systemPrefersDark())
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  isDark.value = dark
}

function initDarkMode() {
  const stored = localStorage.getItem(STORAGE_KEY)
  mode.value = MODES.includes(stored) ? stored : 'auto'
  applyTheme()
  isReady.value = true

  /* auto 模式下跟随系统主题变化 */
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      if (mode.value === 'auto') applyTheme()
    }
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', onChange)
    } else {
      mq.addListener(onChange) // 旧 Safari
    }
  }
}

function toggleDarkMode() {
  const idx = MODES.indexOf(mode.value)
  mode.value = MODES[(idx + 1) % MODES.length]
  try {
    localStorage.setItem(STORAGE_KEY, mode.value)
  } catch (e) {
    /* 隐私模式等场景忽略 */
  }
  applyTheme()
}

export function useDarkMode() {
  return { isDark, mode, isReady, initDarkMode, toggleDarkMode }
}
