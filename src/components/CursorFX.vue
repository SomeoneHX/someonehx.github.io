<script setup>
/* iPadOS 风格自定义指针
 *
 * 视觉：系统光标隐藏，由一个大号空心圆环跟手移动（默认态）；当指针命中
 * 「控件级」元素（链接/按钮/标签胶囊/导航项等）时，圆环平滑变形为吸附框并
 * 吸附过去——按钮这类自带边框/背景的目标贴合其原始轮廓；无轮廓的裸文本
 * 目标外扩一圈并补上圆角，形成 iPadOS 式包裹框。吸附后鼠标在控件内移动时，
 * 一个径向辉光斑（白色透镜高光，裁剪在框内）实时跟随指针位置，光斑直径随
 * 控件面积自动适配；移开再平滑缩回圆环。按下鼠标（未命中控件）时圆环收缩
 * 为一个小实心点，松开恢复。
 * 对比度：圆环/吸附轮廓采用主题主色 + 一圈反差色描边（halo），浅色主题下为
 * 「深环 + 白描边」，深色主题下为「浅环 + 黑描边」——落在页面任何深/浅色
 * 背景（Bing 大图、暗色代码块、卡片）上都至少有一侧可见，不会丢光标。
 *
 * 取舍说明：
 * - 大内容卡（文章卡片/相关文章/上下篇/归档条目）不是「控件」，hover 时
 *   保持圆点，避免整块描边太吵——iPadOS 对非控件同样不吸附。
 * - 文本框/下拉/全屏图片查看器/iframe（Giscus 评论区等）内部无法接管
 *   光标，命中这些区域时圆点隐藏、让位给系统原生光标（I 形 / zoom-out /
 *   iframe 内部指针），离开后圆点恢复。iframe 是「事件黑洞」——鼠标进入其
 *   内部后父页面收不到任何 pointermove，隐藏无法靠帧循环命中检测完成，
 *   而是靠：iframe 直绑 mouseenter + mouseover 委托 + 静默看门狗（父文档
 *   失联超过阈值且坐标落在 iframe 区域即强制隐藏）三层兜底。
 * - 遵循 prefers-reduced-motion 与 (pointer: fine) 检测：触屏或减弱动效
 *   偏好下完全禁用，系统光标原样保留，无任何副作用。
 * - SSR 安全：组件在服务端仅输出一个不可见空 div，所有浏览器 API 只在
 *   onMounted（客户端）后才初始化。
 */
import { onMounted, onUnmounted, ref } from 'vue'

const root = ref(null)
const glowRef = ref(null)   /* 吸附辉光子层（仅 snap 态可见，中心跟随鼠标） */

const RING = 26          /* 空闲态空心圆环外径（点击时缩为小实心点） */
const LERP = 0.5         /* 浮点跟随阻尼：越大越跟手，0.5 有轻微触感 */
const REVERT_MS = 200    /* 吸附移开后缩回圆点的时长（rAF 插值，实时追鼠标） */
const SNAP_PAD = 4       /* 无自带轮廓的文本目标：吸附框外扩量（px），轻微包裹即可 */
const SNAP_RADIUS = 6    /* 无轮廓目标补圆角：与站内按钮圆角一致（--radius-sm: 6px） */
const GLOW_LERP = 0.45   /* 吸附辉光跟随阻尼：0.45 贴手且带轻微柔滞 */
const GLOW_F = 1.15      /* 辉光直径 = sqrt(控件宽×高) × 系数 */
const GLOW_MIN = 44      /* 辉光直径上下限（px）：小标签不过碎、大按钮不过巨 */
const GLOW_MAX = 170

/* 吸附对象：控件级链接 / 按钮 / 标签（排除大内容链接） */
const INTERACTIVE_SEL =
  'a[href]:not(.card):not(.article__related-item):not(.article__pager-link):not(.archives__link),' +
  ' button,[role="button"],summary'

/* 需要让位系统光标的区域：输入控件 / 下拉 / 富文本 / 全屏查看器 / iframe */
const NATIVE_SEL = 'input,textarea,select,[contenteditable="true"],.image-viewer,iframe'

