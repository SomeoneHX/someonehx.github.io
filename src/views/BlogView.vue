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

      <div v-if="filteredArticles.length" ref="gridEl" class="grid-2">
        <ArticleCard
          v-for="article in displayedArticles"
          :key="article.slug"
          :article="article"
          @tagClick="goToTag"
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
import { ref, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ArticleCard from '@/components/ArticleCard.vue'
import { revealNodes } from '@/utils/pageTransition'
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

/* 卡片网格容器（用于定位本次新增的卡片节点） */
const gridEl = ref(null)

async function loadMore() {
  /* 记住旧截断点：新批次卡片 = 渲染完成后网格里从该下标往后的节点 */
  const from = visibleCount.value
  visibleCount.value += PAGE_STEP

  /* 等 Vue 把新卡片渲染进 DOM；此后的微任务在浏览器绘制前继续，
     新卡片不会以完整可见状态被画出来 */
  await nextTick()

  const grid = gridEl.value
  if (!grid) return
  /* 新卡片播放与页面入场同款的「逐行落位」动画（减弱动效时内部自动放行） */
  revealNodes([...grid.children].slice(from))
}

/* 切换标签时重置分页进度 */
watch(
  () => route.params.tag,
  () => {
    visibleCount.value = PAGE_STEP
  }
)
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
