/* 卡片 ⇄ 文章 过渡引擎（单例状态版）
 *
 * 目标：点击文章卡片时，观感是「被点的那张卡片本身在放大」—— 不是封面
 * 图单独飞、也不是另起一层与卡片无关的截图。卡片上的所有内容（封面图、
 * 渐变、标题、日期、摘要、标签文字）作为一整块随卡片一起被拉伸放大。
 *
 * ========== 正向（列表 → 文章）：整卡拉伸 ==========
 * 分层（垫底 z60 < 整卡层 z66 < navbar z100；真实文章页垫在垫底之下）：
 *   1. App 旧页 leave：
 *      · prepareForwardBackdrop(el)：旧列表视口 clone 成垫底快照（z60，
 *        不透明纸底）。点击瞬间列表不消失；同时它把「尚未就绪的真实文章页」
 *        整个盖住 —— 文章页此刻已在下方挂载，但直到结尾交接前绝不露出
 *        （防止双层文章 / 提前看到目标页）。
 *      · prepareForwardCard(src)：把被点卡片 clone 成「整卡层」（z66），
 *        rect 精确 = 整卡 cardRect，与垫底里的同一张卡片完全重合无缝。
 *        整卡层携带卡片全部内容（不是只 clone 封面 <img>）：封面图 +
 *        底部黑渐变 + 封面标题 + 卡身（日期/摘要/标签）。文字会随整卡
 *        一起放大 —— 这是「卡片里的内容在放大」的载体。
 *   2. ArticleView 挂载 → runCardGrow(root)：
 *      · 整卡层从 cardRect 放大，让卡片封面条精确落到文章 hero 的位置
 *        （top-left 对齐 hero、宽度放大到文章宽），封面图全程同一张
 *        <img> 连续放大、绝无第二份图源 —— 不会出现封面「闪现」；
 *      · 放大中后段：封面标题 / 卡身文字按进度淡出 —— 它们已被看见完整
 *        放大过程，淡出是为了不与真实文章里同文的标题/正文在交接时重叠
 *        成「双层文字」；
 *      · 结尾前封面图样渐变成 hero 的暗化+模糊+微放大（与真实 hero CSS
 *        同值），随后整卡层与垫底在最后 ~13% 同步溶解 —— 露出下方早已
 *        1:1 就位的真实文章页。交接时两层图样几乎一致，无跳变。
 *   3. 结束 → removeAll 同帧移除两层，真实文章页无缝接管。
 *
 *   非共享内容（文章正文/hero 标题）由真实文章页自身在交接溶解中淡出，
 *   落在其最终位置 —— 共享元素（封面）平滑、非共享内容放大+淡入。
 *
 * ========== 反向（文章 → 列表）：视口画面收拢进卡片 ==========
 * （用户已验证正确，保持不动）
 *   1. prepareBackFlip(el)：文章当前视口 clone 成快照窗
 *   2. 列表 mount（恢复分页/滚动）→ runBackFlip(cardRect)：快照窗收拢
 *      缩小进卡片 rect 并淡出 —— 文章画面「吸回」卡片
 *   3. 结束 → removeAll()
 *
 * 中断兜底：每次导航 leave 前调 cancelCoverFlip()（清整卡层/垫底/快照窗）。
 * 全程零像素读取（图层内是真实 <img>/DOM clone，无 canvas/crossOrigin）。
 */

let layer = null /* 当前激活的过渡窗口层（反向快照窗，同时只存在一个） */
let active = '' /* 'back' | '' —— 供目标页探测本次过渡类型 */
let fwdBackdrop = null /* 正向垫底快照（z60） */
let fwdCard = null /* 正向整卡层 wrapper（z66，卡片本体） */
let fwdFromRect = null /* 整卡层起点 rect（cardRect） */

/* ---------- 缓动 ---------- */

export const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

const clamp01 = (v) => Math.min(1, Math.max(0, v))

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)

