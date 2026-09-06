<template>
  <article ref="rootRef" class="article" :style="flipStyle">
    <div
      class="article__progress"
      :style="{ width: `${progress}%` }"
      aria-hidden="true"
    />
    <template v-if="!article">
      <div class="container">
        <p class="article__not-found">文章未找到</p>
      </div>
    </template>
    <template v-else>
      <header class="article__header" :class="{ 'article__header--hero': article.cover }">
        <div v-if="article.cover" class="article__header-bg">
          <img :src="article.cover" alt="" class="article__header-bg-img" />
          <div class="article__header-overlay" />
        </div>
        <div class="article__header-inner">
          <div class="container">
            <button class="article__back" @click="goBack">
              <VIcon icon="mdi:arrow-left" width="14" />
              返回
            </button>
            <h1 class="article__title">{{ article.title }}</h1>
            <div class="article__meta">
              <time v-if="article.date" :datetime="article.date">
                <VIcon icon="mdi:calendar-outline" width="14" class="article__meta-icon" />
                {{ formatDate(article.date) }}
              </time>
              <span v-if="article.wordCount" class="article__meta-item">
                <VIcon icon="mdi:text-box-outline" width="14" class="article__meta-icon" />
                {{ article.wordCount }} 字
              </span>
              <span class="article__meta-item">
                <VIcon icon="mdi:clock-outline" width="14" class="article__meta-icon" />
                约 {{ article.readingMinutes }} 分钟
              </span>
            </div>
            <div v-if="article.tags.length" class="article__tags">
              <router-link
                v-for="tag in article.tags"
                :key="tag"
                :to="`/tags/${tag}/`"
                class="article__tag"
              >{{ tag }}</router-link>
            </div>
            <div v-if="article.links.length" class="article__links">
              <a
                v-for="link in article.links"
                :key="link.url"
                :href="link.url"
                target="_blank"
                rel="noopener noreferrer"
                class="article__visit-btn"
              >
                <VIcon icon="mdi:open-in-new" width="16" />
                {{ link.label }}
              </a>
            </div>
          </div>
        </div>
      </header>

      <div class="article__body-wrapper">
        <div class="article__body-layout">
          <div class="article__body-main">
            <DynamicContent
              :markdown="article.markdown"
              class="article__body"
              @rendered="headings = $event"
            />
          </div>
          <aside v-if="headings.length" class="article__toc-col">
            <ArticleToc :headings="headings" />
          </aside>
        </div>

        <div class="container">
          <section v-if="related.length" class="article__related">
            <h2 class="article__block-heading">
              <VIcon icon="mdi:creation-outline" width="15" class="article__block-heading-icon" />
              相关文章
            </h2>
            <div class="article__related-list">
              <router-link
                v-for="item in related"
                :key="item.slug"
                :to="`/blog/${item.slug}/`"
                class="article__related-item"
              >
                <span class="article__related-title">{{ item.title }}</span>
                <span class="article__related-meta">
                  {{ formatDate(item.date) }}
                  <template v-if="item.readingMinutes"> · 约 {{ item.readingMinutes }} 分钟</template>
                </span>
              </router-link>
            </div>
          </section>

          <nav v-if="prevArticle || nextArticle" class="article__pager">
            <router-link
              v-if="prevArticle"
              :to="`/blog/${prevArticle.slug}/`"
              class="article__pager-link"
            >
              <span class="article__pager-label">
                <VIcon icon="mdi:arrow-left" width="14" class="article__pager-icon" />
                上一篇
              </span>
              <span class="article__pager-title">{{ prevArticle.title }}</span>
            </router-link>
            <span v-else class="article__pager-spacer" />
            <router-link
              v-if="nextArticle"
              :to="`/blog/${nextArticle.slug}/`"
              class="article__pager-link article__pager-link--next"
            >
              <span class="article__pager-label">
                下一篇
                <VIcon icon="mdi:arrow-right" width="14" class="article__pager-icon" />
              </span>
              <span class="article__pager-title">{{ nextArticle.title }}</span>
            </router-link>
            <span v-else class="article__pager-spacer" />
          </nav>

          <ClientOnly>
            <GiscusView :term="route.path" />
          </ClientOnly>
        </div>
      </div>
    </template>

    <button
      class="article__backtop"
      v-show="showBackTop"
      @click="scrollToTop"
      title="回到顶部"
      aria-label="回到顶部"
    >
      <VIcon icon="mdi:chevron-up" width="20" />
    </button>
  </article>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DynamicContent from '@/components/DynamicContent.vue'
