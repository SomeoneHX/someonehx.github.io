/* 页面切换动画（非 FLIP 导航时使用）
 *
 * 视觉：旧页淡出 → 新页内容按「行」自上而下逐行落位。
 * 单个元素（标题/段落/卡片）以「缩小 + 偏上 + 透明 + 轻模糊」为初态，
 * 淡入并放大回自然位置、模糊归零——每个元素以自身矩形中心为原点放大，
 * 观感是从中心向外放大聚焦（纯 transform/opacity/filter，不改变布局）。
 * 同一水平行的元素（如网格中的一行卡片、相邻的单栏块）同时落位，
 * 行与行自上而下级联——观感是一行一行落下，而不是逐组件左→右扫。
 *
 * 时序安全：先把整页 opacity:0（本帧内不会画出完整页面）→ 静置数帧
 * 等异步正文（DynamicContent）落地 → 量一次位置并按行分组 → 同帧统一
 * 排程并恢复可见（finally 中必定恢复）。行都在首屏内，无需总时长预算。
 *
 * 节拍自适应：首屏「行」多（如长文章正文）时在总时长预算内压缩行间隔
 * 与单元素时长，避免一屏几十行线性拖到尾显得拖泥带水；行少时保持默认
 * 舒展节奏（详见 pace()）。
 *
 * 全 WAAPI：精确时序、可条件跳过（FLIP / 减弱动效）、结束后无 inline 残留。
 */

const POP_MS = 380        /* 单元素落位时长（默认，行少时） */
const ROW_GAP_MS = 150    /* 行与行之间的起始间隔（默认） */
const ROW_TOL = 44        /* 判定「同一行」的纵向容差（按块顶，px） */
const FROM_SCALE = 0.9    /* 初态缩放（缩小） */
const FROM_Y = -16        /* 初态上移（偏上），px */
const FROM_BLUR = 4       /* 初态模糊半径（px）：从轻微模糊聚焦到清晰，0 关闭 */
const TOTAL_BUDGET = 800  /* 首屏所有行落完的总时长预算（ms），行多时收紧至此 */
const POP_MIN = 180       /* 行多时单元素时长的下限 */
const GAP_MIN = 20        /* 行多时行间隔的下限 */

/**
 * 按首屏行数给出 (pop, gap)：让总时长 ≈ (N-1)*gap + pop
 * 不超 TOTAL_BUDGET；行少则回落默认值。
 */
function pace(rowCount) {
  if (rowCount <= 1) return { pop: POP_MS, gap: 0 }
  const gap = Math.min(
    ROW_GAP_MS,
    Math.max(GAP_MIN, (TOTAL_BUDGET - POP_MIN) / (rowCount - 1))
  )
  const pop = Math.min(
    POP_MS,
    Math.max(POP_MIN, TOTAL_BUDGET - gap * (rowCount - 1))
  )
  return { pop, gap }
}

/* 落位候选分层：
   - 文本/内容块：标题、段落、列表项、引用、表格（正文语义块）
   - 交互元素：a、button —— 独立浮出的链接/胶囊/按钮参与动画（标签胶囊、
     技能标签、联系链接、加载更多、返回按钮、看更多等）；而严格嵌套在
     候选父块里的（正文段落内的链接、li 内的条目链接、卡片内标签）由
     外层块统一动画，靠下方 collectBlocks 的后代抑制跳过，不会重复弹跳
   - 实体容器：.card / .code-block / .article__back 等有盒子感的整块；
     .article__meta 整行动画（内部 time/span 不单独动）
   - 纯装饰/小控件：span / time / img / icon / 圆点等不单独动画
   尺寸为 0、不可见、在首屏之外的候选自动被过滤（见 collectBlocks）。 */
const BLOCK_SELECTOR = [
  'h1', 'h2', 'h3', 'h4',
  'p', 'li', 'blockquote', 'table',
  'a', 'button',
  '.card', '.code-block',
  '.article__meta',
  '.article__related-item',
  '.article__pager-link',
  '.article__back',
  '.article-toc__title',
  '.about__avatar', '.about__tag', '.about__link', '.about__timeline-item',
].join(',')

/* 这些容器「自身」是整块动画单元（卡片、相关文章、上下篇、代码块、经历条目），
   严格嵌套在内的子元素交给父块，不单独弹跳。
   注意：不在其中的 .article__tags / .article__links / .article__toc-col /
   .footnotes 内部的独立胶囊与条目（tag / 外链 / 目录项 / 脚注行）会放行，
   逐个参与按行动画——若想让某区域整体静默，把它的容器加回本列表即可。 */
const SKIP_INSIDE =
  '.card, .article__related-item, .article__pager-link, .code-block, ' +
  '.about__timeline-item'

