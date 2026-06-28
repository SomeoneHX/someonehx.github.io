<template>
  <div class="blog">
    <div class="container section">
      <div class="blog__header">
        <template v-if="filterLabel">
          <h1 class="blog__title">{{ filterLabel }}</h1>
          <router-link to="/blog/" class="blog__clear">← 全部文章</router-link>
        </template>
        <template v-else>
          <h1 class="blog__title">文章</h1>
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
  font-size: var(--text-2xl);
  font-weight: 700;
}

.blog__clear {
  display: inline-block;
  margin-top: var(--space-sm);
  font-size: var(--text-sm);
  color: var(--color-gray-500);
  transition: color var(--transition-fast);
}

.blog__clear:hover {
  color: var(--color-gray-900);
}

.blog__empty {
  color: var(--color-gray-400);
  font-size: var(--text-sm);
}
</style>