let on = false
let mode = 'off'        /* off | hidden | float | snap | reverting */
let rafId = 0
let mouseX = -100
let mouseY = -100
let dotX = -100
let dotY = -100
let needHit = false
let snapEl = null
let lastSnapRadius = 0  /* 记录吸附时写的圆角，供缩回插值作为起点 */
let revertFrom = null   /* {x,y,w,h,r,t0} 缩回插值的起点几何 */
let el = null
let glowEl = null        /* 辉光子层 DOM */
let glowX = 0            /* 光斑当前中心（相对吸附目标左上角，px） */
let glowY = 0
let glowD = 0            /* 光斑直径（吸附时按控件面积定一次） */
let snapGeo = null       /* {left, top, w, h} 吸附目标几何（viewport 坐标） */
let mqFine = null
let mqReduce = null
let lastMoveAt = 0      /* 最后一次父文档 pointermove 时刻，供静默看门狗判定 */
let iframeEls = []      /* 当前页面内 iframe（跨域文档：进入后父页面收不到指针事件） */
let boundFrames = new WeakSet() /* 已直绑 mouseenter 的 iframe，防重复 */
let watchdogTimer = 0   /* 静默看门狗 interval */

/* ---------- 工具 ---------- */

function writeShape(w, h, r, x, y) {
  el.style.width = `${w}px`
  el.style.height = `${h}px`
  el.style.borderRadius = `${r}px`
  el.style.transform = `translate(${x}px, ${y}px)`
}

/* 写光斑位置：以 (x, y)（相对吸附目标左上角）为光斑中心 */
function writeGlow(x, y) {
  glowEl.style.transform = `translate(${x - glowD / 2}px, ${y - glowD / 2}px)`
}

/* 读取目标圆角（px），超大值（胶囊 9999px）clamp 到高的一半 */
function radiusOf(node, w, h) {
  const m = /^([\d.]+)px/.exec(getComputedStyle(node).borderRadius || '')
  if (!m) return 8
  return Math.min(parseFloat(m[1]), Math.min(w, h) / 2)
}

/* 目标是否「自带轮廓」：可见边框 / 背景图 / 非透明背景色（含实色 rgb）。
   自带轮廓的目标（按钮、带背景胶囊等）吸附框贴合原始尺寸圆角；
   否则（裸文本链接等）吸附框外扩并补圆角，形成 iPadOS 式包裹框。 */
function hasOwnOutline(node) {
  const cs = getComputedStyle(node)
  if (cs.borderTopStyle !== 'none' && parseFloat(cs.borderTopWidth) > 0) return true
  if (cs.backgroundImage !== 'none') return true
  const bg = cs.backgroundColor
  if (!bg || bg === 'transparent') return false
  /* 浏览器把 transparent 规范化为 rgba(0,0,0,0)：带显式 alpha 则 >0 才算有背景 */
  const m = /,\s*([\d.]+)\s*\)\s*$/.exec(bg)
  return !m || parseFloat(m[1]) > 0
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3)
}

function visibility() {
  el.classList.toggle('cfx-visible', mode !== 'off' && mode !== 'hidden')
}

function startLoop() {
  if (rafId) return
  rafId = requestAnimationFrame(frame)
}

function stopLoop() {
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = 0
  }
}

/* ---------- 状态机 ---------- */

function hitTest() {
  /* hidden/off 态先由 onMove 切回 float 再进这里；reverting 中允许被新目标重新吸附 */
  if (mode !== 'float' && mode !== 'snap' && mode !== 'reverting') return

  const hit = document.elementFromPoint(mouseX, mouseY)
  if (!hit) return toHidden()

  /* 原生光标区域：隐藏圆点，让位系统光标（closest 覆盖普通 DOM 的
     input/iframe 等；shadow 宿主内 iframe 用深穿透补查） */
  if (hit.closest(NATIVE_SEL) || topIframeAt(mouseX, mouseY, hit)) return toHidden()

  const it = hit.closest(INTERACTIVE_SEL)
  if (it) {
    /* 已吸附到同一目标：保持（目标 rect 静态，无需重写） */
    if (mode === 'snap' && snapEl === it) return
    /* 浮点命中 → 吸附；缩回途中再次命中新目标 → 立即改吸，不断在半缩圆点停留 */
    doSnap(it)
    return
  }
  if (mode === 'snap' || mode === 'reverting') revertToMouse()
}