import GiscusView from '@/components/GiscusView.vue'
import ArticleToc from '@/components/ArticleToc.vue'
import { takeCardRect } from '@/utils/cardStore'
import { removeFlipGhost, startGhostRetreat } from '@/utils/flipGhost'
import data from '@/generated/content.json'

const route = useRoute()
const router = useRouter()
const rootRef = ref(null)
const flipStyle = ref(null)
const headings = ref([])
const rect = takeCardRect()

if (rect) {
  const scrollingElement = document.scrollingElement || document.documentElement
  scrollingElement.scrollTop = 0
  scrollingElement.scrollLeft = 0
  document.body.scrollTop = 0
  document.body.scrollLeft = 0
  document.documentElement.scrollTop = 0
  document.documentElement.scrollLeft = 0

  const computedStyle = getComputedStyle(document.documentElement)
  const navHeight = parseFloat(computedStyle.getPropertyValue('--nav-height')) || 56
  const radiusMd = computedStyle.getPropertyValue('--radius-md').trim() || '12px'
  const cardBg = computedStyle.getPropertyValue('--color-card-bg').trim() || '#ffffff'
  const shadowMd = computedStyle.getPropertyValue('--shadow-md').trim() || '0 4px 16px rgba(0, 0, 0, 0.08)'
  /* 页面纸底:动画全程用作文章自身不透明背景——旧列表垫底快照在其几何外
     露出、几何内绝不透出叠影;结束移除快照后文章背景转透明,透出的 body
     底色与动画末帧同色,零跳变 */
  const pageBg = computedStyle.getPropertyValue('--color-bg-warm').trim() || '#fefcf5'

  const finalW = window.innerWidth
  const finalH = window.innerHeight - navHeight
  const dx = rect.left
  const dy = rect.top - navHeight
  /* 缩放系数仅由「宽度」决定(单一等比,不压扁):整体大小随宽度走,
     形状始终真实——窗口视觉宽从卡片宽 → 文章宽 */
  const s0 = rect.width / finalW
  /* 裁切窗口的视觉高:起点 = 文章卡片高,随动画展开到首屏高 */
  const winH0 = rect.height
  /* 文章放大时长(WAAPI 与垫底快照退场共用单一来源) */
  const FLIP_MS = 500
  /* 圆角数值基准(px):文章卡片 border-radius = --radius-md(12px) */
  const R0 = parseFloat(radiusMd) || 0
  /* 圆角独立动画的分段数:段内 border-radius 线性插值而 scale 走缓动曲线,
     段数太少会在开头段产生 ~1px 鼓包;24 段把段内偏差压到 0.3px 内 */
  const RADIUS_SEGMENTS = 24
  /* 数值求解 cubic-bezier(0.22, 1, 0.36, 1) 的 y(x):即主变换动画在时间 x
     处的进度 f(二分反解 bezier 参数),供圆角关键帧按真实时间轴排布 */
  const bezierY = (p1x, p1y, p2x, p2y, x) => {
    let lo = 0
    let hi = 1
    for (let k = 0; k < 24; k++) {
      const m = (lo + hi) / 2
      const om = 1 - m
      const bx = 3 * om * om * m * p1x + 3 * om * m * m * p2x + m * m * m
      if (bx < x) lo = m
      else hi = m
    }
    const t = (lo + hi) / 2
    const om = 1 - t
    return 3 * om * om * t * p1y + 3 * om * t * t * p2y + t * t * t
  }

  /* FLIP 几何:内容按宽度等比缩放(s0→1),高度不参与缩放、而是被「窗口」
     裁切——布局高 = 窗口视觉高 / 当前缩放(缩放让视觉尺寸 = 布局 × scale)。
     窗口视觉高从卡片高展开到首屏高:起点即「高裁成卡片、宽定整体大小」的
     迷你文章(无压扁变形),放大过程裁切线始终贴窗口下缘;
     动画结束 flipStyle 清空时盒高恢复全文、文档恢复滚动,顶部无跳变。 */
  flipStyle.value = {
    transformOrigin: '0 0',
    transform: `translate(${dx}px, ${dy}px) scale(${s0})`,
    background: cardBg,
    /* 圆角补偿缩放:布局圆角 = R0 / s0,乘上当前 scale(s0) 后视觉恰为卡片圆角
       R0(12px)—— 首帧与卡片圆角无缝衔接;动画期间由独立 radiusAnim 接管 */
    borderRadius: R0 > 0 ? `${R0 / s0}px` : radiusMd,
    boxShadow: shadowMd,
    overflow: 'hidden',
    height: `${Math.ceil(winH0 / s0)}px`,
  }

  const startTransform = `translate(${dx}px, ${dy}px) scale(${s0})`

  onMounted(() => {
    const el = rootRef.value
    if (!el) return

    requestAnimationFrame(() => {
      flipStyle.value = { ...flipStyle.value, boxShadow: undefined }

      /* 同帧让垫底列表退场(整体轻微缩小 + 逐渐模糊),与文章放大互为纵深 */
      startGhostRetreat({ duration: FLIP_MS })

      const anim = el.animate([
        {
          /* 圆角不放这里插值:transform 缩放会连带缩放 CSS 圆角,若随主曲线线性
             插值(CSS 坐标 R0→0),首帧视觉圆角 = R0×s0 ≪ 卡片圆角、几乎全程
             直角。圆角改由下方独立 radiusAnim 按「视觉圆角平滑收直」驱动 */
          transform: startTransform,
          background: cardBg,
        },
        {
          transform: 'translate(0, 0) scale(1)',
          /* 不透明收尾(非 transparent):动画全程自带纸底,垫底列表只在文章
             几何外可见,铺满瞬间列表恰好被完全盖住,移除快照无感知 */
          background: pageBg,
        },
      ], {
        duration: FLIP_MS,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      })

      /* 圆角独立动画:让「视觉圆角」从卡片圆角 R0 平滑单调收至直角 0,而非
         CSS 圆角线性衰减(那样视觉上会被 scale 压成全程近直角)。
         关键帧沿时间轴取 N 等分点:先按主变换 easing 反解该时刻进度 f,再令
         border-radius = R0·(1-f)/scale(f) —— 恰好抵消缩放,视觉圆角全程
         ≈ R0·(1-f) 线性衰减(段内线性近似,误差亚像素)。与主动画同刻创建、
         同 duration,结束与慢动作 playbackRate 天然同步 */
      el.animate(
        Array.from({ length: RADIUS_SEGMENTS + 1 }, (_, i) => {
          const t = i / RADIUS_SEGMENTS
          const f = bezierY(0.22, 1, 0.36, 1, t)
          const s = s0 + (1 - s0) * f
          return {
            offset: t,
            easing: 'linear',
            borderRadius: `${((R0 * (1 - f)) / s).toFixed(3)}px`,
          }
        }),
        { duration: FLIP_MS, easing: 'linear' }
      )

      /* 高度窗口与 transform 共用同一条(已缓动的)进度:每帧读动画进度,
         布局高 = 窗口视觉高 / 当前缩放,裁切线贴紧窗口下缘,无压扁无溢出。
         直接写 DOM style(避免每帧触发 Vue re-render),结束统一清理 */
      let rafId = 0
      const applyWindow = (q) => {
        const s = s0 + (1 - s0) * q
        const winH = winH0 + (finalH - winH0) * q
        el.style.height = `${winH / s}px`
      }
      const tick = () => {
        rafId = 0
        const timing = anim.effect?.getComputedTiming?.()
        const q = timing ? timing.progress : null
        if (q == null) return /* 动画被取消(组件卸载),停止跟随 */
        if (q >= 1) {
          applyWindow(1)
          return
        }
        applyWindow(q)
        rafId = requestAnimationFrame(tick)
      }
      rafId = requestAnimationFrame(tick)

      anim.finished
        .catch(() => {})
        .then(() => {
          /* 同 tick:先摘掉垫底快照(此刻文章仍是不透明 pageBg 铺满首屏),
             再解除 transform/height/overflow —— 中间无绘制帧,文章背景
             转透明透出的 body 纸底与 pageBg 同色,恢复全文高度与滚动 */
          removeFlipGhost()
          if (rafId) cancelAnimationFrame(rafId)
          el.style.height = ''
          flipStyle.value = null
        })
    })
  })
}

