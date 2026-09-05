/**
 * 折叠框（.box，markdown :::info/success/warning/error 容器）开合动画。
 *
 * 视觉：展开 = 「抽屉」高度滑出，内容从模糊(8px)→清晰 落定；
 *       收回 = 反向，清晰→模糊 的同时高度合拢。
 * 实现：全部 WAAPI（与 pageTransition / CursorFX 同一套动画语言），
 *       直接动画 .box__body 的 height/padding/border-top + filter/opacity，
 *       不改动 v-html 渲染出的 DOM 结构。
 *
 * 关键时序：收回动画期间必须保持 [data-open]（内容可见）才能播模糊合拢，
 *   动画 finish 后才移除 [data-open] 交给 CSS 的 display:none 收尾——
 *   否则浏览器在属性翻转瞬间就会把内容藏掉，动画无从播放、且会闪断。
 *   展开同理：同帧内先置 [data-open]、把 body 钳到闭合初态（height 0 等）、
 *   强制 reflow 后再起动画，浏览器没有机会画出中间闪烁。
 *
 * 中途反向（动画未放完又点了一次）：终止当前动画并以当前可见高度为起点
 *   朝反方向继续，不会跳回全开/全闭再播。
 */

const OPEN_MS = 340        /* 展开时长（抽屉滑出 + 模糊聚焦） */
const CLOSE_MS = 260       /* 收回时长（清晰 → 模糊合拢，稍快更利落） */
const BLUR_PX = 8          /* 初态模糊半径（px） */
const OP_LOW = 0.25        /* 初态透明度（配合模糊，避免生硬跳变） */
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)' /* 与全站一致的缓动 */

/* 每个运行动画的方向，供中途点击反向 */
const animDir = new WeakMap()

function prefersReduce() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/* 读取 body 的目标几何：内容 padding 与分隔线宽（CSS 定义在 DynamicContent） */
function readPad(body) {
  const cs = getComputedStyle(body)
  return {
    pt: parseFloat(cs.paddingTop) || 0,
    pb: parseFloat(cs.paddingBottom) || 0,
    bw: parseFloat(cs.borderTopWidth) || 0,
  }
}

function blur(scale) {
  return `blur(${Math.round(BLUR_PX * scale)}px)`
}

function openBox(box, body, fromH) {
  box.setAttribute('data-open', '')
  const { pt, pb, bw } = readPad(body)
  const fullH = body.offsetHeight
  if (!fullH) return /* 空内容：保持展开即可 */

  /* 起点：此前若是收拢中途被反转，fromH 为当前可见高度，按比例折算 padding */
  const k0 = Math.max(0, Math.min(fromH, fullH)) / fullH
  const start = {
    height: `${k0 * fullH}px`,
    paddingTop: `${pt * k0}px`,
    paddingBottom: `${pb * k0}px`,
    borderTopWidth: `${bw * k0}px`,
    opacity: OP_LOW + (1 - OP_LOW) * k0,
    filter: blur(1 - k0),
  }
  /* 同一帧内钳到起点并强制 reflow，浏览器无机会画出中间态 */
  body.style.cssText =
    `height:${start.height};overflow:hidden;` +
    `padding-top:${start.paddingTop};padding-bottom:${start.paddingBottom};` +
    `border-top-width:${start.borderTopWidth};` +
    `opacity:${start.opacity};filter:${start.filter}`
  void body.offsetHeight

  const anim = body.animate(
    [
      { ...start },
      {
        height: `${fullH}px`,
        paddingTop: `${pt}px`,
        paddingBottom: `${pb}px`,
        borderTopWidth: `${bw}px`,
        opacity: 1,
        filter: 'blur(0px)',
      },
    ],
    { duration: OPEN_MS, easing: EASE }
  )
  animDir.set(anim, 'open')
  anim.addEventListener('finish', () => {
    body.style.cssText = '' /* 回到样式表定义，无内联残留 */
  })
}

function closeBox(box, body, fromH) {
  if (!box.hasAttribute('data-open')) return
  const { pt, pb, bw } = readPad(body)
  const fullH = body.offsetHeight
  if (!fullH) {
    box.removeAttribute('data-open')
    return
  }
  /* 以当前可见高度为起点收起（含中途反转场景） */
  const k0 = Math.max(0, Math.min(fromH, fullH)) / fullH
  const from = {
    height: `${k0 * fullH}px`,
    paddingTop: `${pt * k0}px`,
    paddingBottom: `${pb * k0}px`,
    borderTopWidth: `${bw * k0}px`,
    opacity: 1 - (1 - OP_LOW) * (1 - k0),
    filter: blur(1 - k0),
  }
  body.style.overflow = 'hidden' /* 合拢过程中裁掉溢出内容 */

  const anim = body.animate(
    [
      { ...from },
      {
        height: '0px',
        paddingTop: '0px',
        paddingBottom: '0px',
        borderTopWidth: '0px',
        opacity: OP_LOW,
        filter: blur(1),
      },
    ],
    { duration: CLOSE_MS, easing: EASE }
  )
  animDir.set(anim, 'close')
  anim.addEventListener('finish', () => {
    box.removeAttribute('data-open') /* 交给 CSS display:none 收尾 */
    body.style.cssText = ''
  })
}

/**
 * 切换折叠框开合。供 DynamicContent 的点击委托调用。
 * 动画进行中再次调用 = 反向（终止当前动画，从当前可见形态朝反方向播）。
 */
export function toggleBoxFx(box) {
  const body = box.querySelector(':scope > .box__body')
  const header = box.querySelector(':scope > .box__header')
  if (!body || !header) return

  if (prefersReduce()) {
    /* 减弱动效：直接切换，无动画 */
    box.toggleAttribute('data-open')
    return
  }

  const running = body.getAnimations().filter((a) => a.effect?.target === body)
  let lastDir = null
  let curH = body.getBoundingClientRect().height
  if (running.length) {
    lastDir = animDir.get(running[running.length - 1]) || null
    running.forEach((a) => {
      animDir.delete(a)
      a.cancel()
    })
    body.style.cssText = '' /* 回到样式表状态，再以当前可见高度为新起点 */
    if (curH <= 1) curH = body.getBoundingClientRect().height
  }

  /* 若刚中止的是收起动画（data-open 仍在），点击意图 = 展开；反之亦然 */
  const wantOpen = lastDir ? lastDir === 'close' : !box.hasAttribute('data-open')
  if (wantOpen) openBox(box, body, curH)
  else closeBox(box, body, curH)
}