function doSnap(it) {
  const r = it.getBoundingClientRect()
  if (!r.width || !r.height) return

  /* 吸附框几何：
     - 自带轮廓（按钮/胶囊等）：贴合原始尺寸与圆角，不再外扩；
     - 无轮廓裸文本：外扩 SNAP_PAD 包裹文本 + 补 SNAP_RADIUS 圆角（与按钮一致）。 */
  const own = hasOwnOutline(it)
  const pad = own ? 0 : SNAP_PAD
  const w = r.width + pad * 2
  const h = r.height + pad * 2
  const x = r.left - pad
  const y = r.top - pad
  const radius = own ? radiusOf(it, w, h) : SNAP_RADIUS

  snapEl = it
  mode = 'snap'
  stopLoop() /* 吸附形状由 CSS transition 驱动；辉光跟随由 frame 插值驱动 */

  snapGeo = { left: x, top: y, w, h }
  lastSnapRadius = radius
  el.classList.add('cfx-morph')
  writeShape(w, h, radius, x, y)
  el.classList.add('cfx-snapped')
  /* 辉光就位：直径随控件面积（小胶囊与大按钮都协调），中心直接落在
     当前鼠标相对位置——随吸附过渡一起亮起，不做跨越动画 */
  glowD = Math.max(
    GLOW_MIN,
    Math.min(GLOW_MAX, Math.round(Math.sqrt(r.width * r.height) * GLOW_F))
  )
  glowEl.style.width = `${glowD}px`
  glowEl.style.height = `${glowD}px`
  glowX = mouseX - x
  glowY = mouseY - y
  writeGlow(glowX, glowY)
  visibility()
}

/* 移开吸附目标：逐帧插值缩回圆点。起点 = 当前吸附形状；
   终点 = 每帧都取「最新鼠标坐标」——回退途中鼠标继续移动也会被圆点追上，
   不会出现圆点卡在组件边缘滑向过期坐标的断层。 */
function revertToMouse() {
  if (mode !== 'snap') return
  const cur = el.getBoundingClientRect()
  snapEl = null
  revertFrom = {
    x: cur.left,
    y: cur.top,
    w: cur.width,
    h: cur.height,
    r: Math.min(lastSnapRadius, Math.min(cur.width, cur.height) / 2),
    t0: performance.now(),
  }
  mode = 'reverting'
  el.classList.remove('cfx-snapped', 'cfx-morph') /* 手动逐帧写形态，不再靠 CSS transition */
  startLoop()
}

/* 场景突变（滚动/缩放/路由切换）→ 吸附形状已无意义，直接瞬移成圆点跟手，
   不做从远处滑回的动画 */
function snapAbort() {
  if (mode !== 'snap' && mode !== 'reverting') return
  snapEl = null
  mode = 'float'
  const h = RING / 2
  dotX = mouseX - h
  dotY = mouseY - h
  el.classList.remove('cfx-snapped', 'cfx-morph')
  writeShape(RING, RING, h, dotX, dotY)
  startLoop()
}

function toHidden() {
  if (mode === 'hidden') return
  stopLoop()
  snapEl = null
  const h = RING / 2
  el.classList.remove('cfx-snapped', 'cfx-morph', 'cfx-press')
  writeShape(RING, RING, h, mouseX - h, mouseY - h)
  mode = 'hidden'
  visibility()
}

