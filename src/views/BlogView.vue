<template>
  <div class="blog">
    <div class="container section">
      <div class="blog__header">
        <template v-if="filterLabel">
          <h1 class="blog__title">
            <VIcon icon="mdi:tag-outline" width="22" class="blog__title-icon" />
            {{ filterLabel }}
          </h1>
          <router-link to="/blog/" class="blog__clear">
            <VIcon icon="mdi:arrow-left" width="14" class="blog__clear-icon" />
            全部文章
          </router-link>
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
        />
      </div>
      <p v-else class="blog__empty">暂无文章</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ArticleCard from '@/components/ArticleCard.vue'
import data from '@/generated/content.json'

const route = useRoute()

const filterLabel = computed(() => {
  if (route.params.tag) return `标签: ${route.params.tag}`
  if (route.params.category) return `分类: ${route.params.category}`
  if (route.params.series) return `系列: ${route.params.series}`
  return ''
})

const filteredArticles = computed(() => {
  const slugSet = new Set([''])

  if (route.params.tag && data.tagsIndex[route.params.tag]) {
    data.tagsIndex[route.params.tag].forEach(s => slugSet.add(s))
  }
  if (route.params.category && data.categoriesIndex[route.params.category]) {
    data.categoriesIndex[route.params.category].forEach(s => slugSet.add(s))
  }
  if (route.params.series && data.seriesIndex[route.params.series]) {
    data.seriesIndex[route.params.series].forEach(s => slugSet.add(s))
  }

  const hasFilter = route.params.tag || route.params.category || route.params.series
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