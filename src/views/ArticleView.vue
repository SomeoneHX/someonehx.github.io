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

  const finalW = window.innerWidth
  const finalH = window.innerHeight - navHeight
  const dx = rect.left
  const dy = rect.top - navHeight
  const sx = rect.width / finalW
  const sy = rect.height / finalH

  flipStyle.value = {
    transformOrigin: '0 0',
    transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`,
    background: cardBg,
    borderRadius: radiusMd,
    boxShadow: shadowMd,
    overflow: 'hidden',
  }

  const startTransform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`

  onMounted(() => {
    const el = rootRef.value
    if (!el) return

    requestAnimationFrame(() => {
      flipStyle.value = { ...flipStyle.value, boxShadow: undefined }

      const anim = el.animate([
        {
          transform: startTransform,
          borderRadius: radiusMd,
          background: cardBg,
        },
        {
          transform: 'translate(0, 0) scale(1, 1)',
          borderRadius: '0px',
          background: 'transparent',
        },
      ], {
        duration: 500,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      })

      anim.finished.then(() => {
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