const reducedMotion = () =>
  typeof window !== 'undefined' &&
  !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const waitFrames = (n = 1) =>
  new Promise((r) => {
    let left = n
    const tick = () => (--left <= 0 ? r() : requestAnimationFrame(tick))
    requestAnimationFrame(tick)
  })

/* ---------- 路由过渡层回调 ---------- */

/** 旧页淡出（170ms），resolve 后可调用 done() */
export function leaveFade(el) {
  if (reducedMotion() || !el || typeof el.animate !== 'function') return Promise.resolve()
  return el
    .animate([{ opacity: 1 }, { opacity: 0 }], { duration: 170, easing: 'ease' })
    .finished.catch(() => {})
}

/**
 * 新页进入：内容按行自上而下「缩小偏上 → 淡入放大归位」。
 * resolve 表示首屏所有行的落位动画结束。
 */
export async function pageEnter(el) {
  /* 新页从顶部开始展示（减弱动效时同样滚顶，只是不播动画） */
  window.scrollTo(0, 0)

  if (reducedMotion()) return

  /* 同步隐藏整页：本帧内绝不让完整页面闪出（finally 中必定恢复可见） */
  el.style.opacity = '0'

  const anims = []
  try {
    const isArticle = el.classList.contains('article')

    /* 先静置几帧，等异步正文（DynamicContent 渲染 markdown）落地 */
    await waitFrames(isArticle ? 5 : 2)

    const rows = collectRows(el)

    /* 按首屏行数自动估算节拍（行多收紧、行少舒展） */
    const { pop, gap } = pace(rows.length)

    /* 行级联排程：同一行同时落位，行与行自上而下错峰 */
    let t = 0
    for (const row of rows) {
      for (const item of row) {
        const anim = item.node.animate(
          [
            {
              opacity: 0,
              transform: `translateY(${FROM_Y}px) scale(${FROM_SCALE})`,
              filter: `blur(${FROM_BLUR}px)`,
            },
            {
              opacity: 1,
              transform: 'translateY(0) scale(1)',
              filter: 'blur(0)',
            },
          ],
          {
            duration: pop,
            delay: t,
            /* backwards：延迟期保持初态（透明、缩小偏上），结束后无 inline 残留 */
            fill: 'backwards',
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          }
        )
        anim.finished.catch(() => {})
        anims.push(anim)
      }
      t += gap
    }
  } finally {
    /* 首帧加载保护解锁：直达/刷新/首次进入时 .app__main 初始 opacity:0
       （见 global.css），防预渲染内容先闪现。排程后同帧放行——此刻各块
       已因 fill:backwards 处于透明初态，放行不会闪出完整页面 */
    const gate = document.querySelector('.app__main')
    if (gate && !gate.classList.contains('pg-revealed')) {
      gate.classList.add('pg-revealed')
    }
    /* 恢复整页可见（各块自身由 fill:backwards 保持初态至各自开始） */
    el.style.opacity = ''
  }

  if (!anims.length) return
  try {
    await Promise.all(anims.map((a) => a.finished))
  } catch {
    /* 动画被中断（快速连续导航导致取消）时静默收尾 */
  }
}

/* ---------- 候选块收集与按行分组 ---------- */

/** 收集首屏内应落位的块（带视口位置），按 (top, left) 排序 */
function collectBlocks(root) {
  const scope = root.querySelector('.container.section') || root
  const vh = window.innerHeight || 800

  const out = []
  for (const node of scope.querySelectorAll(BLOCK_SELECTOR)) {
    /* 严格嵌套在整块容器内的子元素交给父块，跳过（容器自身允许） */
    const wrap = node.closest(SKIP_INSIDE)
    if (wrap && wrap !== node) continue
    const r = node.getBoundingClientRect()
    if (!r.height) continue
    if (r.top < -r.height || r.top >= vh * 0.95) continue /* 只取首屏内 */
    if (out.some((p) => p.node.contains(node))) continue /* 后代抑制 */

    out.push({ node, top: r.top, left: r.left })
  }

  out.sort((a, b) => a.top - b.top || a.left - b.left)
  return out
}

/**
 * 把候选块聚成「行」：块顶相差在 ROW_TOL 内视为同一水平行。
 * 网格的一行卡片块顶相同 → 同一行；单栏文本块顶依次拉开 → 各成一行。
 */
function collectRows(root) {
  const blocks = collectBlocks(root)
  const rows = []

  for (const b of blocks) {
    const last = rows[rows.length - 1]
    if (last && b.top - last.anchorTop <= ROW_TOL) {
      last.push(b)
    } else {
      const row = [b]
      row.anchorTop = b.top
      rows.push(row)
    }
  }
  return rows
}