const article = computed(() =>
  data.articles.find(a => a.slug === route.params.slug) || null
)

/* 时间倒序列表中相邻一篇 = 上一篇（更新），下一篇（更旧） */
const prevArticle = computed(() => {
  const i = data.articles.findIndex(a => a.slug === route.params.slug)
  return i > 0 ? data.articles[i - 1] : null
})

const nextArticle = computed(() => {
  const i = data.articles.findIndex(a => a.slug === route.params.slug)
  return i >= 0 && i < data.articles.length - 1 ? data.articles[i + 1] : null
})

/* 相关文章：按共同标签数排序，取最多 3 篇 */
const related = computed(() => {
  const cur = article.value
  if (!cur || !cur.tags.length) return []
  const tagSet = new Set(cur.tags)
  return data.articles
    .filter(a => a.slug !== cur.slug && a.tags.some(t => tagSet.has(t)))
    .map(a => ({
      article: a,
      score: a.tags.filter(t => tagSet.has(t)).length,
    }))
    .sort((x, y) => y.score - x.score || new Date(y.article.date) - new Date(x.article.date))
    .slice(0, 3)
    .map(x => x.article)
})

/* 阅读进度条 + 回到顶部 */
const progress = ref(0)
const showBackTop = ref(false)

function onScroll() {
  const scroller = document.scrollingElement || document.documentElement
  const max = scroller.scrollHeight - scroller.clientHeight
  progress.value = max > 0 ? Math.min(100, (scroller.scrollTop / max) * 100) : 0
  showBackTop.value = scroller.scrollTop > 600
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
})

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/blog/')
  }
}
</script>

