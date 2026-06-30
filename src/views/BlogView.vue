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
            {{ route.params.tag ? '全部标签' : route.params.series ? '全部文章' : '返回' }}
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
          v-for="article in filteredArticles"
          :key="article.slug"
          :article="article"
          @tagClick="goToTag"
        />
      </div>
      <p v-else class="blog__empty">暂无文章</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ArticleCard from '@/components/ArticleCard.vue'
import data from '@/generated/content.json'

const route = useRoute()
const router = useRouter()

function goToTag(tag) {
  router.push(`/tags/${tag}/`)
}

function goBack() {
  const fallback = route.params.tag ? '/tags/' : '/blog/'
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push(fallback)
  }
}

const filterLabel = computed(() => {
  if (route.params.tag) return `标签: ${route.params.tag}`
  if (route.params.series) return `系列: ${route.params.series}`
  return ''
})

const filteredArticles = computed(() => {
  const slugSet = new Set([''])

  if (route.params.tag && data.tagsIndex[route.params.tag]) {
    data.tagsIndex[route.params.tag].forEach(s => slugSet.add(s))
  }
  if (route.params.series && data.seriesIndex[route.params.series]) {
    data.seriesIndex[route.params.series].forEach(s => slugSet.add(s))
  }

  const hasFilter = route.params.tag || route.params.series
  if (hasFilter) {
    return data.articles.filter(a => slugSet.has(a.slug))
  }
  return data.articles
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
</style>