<template>
  <div class="archives">
    <div class="container section">
      <h1 class="archives__title">
        <VIcon icon="mdi:archive-outline" width="22" class="archives__title-icon" />
        归档
      </h1>

      <p class="archives__stats">
        共 {{ data.articles.length }} 篇文章
      </p>

      <div v-for="year in years" :key="year.year" class="archives__year">
        <h2 class="archives__year-title">{{ year.year }}</h2>

        <div v-for="month in year.months" :key="month.month" class="archives__month">
          <h3 class="archives__month-title">{{ month.month }} 月</h3>

          <ul class="archives__list">
            <li v-for="article in month.articles" :key="article.slug" class="archives__item">
              <time class="archives__date">{{ formatDate(article.date) }}</time>
              <router-link :to="`/blog/${article.slug}/`" class="archives__link">
                {{ article.title }}
              </router-link>
            </li>
          </ul>
        </div>
      </div>

      <p v-if="!data.articles.length" class="archives__empty">暂无文章</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import data from '@/generated/content.json'

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
  })
}

const years = computed(() => {
  const map = {}
  for (const a of data.articles) {
    if (!a.date) continue
    const d = new Date(a.date)
    const y = d.getFullYear()
    const m = d.getMonth() + 1
    if (!map[y]) map[y] = {}
    if (!map[y][m]) map[y][m] = []
    map[y][m].push(a)
  }

  return Object.entries(map)
    .sort(([a], [b]) => b - a)
    .map(([year, months]) => ({
      year: Number(year),
      months: Object.entries(months)
        .sort(([a], [b]) => b - a)
        .map(([month, articles]) => ({
          month: Number(month),
          articles,
        })),
    }))
})
</script>

<style scoped>
.archives__title {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--text-2xl);
  font-weight: 700;
  margin-bottom: var(--space-sm);
}

.archives__title-icon {
  flex-shrink: 0;
  color: var(--color-accent);
}

.archives__stats {
  font-size: var(--text-sm);
  color: var(--color-gray-400);
  margin-bottom: var(--space-2xl);
}

.archives__year {
  margin-bottom: var(--space-2xl);
}

.archives__year-title {
  font-size: var(--text-xl);
  font-weight: 700;
  margin-bottom: var(--space-lg);
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--color-gray-200);
}

.archives__month {
  margin-bottom: var(--space-lg);
}

.archives__month-title {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-gray-400);
  margin-bottom: var(--space-md);
}

.archives__list {
  list-style: none;
  padding: 0;
}

.archives__item {
  display: flex;
  align-items: baseline;
  gap: var(--space-md);
  padding: var(--space-sm) 0;
  border-bottom: 1px solid var(--color-gray-100);
}

.archives__item:last-child {
  border-bottom: none;
}

.archives__date {
  flex-shrink: 0;
  font-size: var(--text-sm);
  color: var(--color-gray-400);
  min-width: 3.5em;
  font-variant-numeric: tabular-nums;
}

.archives__link {
  font-size: var(--text-base);
  color: var(--color-gray-900);
  transition: color var(--transition-fast);
}

.archives__link:hover {
  color: var(--color-accent);
}

.archives__empty {
  color: var(--color-gray-400);
  font-size: var(--text-sm);
}
</style>
