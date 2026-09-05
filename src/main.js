import { ViteSSG } from 'vite-ssg'
import App from './App.vue'
import routes from './router'
import { Icon } from '@iconify/vue'
import './styles/reset.css'
import './styles/variables.css'
import './styles/global.css'
import './styles/card.css'

if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual'
}

export const createApp = ViteSSG(App, { routes }, ({ app }) => {
  app.component('VIcon', Icon)
})

/* PWA：仅生产环境注册 Service Worker（开发模式不启用，避免缓存干扰）
 * 更新提示：发现新版本安装完成后，弹出「新版本已发布」toast，点击刷新生效 */
if (
  import.meta.env.PROD &&
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator
) {
  window.addEventListener('load', () => {
    /* 首次访问（无 controller）时不打扰，之后的更新才提示 */
    const wasControlled = !!navigator.serviceWorker.controller

    navigator.serviceWorker.register('/sw.js').then((reg) => {
      if (!wasControlled) return
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing
        if (!newWorker) return
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            showUpdateToast(() => {
              newWorker.postMessage({ type: 'SKIP_WAITING' })
              window.location.reload()
            })
          }
        })
      })
    }).catch(() => {})
  })
}

function showUpdateToast(onRefresh) {
  if (document.querySelector('.app-toast')) return
  const el = document.createElement('div')
  el.className = 'app-toast'
  const msg = document.createElement('span')
  msg.className = 'app-toast__msg'
  msg.textContent = '新版本已发布'
  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className = 'app-toast__btn'
  btn.textContent = '刷新'
  btn.addEventListener('click', onRefresh)
  el.append(msg, btn)
  document.body.appendChild(el)
}
