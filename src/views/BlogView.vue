<template>
  <div class="blog">
    <div class="container section">
      <div class="blog__header">
        <template v-if="filterLabel">
          <h1 class="blog__title">
            <VIcon icon="mdi:tag-outline" width="22" class="blog__title-icon" />
            {{ filterLabel }}
          </h1>
          <router-link to="/tags/" class="blog__clear">
            <VIcon icon="mdi:arrow-left" width="14" class="blog__clear-icon" />
            全部标签
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

const filterLabel = computed(() => {
  if (route.params.tag) return `标签: ${route.params.tag}`
  return ''
})

const filteredArticles = computed(() => {
  const tag = route.params.tag
  if (tag && data.tagsIndex[tag]) {
    const slugs = new Set(data.tagsIndex[tag])
    return data.articles.filter(a => slugs.has(a.slug))
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