/* ---------- 图层基础 ---------- */

function makeLayer() {
  const el = document.createElement('div')
  el.setAttribute('aria-hidden', 'true')
  el.inert = true
  el.style.cssText =
    'position:fixed;left:0;top:0;width:0;height:0;' +
    'pointer-events:none;will-change:transform,opacity'
  document.body.appendChild(el)
  return el
}

/** 只移除「当前激活」的窗口层：若已被新一轮过渡替换，不误伤新层 */
function removeLayer(el) {
  if (el && layer !== el) return
  if (layer && layer.parentNode) layer.parentNode.removeChild(layer)
  layer = null
  active = ''
}

/** 移除反向快照窗 + 正向整卡层 + 正向垫底（结束/中断时的完整清理） */
function removeAll() {
  removeLayer()
  if (fwdCard && fwdCard.parentNode) fwdCard.parentNode.removeChild(fwdCard)
  fwdCard = null
  fwdFromRect = null
  if (fwdBackdrop && fwdBackdrop.parentNode) {
    fwdBackdrop.parentNode.removeChild(fwdBackdrop)
  }
  fwdBackdrop = null
}

/** 取消一切残留过渡图层与垫底（导航离开/中断时调用） */
export function cancelCoverFlip() {
  removeAll()
}

/** 当前是否有激活的过渡窗口，以及它属于进入(enter)还是返回(back) */
export function getActiveMode() {
  return active
}

/* ---------- 正向垫底：旧列表视口快照 ----------
 * out-in 切换下旧列表页在点击瞬间即被卸载；且新文章页会在垫底之下提前
 * 挂载。垫底快照（z60，不透明纸底）一石二鸟：
 *   1. 列表画面保留到交接（「卡片在放大」的土壤）；
 *   2. 把真实文章页完全盖住，直到结尾整卡层与垫底一起溶解时才露出。
 * 注意：正向结束前垫底绝不能提前删除。 */

function removeForwardBackdrop() {
  if (fwdBackdrop && fwdBackdrop.parentNode) {
    fwdBackdrop.parentNode.removeChild(fwdBackdrop)
  }
  fwdBackdrop = null
}

/** 旧列表页 leave 时调用：把其当前视口画面做成正向垫底快照 */
export function prepareForwardBackdrop(el) {
  removeForwardBackdrop()
  if (!el || typeof el.cloneNode !== 'function') return false

  const vw = window.innerWidth
  const vh = window.innerHeight
  const scrollX = window.scrollX || 0
  const scrollY = window.scrollY || 0
  const cs = getComputedStyle(document.documentElement)
  const navHeight = parseFloat(cs.getPropertyValue('--nav-height')) || 56

  const shot = el.cloneNode(true)
  shot.querySelectorAll('script, iframe, video, audio, object, embed').forEach((n) => n.remove())
  const prevStyle = shot.getAttribute('style') || ''
  const width = el.offsetWidth || vw
  shot.setAttribute(
    'style',
    `${prevStyle};position:absolute;left:0;top:0;width:${width}px;` +
      `transform:translate(${-scrollX}px, ${navHeight - scrollY}px)`
  )

  const win = document.createElement('div')
  win.style.cssText =
    `position:fixed;left:0;top:0;width:${vw}px;height:${vh}px;overflow:hidden;` +
    'background:var(--color-bg-warm,#fefcf5)'
  win.appendChild(shot)

  const box = document.createElement('div')
  box.setAttribute('aria-hidden', 'true')
  box.style.cssText =
    'position:fixed;left:0;top:0;width:100%;height:100%;' +
    'pointer-events:none;will-change:opacity;z-index:60'
  box.appendChild(win)

  document.body.appendChild(box)
  fwdBackdrop = box
  return true
}

/* ---------- 正向整卡层：被点卡片本体 ---------- */