/* 每帧：命中检测 + 形态/位置插值（缩回期与浮点期共用一帧循环） */
function frame() {
  rafId = requestAnimationFrame(frame)
  if (needHit) {
    needHit = false
    hitTest()
  }

  /* 缩回插值：从吸附形状（矩形）ease-out 缩回圆点，终点实时追最新鼠标坐标 */
  if (mode === 'reverting') {
    const t = (performance.now() - revertFrom.t0) / REVERT_MS
    const e = t >= 1 ? 1 : easeOutCubic(t)
    const h = RING / 2
    const tx = mouseX - h
    const ty = mouseY - h
    writeShape(
      revertFrom.w + (RING - revertFrom.w) * e,
      revertFrom.h + (RING - revertFrom.h) * e,
      revertFrom.r + (h - revertFrom.r) * e,
      revertFrom.x + (tx - revertFrom.x) * e,
      revertFrom.y + (ty - revertFrom.y) * e
    )
    if (t < 1) return
    mode = 'float'
    dotX = tx
    dotY = ty
    /* 落到下方浮点分支继续（位移已收敛，会立即停帧） */
  }

  /* 吸附期：光斑中心每帧向最新鼠标相对位置插值——鼠标在控件内移动时，
     辉光实时跟手（glowX/Y 是相对 snapGeo 的偏移，目标控件不滚动则几何恒定） */
  if (mode === 'snap' && snapGeo) {
    const tx = mouseX - snapGeo.left
    const ty = mouseY - snapGeo.top
    const dx = tx - glowX
    const dy = ty - glowY
    if (Math.abs(dx) >= 0.5 || Math.abs(dy) >= 0.5) {
      glowX += dx * GLOW_LERP
      glowY += dy * GLOW_LERP
      writeGlow(glowX, glowY)
    }
    if (!needHit && Math.abs(tx - glowX) < 0.5 && Math.abs(ty - glowY) < 0.5) {
      stopLoop()
    }
    return
  }

  if (mode !== 'float') {
    if (!needHit) stopLoop()
    return
  }
  const h = RING / 2
  const dx = mouseX - h - dotX
  const dy = mouseY - h - dotY
  if (Math.abs(dx) < 0.4 && Math.abs(dy) < 0.4) {
    dotX = mouseX - h
    dotY = mouseY - h
    el.style.transform = `translate(${dotX}px, ${dotY}px)`
    if (!needHit) stopLoop()
    return
  }
  dotX += dx * LERP
  dotY += dy * LERP
  el.style.transform = `translate(${dotX}px, ${dotY}px)`
}

/* ---------- 事件 ---------- */

function onMove(e) {
  if (!on) return
  mouseX = e.clientX
  mouseY = e.clientY
  lastMoveAt = performance.now()
  /* 指针位于原生光标区（输入框 / iframe / 查看器等）：保持隐藏，绝不恢复浮点。
     尤其 iframe：一旦进入其内部，父文档收不到后续 pointermove，若在此把圆点
     拉回 float，它会残留在边界坐标上「悬浮」——命中检测已失效救不回来。 */
  const t = e.target
  if (t && typeof t.closest === 'function' && t.closest(NATIVE_SEL)) {
    toHidden()
    needHit = false
    return
  }
  if (mode === 'off' || mode === 'hidden') {
    /* 首次出现 / 从原生光标区恢复：直接瞬移到指针处，避免从屏外滑入 */
    mode = 'float'
    const h = RING / 2
    dotX = mouseX - h
    dotY = mouseY - h
    writeShape(RING, RING, h, dotX, dotY)
    visibility()
  }
  needHit = true
  startLoop()
}

function onDocLeave() {
  if (on && mode !== 'hidden') toHidden()
}

/* 尽力而为的边界拦截：指针可见地落在 iframe/输入区元素上时立即隐藏。
   普通 DOM 元素用 closest 判断；giscus-widget 这类 Shadow DOM 宿主里的
   iframe 事件会被 retarget、closest 查不到，需用坐标深穿透 topIframeAt 补查。 */
function onDocOver(e) {
  if (!on) return
  const t = e.target
  if (t && typeof t.closest === 'function' && t.closest(NATIVE_SEL)) {
    toHidden()
    return
  }
  if (t && topIframeAt(e.clientX, e.clientY, t)) toHidden()
}

/* ---------- iframe 失联兜底 ----------
 * 评论区用的是官方 <giscus-widget> 自定义元素：真正的 iframe 在其 Shadow DOM
 * 内部。querySelectorAll 查不到它、事件也被 retarget 到宿主——必须穿透 shadow。
 * 跨域 iframe 本身还是「事件黑洞」：鼠标一进入其内部，父页面就收不到任何
 * pointermove/mouseover，圆点会残留在进入前的坐标上。策略：
 *  1. 递归穿透 Shadow DOM 收集所有 iframe，逐个直绑 mouseenter —— 鼠标跨入
 *     iframe 盒区域的瞬间即隐藏（合成器 hover 事件，不依赖子文档事件）；
 *  2. 静默看门狗 —— 父文档失联超阈值、且最后已知坐标落在 iframe 区域即隐藏，
 *     兜住 mouseenter 未触发（如快速甩入）的情形。
 * 移出 iframe 回到父文档时事件恢复，onMove 自动把圆点带回来。 */

