/* 「卡片 → 文章」过渡的来源上下文
 *
 * 一次「卡片 → 文章」的来源记录。正向（列表 → 文章）由卡片点击写入；
 * 反向（文章 → 来源列表）持久读取，用于把文章画面收拢回原卡片。
 *
 * 状态机：
 *   - ctx：最近一次封面卡片的来源信息
 *     { coverRect, cardRect, cover, from, scrollY, view, el }，持久保留，
 *     直到下一次封面卡片点击覆盖。从文章链式跳转其他文章不清空——
 *     返回链上任一环回到来源列表都能正确收拢。
 *     coverRect：卡片封面条（含顶部圆角裁切）的视口 rect；
 *     cardRect：整张卡片（封面条 + 卡身文字区）的视口 rect；
 *     正向整页放大与反向收拢都锚定 cardRect（互为镜像）。
 *     el：被点卡片元素引用，仅正向 leave 时由整卡层消费（clone 整张卡片：
 *     封面 + 渐变 + 标题 + 卡身文字，全部随卡片一起放大），消费后置
 *     null 释放，不持久持有。
 *   - fresh：ctx 是否来自「刚发生的封面卡片点击」。正向过渡只在该瞬间成立；
 *     进入文章后被消费复位，相关文章/直达等非卡片进入不会误判。
 */

let ctx = null
let fresh = false

/**
 * 点击带封面的卡片时调用（ArticleCard）。
 * @param {object} source
 * @param {{left:number,top:number,width:number,height:number}} source.coverRect
 *   封面视觉区（含顶部圆角裁切）的视口几何
 * @param {string} source.cover 封面图 URL（与文章 hero 同源）
 * @param {string} source.from 来源路由 fullPath（列表页自身）
 */
export function saveFlipSource(source) {
  ctx = { ...source, scrollY: window.scrollY || 0 }
  fresh = true
}

/** 列表页在点击卡片瞬间补记自身视图状态（展开数等），供返回时恢复 */
export function setFlipView(view) {
  if (fresh && ctx) ctx.view = view
}

/** 只探测「刚发生封面卡片点击」：路由守卫判定正向 FLIP（不消费） */
export function peekFlipSource() {
  return fresh ? ctx : null
}

/** 进入文章时消费 fresh：是封面 FLIP 进入则返回 ctx 并复位 fresh，否则 null */
export function consumeFlipSource() {
  if (fresh && ctx) {
    fresh = false
    return ctx
  }
  return null
}

/** 读取持久来源上下文（返回收拢用；不消费） */
export function getFlipCtx() {
  return ctx
}

/* ---------- 当前文章来源（反向收拢的判定依据） ----------
 * ctx 会跨导航持久存在（链式跳转其他文章也不清空），因此不能用「ctx 还在」
 * 判定反向——必须记录「当前这篇 Article 是被哪一次封面 FLIP 打开的」。
 * 只有从该来源页返回时才做收拢动画；搜索直达/相关文章跳转等普通进入会
 * 把 origin 清空，返回走普通卷帘。 */
let originFrom = null

/** 标记当前文章页的来源列表路径（普通进入/离开文章时传 null 清除） */
export function markArticleOrigin(from) {
  originFrom = from || null
}

/** 当前文章页的来源列表路径（无则 null） */
export function getArticleOrigin() {
  return originFrom
}