/**
 * 点击瞬间（旧页 leave）调用：把被点卡片整张 clone 成整卡层。
 * rect 精确 = 整卡 cardRect → 与垫底里的同一张卡片完全重合无缝。
 *
 * 关键：整卡层必须是「整张卡片」而不只是封面条 —— 否则卡身里的日期/
 * 摘要/标签文字永远静止在垫底里、不参与放大（用户已多次指出的观感缺陷）。
 * 整卡层 clone 自 src.el（被点 .card，此刻仍在旧页 DOM 中，未卸载）：
 *   - 卡片全部内容一起放大：封面图（同一张 <img> 连续放大，无第二份
 *     图源 → 不会出现封面「闪现」）、底部黑渐变、封面标题、卡身文字；
 *   - clone 而非移用：不触碰旧页 DOM 结构，Vue 卸载无副作用；克隆的
 *     封面图与垫底同 URL 已解码，且正下方就是垫底里同图的卡片，即使
 *     偶发一帧未就绪也毫无可见差异。
 * @param {object} src saveFlipSource 的结果
 * @param {{left,top,width,height}} src.cardRect 整卡 rect
 * @param {HTMLElement} src.el 被点卡片元素（一次性，clone 后置 null 释放）
 * @returns {boolean}
 */
export function prepareForwardCard(src) {
  if (fwdCard && fwdCard.parentNode) fwdCard.parentNode.removeChild(fwdCard)
  fwdCard = null
  fwdFromRect = null
  if (!src || !src.cardRect || !src.el) return false
  const cr = src.cardRect
  if (cr.width <= 0 || cr.height <= 0) return false

  const card = src.el.cloneNode(true)
  card.querySelectorAll('script, iframe, video, audio, object, embed').forEach((n) => n.remove())
  /* 装饰性外链小图标（非文章内容）不参与放大 */
  const ext = card.querySelector('.card__ext-link')
  if (ext) ext.remove()

  const prev = card.getAttribute('style') || ''
  /* 注意：不要在此把 border-radius 设 0 —— 整卡层起点必须与垫底里那张
     圆角卡片逐像素一致，圆角由 runCardGrow 随放大进度归零（文章页直角） */
  card.setAttribute(
    'style',
    `${prev};box-sizing:border-box;width:100%;height:100%;margin:0;` +
      'pointer-events:none;transition:none;transform:none;will-change:transform,opacity'
  )

  const wrap = document.createElement('div')
  wrap.setAttribute('aria-hidden', 'true')
  wrap.style.cssText =
    `position:fixed;left:${cr.left}px;top:${cr.top}px;` +
    `width:${cr.width}px;height:${cr.height}px;overflow:hidden;` +
    'pointer-events:none;transform-origin:0 0;will-change:transform,opacity;z-index:66'
  wrap.appendChild(card)

  document.body.appendChild(wrap)
  fwdCard = wrap
  fwdFromRect = { ...cr }
  /* 一次性引用：已 clone 完毕，释放避免长期持有已卸载卡片 DOM */
  src.el = null
  return true
}

/* ---------- 正向主动画：整卡拉伸 → 交接文章页 ---------- */

/**
 * 文章页挂载、首屏就绪后调用。
 * 整卡层从 cardRect 放大：卡片封面条 top-left → hero top-left、
 * 宽度 → 文章宽 aW（封面即 hero 同图同 URL，几何落位后由文章页接管）。
 * @param {HTMLElement} el 文章根节点（.article，已滚顶）
 * @param {object} [opts]
 * @param {number} [opts.duration] 总时长（ms）
 * @param {()=>void} [opts.onDone]
 * @returns {boolean} 是否成功接管
 */
