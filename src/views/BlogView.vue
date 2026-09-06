<template>
  <div class="blog">
    <div class="container section">
      <div class="blog__header">
        <template v-if="filterLabel">
          <h1 class="blog__title">
            <VIcon icon="mdi:tag-outline" width="22" class="blog__title-icon" />
            {{ filterLabel }}
          </h1>
          <button class="blog__clear" @click="goBack">
            <VIcon icon="mdi:arrow-left" width="14" class="blog__clear-icon" />
            返回
          </button>
        </template>
        <template v-else>
          <h1 class="blog__title">
            <VIcon icon="mdi:post-outline" width="22" class="blog__title-icon" />
            文章
          </h1>
        </template>
      </div>

      <div v-if="filteredArticles.length" class="grid-2">
        <ArticleCard
          v-for="article in displayedArticles"
          :key="article.slug"
          :article="article"
          @tagClick="goToTag"
          @open="captureView"
        />
      </div>
      <p v-else class="blog__empty">暂无文章</p>

      <button v-if="hasMore" class="blog__load-more" @click="loadMore">
        加载更多
        <VIcon icon="mdi:chevron-down" width="16" class="blog__load-more-icon" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ArticleCard from '@/components/ArticleCard.vue'
import { setFlipView, getFlipCtx } from '@/utils/cardStore'
import { runBackFlip, getActiveMode } from '@/utils/coverMorph'
import data from '@/generated/content.json'

const PAGE_STEP = 6

const route = useRoute()
const router = useRouter()

function goToTag(tag) {
  router.push(`/tags/${tag}/`)
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/tags/')
  }
}

const filterLabel = computed(() => {
  if (route.params.tag) return `标签: ${route.params.tag}`
  return ''
})

/* 全量视图：置顶优先（稳定排序，保留时间倒序的相对顺序）；
   标签筛选视图：保持时间倒序、不做置顶 */
const filteredArticles = computed(() => {
  const tag = route.params.tag
  if (tag && data.tagsIndex[tag]) {
    const slugs = new Set(data.tagsIndex[tag])
    return data.articles.filter(a => slugs.has(a.slug))
  }
  return [...data.articles].sort((a, b) => Number(b.pinned) - Number(a.pinned))
})

const visibleCount = ref(PAGE_STEP)
const displayedArticles = computed(() => filteredArticles.value.slice(0, visibleCount.value))
const hasMore = computed(() => visibleCount.value < filteredArticles.value.length)

function loadMore() {
  visibleCount.value += PAGE_STEP
}

/* 切换标签时重置分页进度 */
watch(
  () => route.params.tag,
  () => {
    visibleCount.value = PAGE_STEP
  }
)

/* 卡片点击跳转前补记本列表视图状态（展开篇数），返回收拢时恢复 */
function captureView() {
  setFlipView({ visibleCount: visibleCount.value })
}

const waitFrames = (n = 1) =>
  new Promise((r) => {
    let left = n
    const tick = () => (--left <= 0 ? r() : requestAnimationFrame(tick))
    requestAnimationFrame(tick)
  })

/* 反向收拢：文章页 leave 时把视口画面做成快照窗，本页挂载后静置于窗下；
   恢复分页与滚动，让来源卡片回到点击时的位置，再把快照窗收拢进卡片。
   判定依据：本次过渡确为反向（getActiveMode==='back'）且目标路径就是
   该快照的来源路径（防止普通导航误触发恢复/收拢） */
onMounted(async () => {
  const ctx = getFlipCtx()
  if (!ctx || route.fullPath !== ctx.from || getActiveMode() !== 'back') return

  /* 先恢复分页（比 PAGE_STEP 多时需要多渲染几行） */
  if (ctx.view && typeof ctx.view.visibleCount === 'number' && ctx.view.visibleCount > PAGE_STEP) {
    visibleCount.value = ctx.view.visibleCount
  }
  await nextTick()

  /* 恢复来源滚动位置：ctx.coverRect 是点击时的视口坐标，滚动一致才能对齐 */
  const scroller = document.scrollingElement || document.documentElement
  scroller.scrollTop = ctx.scrollY || 0

  /* 静置两帧让恢复后的列表稳定（快照窗此时仍盖住屏幕，无可见跳变） */
  await waitFrames(2)

  /* 收拢进整张卡片（cardRect）——文章画面缩回卡片外框整体；
     无 cardRect 时退回收进封面条 */
  runBackFlip(ctx.cardRect || ctx.coverRect)
})
</script>

<style scoped>
.blog__header {
  margin-bottom: var(--space-xl);
}

.blog__title {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--text-2xl);
  font-weight: 700;
}

.blog__title-icon {
  flex-shrink: 0;
  color: var(--color-accent);
}

.blog__clear {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font: inherit;
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  margin-top: var(--space-sm);
  font-size: var(--text-sm);
  color: var(--color-gray-500);
  transition: color var(--transition-fast);
}

.blog__clear:hover {
  color: var(--color-accent);
}

.blog__clear-icon {
  flex-shrink: 0;
}

.blog__empty {
  color: var(--color-gray-400);
  font-size: var(--text-sm);
}

.blog__load-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  margin: var(--space-2xl) auto 0;
  padding: var(--space-sm) var(--space-xl);
  font-size: var(--text-sm);
  color: var(--color-gray-600);
  background: none;
  border: 1px solid var(--color-gray-200);
  border-radius: 999px;
  cursor: pointer;
  transition: border-color var(--transition-fast),
              color var(--transition-fast),
              background var(--transition-fast);
}

.blog__load-more:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: var(--color-accent-light);
}

.blog__load-more-icon {
  flex-shrink: 0;
  transition: transform var(--transition-fast);
}

.blog__load-more:hover .blog__load-more-icon {
  transform: translateY(2px);
}
</style>