<style scoped>
.article__progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: var(--color-accent);
  z-index: 120;
  pointer-events: none;
  transition: width 0.1s linear;
}

.article__header {
  padding: var(--space-xl) 0 var(--space-xl);
  border-bottom: 1px solid var(--color-gray-200);
  margin-bottom: var(--space-xl);
}

.article__header--hero {
  position: relative;
  border-bottom: none;
  border-radius: 0;
  overflow: hidden;
  padding: 0;
}

.article__header-bg {
  position: absolute;
  inset: 0;
}

.article__header-bg-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.45) blur(6px);
  transform: scale(1.1);
}

.article__header-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.6));
}

.article__header-inner {
  position: relative;
  z-index: 1;
}

.article__header--hero .article__header-inner {
  padding: var(--space-lg) 0;
}

.article__back {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  margin-bottom: var(--space-sm);
  font-size: var(--text-sm);
  color: var(--color-gray-500);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: color var(--transition-fast);
}

.article__header--hero .article__back {
  color: rgba(255, 255, 255, 0.7);
}

.article__back:hover {
  color: var(--color-accent);
}

.article__header--hero .article__back:hover {
  color: #fff;
}

.article__title {
  font-size: var(--text-3xl);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.03em;
  margin-bottom: var(--space-xs);
}

.article__header--hero .article__title {
  color: #fff;
}

.article__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-md);
  font-size: var(--text-sm);
  color: var(--color-gray-500);
  margin-bottom: var(--space-xs);
}

.article__header--hero .article__meta {
  color: rgba(255, 255, 255, 0.65);
}

.article__meta time,
.article__meta-item {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
}

.article__meta-icon {
  flex-shrink: 0;
}

