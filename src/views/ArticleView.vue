<template>
  <article class="article">
    <div class="container">
      <header class="article__header">
        <h1 class="article__title">{{ article?.title }}</h1>
        <div class="article__meta">
          <time v-if="article?.date" :datetime="article.date">
            {{ formatDate(article.date) }}
          </time>
          <span v-if="article?.category" class="article__category">
            · {{ article.category }}
          </span>
        </div>
        <div v-if="article?.tags?.length" class="article__tags">
          <router-link
            v-for="tag in article.tags"
            :key="tag"
            :to="`/tags/${tag}/`"
            class="article__tag"
          >{{ tag }}</router-link>
        </div>
      </header>

      <DynamicContent
        v-if="article"
        :html="article.html"
        class="article__body"
      />

      <p v-else class="article__not-found">文章未找到</p>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import DynamicContent from '@/components/DynamicContent.vue'
import data from '@/generated/content.json'

const route = useRoute()

const article = computed(() =>
  data.articles.find(a => a.slug === route.params.slug) || null
)

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<style scoped>
.article__header {
  padding: var(--space-xl) 0 var(--space-xl);
  border-bottom: 1px solid var(--color-gray-200);
  margin-bottom: var(--space-xl);
}

.article__title {
  font-size: var(--text-3xl);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.03em;
  margin-bottom: var(--space-md);
}

.article__meta {
  font-size: var(--text-sm);
  color: var(--color-gray-500);
  margin-bottom: var(--space-md);
}

.article__category {
  color: var(--color-gray-400);
}

.article__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.article__tag {
  font-size: var(--text-xs);
  padding: 2px 8px;
  border: 1px solid var(--color-gray-300);
  color: var(--color-gray-600);
  transition: border-color var(--transition-fast);
}

.article__tag:hover {
  border-color: var(--color-gray-900);
}

.article__not-found {
  padding: var(--space-3xl) 0;
  color: var(--color-gray-400);
  text-align: center;
}
</style>