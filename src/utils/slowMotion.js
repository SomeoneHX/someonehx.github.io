/* 慢动作（欣赏模式）
 *
 * 按住 Shift：此后触发的动画会以 SLOW_FACTOR 倍速播放，松开立即恢复原速。
 * 覆盖全站 WAAPI 动画（FLIP 展开 / 页面进出逐行落位 / 垫底快照退场 /
 * leaveFade 等，均走 Element.prototype.animate）。
 *
 * 实现零侵入：只劫持 Element.prototype.animate 统一登记动画，用 playbackRate
 * 降速——延迟、进度、结束 promise 全部随之放慢，现有动画代码无需感知本模块；
 * ArticleView 的高度裁切窗口逐帧读的是同一动画的 progress，天然同步。
 *
 * 另处理一个关键冲突：按住 Shift 点击 <a> 的浏览器默认行为是「新开窗口/标签」
 * （vue-router 对带修饰键的点击也让位默认）。因此 Shift+点击「站内链接」被改为
 * 站内慢速导航（cmd/ctrl/alt+点击、外链、mailto/锚点等一律不拦截，保持原行为）。
 * 文章卡片（.card）除外：慢动作激活时 ArticleCard 已放行 Shift+点击并走它自己的
 * rect 保存 + navigate（保 FLIP），这里不重复拦截。
 */

const DEFAULT_FACTOR = 0.25 /* 0.25 = 4 倍慢；改这里即可调整速率 */
const KEY = 'Shift'

let active = false
let factor = DEFAULT_FACTOR
let navigate = null /* 站内慢速导航回调（App 注入 router.push） */
let registered = false

const live = new Set() /* 尚未结束/取消的动画 */

export function isSlowMotion() {
  return active
}

function patchAnimate() {
  if (typeof Element === 'undefined') return
  if (Element.prototype.animate.__slowMoPatched) return
  Element.prototype.animate.__slowMoPatched = true
  const orig = Element.prototype.animate
  Element.prototype.animate = function (keyframes, options) {
    const anim = orig.call(this, keyframes, options)
    if (active) anim.playbackRate = factor
    const release = () => live.delete(anim)
    anim.addEventListener('finish', release, { once: true })
    anim.addEventListener('cancel', release, { once: true })
    live.add(anim)
    return anim
  }
}

function apply() {
  document.documentElement.classList.toggle('slow-mo', active)
  for (const anim of live) {
    try {
      anim.playbackRate = active ? factor : 1
    } catch {
      /* 已结束/被取消，交给 release 清理 */
    }
  }
}

function setSlow(on) {
  if (active === on) return
  active = on
  apply()
}

/* 在输入框/富文本里按住 Shift 是打大写/选字，不当作慢动作开关 */
function inEditable(t) {
  return (
    !!t &&
    t instanceof HTMLElement &&
    (t.isContentEditable ||
      t.tagName === 'INPUT' ||
      t.tagName === 'TEXTAREA' ||
      t.tagName === 'SELECT')
  )
}

function onKeyDown(e) {
  if (e.key !== KEY || e.repeat || active) return
  if (inEditable(e.target)) return
  setSlow(true)
}

function onKeyUp(e) {
  if (e.key !== KEY) return
  setSlow(false)
}

function reset() {
  setSlow(false)
}

/* Shift+点击站内链接：改成站内慢速导航（见文件头注释） */
function onClick(e) {
  if (!active || !e.shiftKey || !navigate) return
  if (e.metaKey || e.ctrlKey || e.altKey) return /* 保留新开标签等系统组合 */
  const t = e.target
  if (!(t instanceof Element)) return
  const a = t.closest('a[href]')
  if (!a) return
  const href = a.getAttribute('href') || ''
  if (href.startsWith('http') || href.startsWith('//')) return
  if (href.startsWith('#') || href.startsWith('mailto:')) return
  if (a.target === '_blank' || a.hasAttribute('download')) return
  /* 文章卡片交给 ArticleCard 自身的处理（慢动作激活时它已放行 Shift+点击，
     由它存卡片 rect 再 navigate，保住 FLIP）；这里只处理普通站内链接 */
  if (a.classList.contains('card')) return
  e.preventDefault()
  navigate(href)
}

/**
 * 启用慢动作。幂等：重复调用只更新参数，不重复挂监听。
 * @param {object} [opts]
 * @param {number} [opts.factor] 播放速率（0.25 = 4 倍慢）
 * @param {(href: string) => void} [opts.navigate]
 *   Shift+点击站内链接时的导航回调（不含文章卡片，卡片由 ArticleCard 处理）
 */
export function registerSlowMotion(opts = {}) {
  if (registered) {
    if (typeof opts.factor === 'number') factor = opts.factor
    if (typeof opts.navigate === 'function') navigate = opts.navigate
    return
  }
  if (typeof window === 'undefined') return /* SSR 安全 */
  registered = true
  if (typeof opts.factor === 'number') factor = opts.factor
  if (typeof opts.navigate === 'function') navigate = opts.navigate

  patchAnimate()
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  /* 按住 Shift 时切走窗口/失焦：兜底复位，避免永久慢动作 */
  window.addEventListener('blur', reset)
  document.addEventListener('click', onClick)
}