export function runCardGrow(el, opts = {}) {
  const { duration = 640, onDone } = opts
  const wrap = fwdCard
  const cr = fwdFromRect
  if (!wrap || !cr || !el) {
    if (onDone) onDone()
    return false
  }
  const aRect = el.getBoundingClientRect()
  const aW = el.offsetWidth || aRect.width
  if (aW <= 0) {
    if (onDone) onDone()
    return false
  }
  const header = el.querySelector('.article__header')
  const hr = header ? header.getBoundingClientRect() : aRect

  const card = wrap.firstElementChild
  if (!card) {
    removeAll()
    if (onDone) onDone()
    return false
  }
  const cardImg = card.querySelector('img') /* 封面 <img>（可能为 null：兜底色块） */
  const titleEl = card.querySelector('.card__cover-title')
  const contentEl = card.querySelector('.card__content')

  const cs = getComputedStyle(document.documentElement)
  const radius0 = parseFloat(cs.getPropertyValue('--radius-md')) || 12

  /* 终点几何：封面条 top-left 落到 hero top-left，宽放大到文章宽 */
  const sEnd = aW / cr.width
  const dx = hr.left - cr.left
  const dy = hr.top - cr.top

  /* hero 图样常量（与 .article__header-bg-img 的 CSS 同值） */
  const heroBrightness = 0.45
  const heroBlur = 6
  const heroScale = 1.1

  /* 进度窗口（观感微调点） */
  const growthEnd = 0.85 /* p 到此完成几何放大（随后进入交接段） */
  const textFrom = 0.38 /* 卡身文字（日期/摘要/标签）淡出 */
  const textTo = 0.56
  const titleFrom = 0.5 /* 封面标题淡出（已放大完整体现，避免与 hero 标题叠字） */
  const titleTo = 0.68
  const treatFrom = 0.8 /* 封面图样渐变成 hero 暗化/模糊/微放大 */
  const treatTo = 0.95
  const fadeFrom = 0.87 /* 整卡层 + 垫底同步溶解，露出下方真实文章页 */

  const backdrop = fwdBackdrop
  const start = performance.now()

  const step = (now) => {
    if (fwdCard !== wrap) {
      /* 已被更新一轮过渡接管：放弃本帧 */
      if (onDone) onDone()
      return
    }
    const p = clamp01((now - start) / duration)
    const g = easeOutCubic(Math.min(1, p / growthEnd))
    const s = 1 + (sEnd - 1) * g

    /* 整卡放大：translate + scale（transform-origin 0 0 = 卡片 top-left） */
    wrap.style.transform =
      `translate(${(dx * g).toFixed(2)}px, ${(dy * g).toFixed(2)}px) ` +
      `scale(${s.toFixed(5)})`

    /* 卡片圆角随放大归零（文章页为直角） */
    const rr = Math.max(0, Math.round(radius0 * (1 - g)))
    card.style.borderRadius = rr ? `${rr}px` : '0'

    /* 卡身文字淡出：已被看见完整放大过程，交接时让位给真实正文 */
    if (contentEl) {
      const o = 1 - clamp01((p - textFrom) / (textTo - textFrom))
      contentEl.style.opacity = o.toFixed(3)
    }
    /* 封面标题淡出：交接时由 hero 里同文标题在原位接管 */
    if (titleEl) {
      const o = 1 - clamp01((p - titleFrom) / (titleTo - titleFrom))
      titleEl.style.opacity = o.toFixed(3)
    }

    /* 交接前：封面图样渐变到 hero 处理，使两层在溶解瞬间几乎无差 */
    if (cardImg) {
      const k = clamp01((p - treatFrom) / (treatTo - treatFrom))
      if (k > 0) {
        /* blur 在父级放大坐标系内会被再次放大，按当前缩放折算成
           屏幕空间 ~6px；brightness / scale 与 hero CSS 同值 */
        const blur = (heroBlur / Math.max(1, s * heroScale)) * k
        cardImg.style.filter =
          `brightness(${(1 - (1 - heroBrightness) * k).toFixed(3)}) ` +
          `blur(${blur.toFixed(2)}px)`
        cardImg.style.transform = `scale(${1 + (heroScale - 1) * k})`
      }
    }

    /* 交接：整卡层 + 垫底同步溶解，露出下方 1:1 就位的真实文章页 */
    if (p >= fadeFrom) {
      const o = 1 - clamp01((p - fadeFrom) / (1 - fadeFrom))
      wrap.style.opacity = o.toFixed(3)
      if (backdrop) backdrop.style.opacity = o.toFixed(3)
    }

    if (p < 1) {
      requestAnimationFrame(step)
    } else {
      /* 与真实文章页 1:1 重合：两层同帧移除，无缝接管 */
      removeAll()
      if (onDone) onDone()
    }
  }
  requestAnimationFrame(step)
  return true
}