/* 深命中下钻：from 是 document 层 elementFromPoint 的 topmost（调用方已查过）。
   - from 本身是 iframe → 指针在 iframe 上（同/跨域一律返回 iframe 元素本身）；
   - from 带 open shadowRoot（如 <giscus-widget>）→ 逐层深入 shadow 内
     elementFromPoint，找到内部 iframe 才算命中（事件虽被 retarget，几何不骗人）。
   其余情况返回 null。 */
function topIframeAt(x, y, from) {
  if (!from) return null
  if (from.tagName === 'IFRAME') return from
  if (!from.shadowRoot) return null
  let doc = from.shadowRoot
  for (let i = 0; i < 6; i++) {
    const n = doc.elementFromPoint(x, y)
    if (!n) return null
    if (n.tagName === 'IFRAME') return n
    if (n.shadowRoot) {
      doc = n.shadowRoot
      continue
    }
    return null
  }
  return null
}

/* 递归收集普通 DOM 与所有 open shadow root 内的 iframe（全量 DFS，
   由看门狗低频调用；WeakSet 防重复绑定 mouseenter） */
function scanIframes() {
  const found = []
  const walk = (root) => {
    for (const el of root.querySelectorAll('*')) {
      if (el.tagName === 'IFRAME') {
        found.push(el)
        continue
      }
      if (el.shadowRoot) walk(el.shadowRoot)
    }
  }
  walk(document)
  iframeEls = found
  for (const f of found) {
    if (boundFrames.has(f)) continue
    boundFrames.add(f)
    f.addEventListener('mouseenter', onFrameEnter)
  }
}

function onFrameEnter() {
  if (on) toHidden()
}

function withinIframe(x, y, pad = 6) {
  for (const f of iframeEls) {
    if (!f.isConnected) continue
    const r = f.getBoundingClientRect()
    if (r.width <= 0 || r.height <= 0) continue
    if (x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad) {
      return true
    }
  }
  return false
}

let scanCounter = 0

function watchdogTick() {
  if (!on) return
  /* 低频全量重扫（~每 500ms）：Giscus iframe 是懒加载 + Shadow DOM 动态挂载，
     出现后最多 500ms 内被发现并直绑 mouseenter */
  scanCounter++
  if (scanCounter % 4 === 1) scanIframes()
  if (mode === 'hidden') return
  if (mouseX < 0 || mouseY < 0) return
  const silent = performance.now() - lastMoveAt
  if (silent < 90) return
  /* 慢速进入 iframe：最后父坐标贴近边界（±6px）→ 静默 90ms 即隐藏。
     快速甩入：最后父坐标可能离边界几十 px → 需静默更久（320ms）才按
     更宽范围（±48px）判定隐藏，避免把停在 iframe 附近阅读的光标误藏。 */
  if (withinIframe(mouseX, mouseY, 6)) {
    if (silent > 90) toHidden()
  } else if (withinIframe(mouseX, mouseY, 48)) {
    if (silent > 320) toHidden()
  }
}

function startWatchdog() {
  if (watchdogTimer) return
  watchdogTimer = setInterval(watchdogTick, 120)
}

function stopWatchdog() {
  if (watchdogTimer) {
    clearInterval(watchdogTimer)
    watchdogTimer = 0
  }
}

/* 路由即将切换（旧页元素将卸载）→ 瞬移回圆点，避免残留变形框 */
function onRouteLeave() {
  if (on && (mode === 'snap' || mode === 'reverting')) snapAbort()
}

/* 新页入场稳定后 → 重新扫描 iframe 并以当前指针位置重新命中检测 */
function onRouteChange() {
  if (!on) return
  scanIframes()
  if (mode !== 'float') return
  needHit = true
  startLoop()
}

function onDown() {
  if (on && mode !== 'hidden') el.classList.add('cfx-press')
}
function onUp() {
  if (on) el.classList.remove('cfx-press')
}

/* 滚动 / 缩放使吸附目标位置变化 → 瞬移回圆点跟手（不做从远处滑回的动画） */
function onViewChange() {
  if (on && (mode === 'snap' || mode === 'reverting')) snapAbort()
}

/* ---------- 启停（仅客户端） ---------- */

