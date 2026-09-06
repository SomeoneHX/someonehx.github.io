/* FLIP 垫底快照
 *
 * 点卡片进入文章时是 out-in 路由切换:旧列表页会被 Vue 立即卸载。若不做任何
 * 处理,点击瞬间列表整屏消失,只剩文章从卡片位放大——过渡不连贯。
 *
 * 这里在旧页 leave 的瞬间把它克隆成一张 fixed 视觉快照,垫到内容层之下
 * (z-index:-1:位于画布背景 body 纸色之上、.app 正常流之下),让列表画面在
 * 文章放大铺满的整个过程中始终留在原位、被文章逐步盖住;动画结束(文章已
 * 以不透明 pageBg 铺满首屏)时再由 ArticleView 同帧移除——几何外露出的
 * 列表随文章铺满而消失,底部露出与动画末帧同色的 body 纸底,无跳变。
 *
 * 退场(参照 iOS 打开 App 的桌面):startGhostRetreat() 让快照以视口中心为
 * 原点整体轻微缩小 + 平滑加模糊,与文章放大动画同步进行——后方内容像被
 * 文章「顶开、推远」,放大与退远互为因果,比静止垫底更有纵深。
 *
 * 坐标系:各视图根(router-view 内容)一律排在 sticky navbar 之后,即从文档
 * y = --nav-height 起排、自身不含导航栏。克隆体 fixed 到视口原点后,用源根
 * 的 getBoundingClientRect() 实测位移对齐「点击瞬间」的画面——比 scrollY 推算
 * 稳:列表无论滚到哪,克隆体 top 就是旧页根此刻相对视口的 top。
 */

let ghostEl = null
let retreatAnim = null

/* 克隆体中会重复执行/自动播放/产生副作用的节点,直接剔除:
   script(单页内视图根本无,防意外)、iframe(会重载)、video/audio/object/embed、
   canvas(重挂载会清空重绘) */
const REMOVE_SELECTOR = 'script, iframe, video, audio, object, embed, canvas'

/* 快照退场的默认参数:缩小程度 / 末端模糊 / 时长与文章放大一致 */
const RETREAT_SCALE = 0.92
const RETREAT_BLUR = 10 /* px */
const RETREAT_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

export function mountFlipGhost(source) {
  removeFlipGhost()

  const el = source.cloneNode(true)
  el.querySelectorAll(REMOVE_SELECTOR).forEach((n) => n.remove())

  /* fixed 容器宽度锁为源宽:内容折行、网格列数与点击瞬间一致(避免 clone 进
     fixed 上下文后宽度漂移导致重排错位) */
  const r = source.getBoundingClientRect()

  Object.assign(el.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: `${Math.ceil(r.width)}px`,
    transform: `translate3d(${Math.ceil(r.left)}px, ${Math.ceil(r.top)}px, 0)`,
    margin: '0',
    zIndex: '-1',
    pointerEvents: 'none',
  })
  el.setAttribute('aria-hidden', 'true')
  /* 不参与 Tab 序与可访问性树 */
  if ('inert' in el) el.inert = true

  document.body.appendChild(el)
  ghostEl = el
}

/* 快照退场:以视口中心为缩放原点整体轻微缩小 + 平滑加模糊。
   必须与文章放大动画同帧启动,且等文章动画完成后随 removeFlipGhost 一起消失;
   用 WAAPI(而非 CSS transition)避免 reflow 触发时序问题,无 inline 残留。
   duration 默认与 ArticleView 放大时长一致。 */
export function startGhostRetreat({ duration = 500 } = {}) {
  if (!ghostEl) return
  if (retreatAnim) retreatAnim.cancel()

  const g = ghostEl
  const base = g.style.transform || 'translate3d(0px, 0px, 0)'
  /* 视口中心作为原点:scale(1) 时 origin 不影响画面,设定后即刻生效,
     缩放围绕「屏幕中心」而非快照内容盒中心(其高度可远大于视口) */
  g.style.transformOrigin = `${Math.round(window.innerWidth / 2)}px ${Math.round(window.innerHeight / 2)}px`

  retreatAnim = g.animate(
    [
      { transform: base, filter: 'blur(0px)' },
      { transform: `${base} scale(${RETREAT_SCALE})`, filter: `blur(${RETREAT_BLUR}px)` },
    ],
    {
      duration,
      easing: RETREAT_EASE,
      fill: 'forwards',
    }
  )
  retreatAnim.finished.catch(() => {})
}

export function removeFlipGhost() {
  if (retreatAnim) {
    retreatAnim.cancel()
    retreatAnim = null
  }
  if (ghostEl) {
    ghostEl.remove()
    ghostEl = null
  }
}