/* ========== 反向：文章视口画面收拢进卡片 ========== */

/** 文章页 leave 时调用：把「文章当前视口画面」做成快照窗 */
export function prepareBackFlip(el) {
  removeLayer()
  if (!el || typeof el.cloneNode !== 'function') return false
  const vw = window.innerWidth
  const vh = window.innerHeight
  const scrollX = window.scrollX || 0
  const scrollY = window.scrollY || 0
  const cs = getComputedStyle(document.documentElement)
  const navHeight = parseFloat(cs.getPropertyValue('--nav-height')) || 56

  const shot = el.cloneNode(true)
  shot.querySelectorAll('script, iframe, video, audio, object, embed').forEach((n) => n.remove())
  shot.querySelectorAll('.article__progress, .article__backtop').forEach((n) => n.remove())
  const prevStyle = shot.getAttribute('style') || ''
  const width = el.offsetWidth || vw
  shot.setAttribute(
    'style',
    `${prevStyle};position:absolute;left:0;top:0;width:${width}px;` +
      `transform:translate(${-scrollX}px, ${navHeight - scrollY}px)`
  )

  const win = document.createElement('div')
  win.style.cssText =
    `position:fixed;left:0;top:0;width:${vw}px;height:${vh}px;overflow:hidden;` +
    'background:var(--color-bg-warm,#fefcf5);will-change:transform,opacity'
  win.style.transformOrigin = '0 0'
  win.appendChild(shot)

  const box = makeLayer()
  box.style.cssText =
    'position:fixed;left:0;top:0;width:100%;height:100%;' +
    'pointer-events:none;z-index:60'
  box.appendChild(win)
  layer = box
  active = 'back'
  return true
}

/**
 * 列表页就绪后调用：视口窗整体收拢缩小进卡片 rect 并淡出。
 * @param {{left,top,width,height}} cardRect 卡片 rect（与列表恢复后一致）
 * @param {object} [opts]
 * @param {number} [opts.duration]
 * @param {()=>void} [opts.onDone]
 */
export function runBackFlip(cardRect, opts = {}) {
  const { duration = 520, onDone } = opts
  const box = layer
  const win = box && box.firstChild
  if (!box || !win || !cardRect) {
    if (box) removeAll()
    if (onDone) onDone()
    return
  }
  const vw = window.innerWidth
  const vh = window.innerHeight
  const sx = cardRect.width / vw
  const sy = cardRect.height / vh
  const anim = win.animate(
    [
      { transform: 'translate(0, 0) scale(1, 1)', opacity: 1, offset: 0 },
      { transform: 'translate(0, 0) scale(1, 1)', opacity: 1, offset: 0.45 },
      { transform: `translate(${cardRect.left}px, ${cardRect.top}px) scale(${sx}, ${sy})`, opacity: 1, offset: 0.78 },
      { transform: `translate(${cardRect.left}px, ${cardRect.top}px) scale(${sx}, ${sy})`, opacity: 0, offset: 1 },
    ],
    {
      duration,
      easing: 'cubic-bezier(0.33, 1, 0.68, 1)',
      fill: 'forwards',
    }
  )
  anim.finished
    .then(() => {
      removeAll()
      if (onDone) onDone()
    })
    .catch(() => {
      removeAll()
      if (onDone) onDone()
    })
}