function bind() {
  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('pointerdown', onDown, true)
  window.addEventListener('pointerup', onUp, true)
  window.addEventListener('scroll', onViewChange, true)
  window.addEventListener('resize', onViewChange)
  document.addEventListener('mouseleave', onDocLeave)
  document.addEventListener('mouseover', onDocOver, true)
  window.addEventListener('cfx:leave', onRouteLeave)
  window.addEventListener('cfx:routechange', onRouteChange)
}

function unbind() {
  window.removeEventListener('pointermove', onMove)
  window.removeEventListener('pointerdown', onDown, true)
  window.removeEventListener('pointerup', onUp, true)
  window.removeEventListener('scroll', onViewChange, true)
  window.removeEventListener('resize', onViewChange)
  document.removeEventListener('mouseleave', onDocLeave)
  document.removeEventListener('mouseover', onDocOver, true)
  window.removeEventListener('cfx:leave', onRouteLeave)
  window.removeEventListener('cfx:routechange', onRouteChange)
}

function enable() {
  if (on || !root.value) return
  if (!mqFine.matches || mqReduce.matches) return
  on = true
  el = root.value
  glowEl = glowRef.value
  document.documentElement.classList.add('cfx-on')
  mode = 'off'
  el.classList.remove('cfx-visible', 'cfx-snapped', 'cfx-morph', 'cfx-press')
  writeShape(RING, RING, RING / 2, -100, -100)
  scanIframes()
  startWatchdog()
  bind()
}

function disable() {
  if (!on) return
  on = false
  stopLoop()
  stopWatchdog()
  unbind()
  document.documentElement.classList.remove('cfx-on')
  if (el) {
    el.classList.remove('cfx-visible', 'cfx-snapped', 'cfx-morph', 'cfx-press')
    mode = 'off'
    glowEl = null
  }
}

function onMqChange() {
  if (mqFine.matches && !mqReduce.matches) enable()
  else disable()
}

onMounted(() => {
  /* 全部浏览器 API 仅在客户端初始化（SSR 阶段跳过） */
  mqFine = window.matchMedia('(pointer: fine)')
  mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)')
  enable()
  mqFine.addEventListener?.('change', onMqChange)
  mqReduce.addEventListener?.('change', onMqChange)
})

onUnmounted(() => {
  mqFine?.removeEventListener?.('change', onMqChange)
  mqReduce?.removeEventListener?.('change', onMqChange)
  disable()
})
</script>

<template>
  <!-- 固定定位不 Teleport：保持 .app 祖先无 transform 即可（fixed 全视口有效），
       且 SSR 只会输出这个不可见空 div，无副作用 -->
  <div ref="root" class="cfx-pointer" aria-hidden="true">
    <span ref="glowRef" class="cfx-pointer__glow"></span>
    <span class="cfx-pointer__core"></span>
  </div>
</template>

<style>
/* 指针主题色：主色随明暗反转，halo 取反差色——任意内容背景下都至少
   有一侧与背景形成对比，光标不会在深色区域消失。 */
.cfx-pointer {
  --cfx-ink: #171717;
  --cfx-halo: rgba(255, 255, 255, 0.8);
  --cfx-snap-ink: rgba(23, 23, 23, 0.55);
  --cfx-snap-bg: rgba(23, 23, 23, 0.08);
  /* 辉光 = 白色高光（提亮透镜），浅色背景上需更高不透明度才可见 */
  --cfx-glow-core: rgba(255, 255, 255, 0.6);
  --cfx-glow-mid: rgba(255, 255, 255, 0.18);
}
html[data-theme='dark'] .cfx-pointer {
  --cfx-ink: #ededed;
  --cfx-halo: rgba(0, 0, 0, 0.55);
  --cfx-snap-ink: rgba(237, 237, 237, 0.6);
  --cfx-snap-bg: rgba(237, 237, 237, 0.1);
  --cfx-glow-core: rgba(255, 255, 255, 0.34);
  --cfx-glow-mid: rgba(255, 255, 255, 0.1);
}

/* 全局光标门控：仅在 JS 判定启用时隐藏系统光标 */
html.cfx-on,
html.cfx-on body {
  cursor: none;
}
html.cfx-on * {
  cursor: none !important;
}
/* 让位给系统原生光标：输入区 I 形 / 下拉 / 富文本。
   iframe 内部文档不在本站控制范围，自动显示其自身光标。 */