.article__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.article__tag {
  font-size: var(--text-xs);
  padding: 3px 10px;
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-sm);
  color: var(--color-gray-600);
  transition: border-color var(--transition-fast),
              color var(--transition-fast),
              background var(--transition-fast);
}

.article__header--hero .article__tag {
  border-color: rgba(255, 255, 255, 0.35);
  color: rgba(255, 255, 255, 0.85);
}

.article__tag:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: var(--color-accent-light);
}

.article__header--hero .article__tag:hover {
  border-color: #fff;
  color: #fff;
  background: rgba(255, 255, 255, 0.15);
}

.article__not-found {
  padding: var(--space-3xl) 0;
  color: var(--color-gray-400);
  text-align: center;
}

.article__links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  margin-top: var(--space-md);
}

.article__visit-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-lg);
  background: var(--color-accent);
  color: #fff;
  font-size: var(--text-sm);
  border-radius: var(--radius-sm);
  transition: opacity var(--transition-fast);
}

.article__visit-btn:hover {
  opacity: 0.85;
  color: #fff;
}

.article__body-wrapper {
  width: 100%;
}

.article__body-layout {
  display: flex;
  gap: var(--space-xl);
  max-width: 960px;
  margin: 0 auto;
  padding: 0 var(--space-md);
  justify-content: center;
  align-items: flex-start;
}

.article__body-main {
  flex: 1;
  min-width: 0;
  max-width: 720px;
}

.article__toc-col {
  display: none;
  width: 200px;
  flex-shrink: 0;
  padding-top: var(--space-xs);
  position: sticky;
  top: calc(var(--nav-height) + 24px);
  max-height: calc(100vh - var(--nav-height) - 48px);
  overflow-y: auto;
}

@media (min-width: 1024px) {
  .article__toc-col {
    display: block;
  }
}

/* 相关文章 */
.article__block-heading {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-gray-400);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: var(--space-lg);
}

.article__block-heading-icon {
  flex-shrink: 0;
  color: var(--color-accent);
}

.article__related {
  margin-top: var(--space-2xl);
  border-top: 1px solid var(--color-gray-200);
  padding-top: var(--space-2xl);
}

.article__related-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--space-md);
}

.article__related-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  border: 1px solid var(--color-gray-100);
  border-radius: var(--radius-md);
  background: var(--color-card-bg);
  padding: var(--space-md) var(--space-lg);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-base),
              border-color var(--transition-base),
              transform var(--transition-base);
}

.article__related-item:hover {
  border-color: var(--color-accent-light);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.article__related-title {
  font-size: var(--text-base);
  font-weight: 600;
  line-height: 1.35;
}

.article__related-meta {
  font-size: var(--text-xs);
  color: var(--color-gray-400);
}

/* 上/下一篇 */
.article__pager {
  display: flex;
  justify-content: space-between;
  gap: var(--space-lg);
  margin-top: var(--space-2xl);
  border-top: 1px solid var(--color-gray-200);
  padding-top: var(--space-lg);
}

.article__pager-link {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  padding: var(--space-sm) 0;
}

.article__pager-link--next {
  text-align: right;
  align-items: flex-end;
}

.article__pager-label {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--text-sm);
  color: var(--color-gray-400);
  transition: color var(--transition-fast);
}

.article__pager-link:hover .article__pager-label {
  color: var(--color-accent);
}

.article__pager-title {
  font-size: var(--text-base);
  font-weight: 600;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.article__pager-spacer {
  flex: 1;
}

/* 回到顶部 */
.article__backtop {
  position: fixed;
  right: 20px;
  bottom: 24px;
  z-index: 110;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--color-gray-200);
  background: var(--color-surface);
  color: var(--color-gray-600);
  box-shadow: var(--shadow-md);
  cursor: pointer;
  transition: color var(--transition-fast),
              border-color var(--transition-fast),
              transform var(--transition-fast);
}

.article__backtop:hover {
  color: var(--color-accent);
  border-color: var(--color-accent);
  transform: translateY(-2px);
}
</style>