html.cfx-on :is(input, textarea, select, [contenteditable='true']) {
  cursor: auto !important;
}
/* 全屏图片查看器：整体让位系统光标，图片保留 zoom-out 语义 */
html.cfx-on .image-viewer {
  cursor: default !important;
}
html.cfx-on .image-viewer img {
  cursor: zoom-out !important;
}
</style>

<style scoped>
.cfx-pointer {
  position: fixed;
  left: 0;
  top: 0;
  width: 26px;
  height: 26px;
  border-radius: 13px;
  pointer-events: none;
  z-index: 2147483000;
  opacity: 0;
  overflow: hidden; /* 辉光等子层裁剪在自身轮廓（含动态圆角）内，吸附时只照亮控件区域 */
  transition: none;
  will-change: transform, width, height, border-radius;
  transform: translate(-100px, -100px);
}

.cfx-pointer.cfx-visible {
  opacity: 1;
}

/* 默认态：大号空心圆环。border 为主题主色，外圈 1px 反差色 halo 保证在
   深/浅内容背景上都可辨认（halo 由全局样式块按明暗主题定义）。 */
.cfx-pointer__core {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  border: 2px solid var(--cfx-ink);
  box-shadow: 0 0 0 1px var(--cfx-halo);
  transition:
    transform 110ms ease-out,
    background-color 110ms ease-out,
    border-color 110ms ease-out,
    box-shadow 110ms ease-out;
  transform-origin: center;
}

/* 按压反馈（未吸附控件时）：圆环以指针为中心收缩为小实心点 */
.cfx-pointer.cfx-press:not(.cfx-snapped) .cfx-pointer__core {
  transform: scale(0.3);
  background-color: var(--cfx-ink);
  border-color: transparent;
  box-shadow: 0 0 0 1px var(--cfx-halo);
}

/* 吸附辉光：控件上的「透镜光斑」，中心由 JS 逐帧插值跟随鼠标相对位置，
   径向渐变亮→透明，落在控件上形成 iPadOS 式内部高光；仅吸附态可见。
   不裁剪溢出（渐变尾部本来就透明），小胶囊上光晕可自然漫出一点。 */
.cfx-pointer__glow {
  position: absolute;
  left: 0;
  top: 0;
  width: 0;
  height: 0;
  border-radius: 50%;
  opacity: 0;
  pointer-events: none;
  will-change: transform;
  background: radial-gradient(
    circle,
    var(--cfx-glow-core) 0%,
    var(--cfx-glow-mid) 52%,
    transparent 74%
  );
  transition: opacity 160ms ease-out;
}
.cfx-pointer.cfx-snapped .cfx-pointer__glow {
  opacity: 1;
}

/* 变形过渡：仅形态切换时启用，浮点跟随期间不触发（避免逐帧延迟） */
.cfx-pointer.cfx-morph {
  transition:
    width 260ms cubic-bezier(0.22, 1, 0.36, 1),
    height 260ms cubic-bezier(0.22, 1, 0.36, 1),
    border-radius 260ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 260ms cubic-bezier(0.22, 1, 0.36, 1),
    border-color 260ms ease,
    background 260ms ease;
}

/* 吸附态：目标轮廓的胶囊。主色为 var(--cfx-ink)（明暗自适应），
   外圈叠加反差 halo 保证落在深色卡片/图片上也可见。 */
.cfx-pointer.cfx-snapped {
  border: 1.5px solid var(--cfx-snap-ink);
  background: var(--cfx-snap-bg);
  box-shadow:
    0 0 0 1px var(--cfx-halo),
    0 2px 10px rgba(0, 0, 0, 0.08);
}
.cfx-pointer.cfx-snapped .cfx-pointer__core {
  opacity: 0;
}

/* 吸附态按下：保持轮廓但整体轻微收缩提亮，作为点击反馈 */
.cfx-pointer.cfx-snapped.cfx-press {
  opacity: 0.7;
  box-shadow:
    0 0 0 1px var(--cfx-halo),
    0 2px 10px rgba(0, 0, 0, 0.08),
    inset 0 0 0 2px var(--cfx-snap-ink);
}
</style>
