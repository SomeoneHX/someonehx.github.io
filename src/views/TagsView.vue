<template>
  <div class="tags">
    <div class="container section">
      <h1 class="tags__title">
        <VIcon icon="mdi:tag-outline" width="22" class="tags__title-icon" />
        标签
      </h1>
      <div class="tags__list">
        <router-link
          v-for="tag in tagList"
          :key="tag.name"
          :to="`/tags/${tag.name}/`"
          class="tags__pill"
        >
          {{ tag.name }}
          <span class="tags__count">{{ tag.count }}</span>
        </router-link>
        <p v-if="!tagList.length" class="tags__empty">暂无标签</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import data from '@/generated/content.json'

const tagList = computed(() =>
  Object.entries(data.tagsIndex)
    .map(([name, slugs]) => ({ name, count: slugs.length }))
    .sort((a, b) => b.count - a.count)
)
</script>

<style scoped>
.tags__title {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--text-2xl);
  font-weight: 700;
  margin-bottom: var(--space-xl);
}

.tags__title-icon {
  flex-shrink: 0;
  color: var(--color-accent);
}

.tags__list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.tags__pill {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: 6px 14px;
  font-size: var(--text-sm);
  border: 1px solid var(--color-gray-200);
  border-radius: 999px;
  color: var(--color-gray-700);
  transition: border-color var(--transition-fast),
              color var(--transition-fast),
              background var(--transition-fast);
}

.tags__pill:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: var(--color-accent-light);
}

.tags__count {
  font-size: var(--text-xs);
  color: var(--color-gray-400);
  transition: color var(--transition-fast);
}

.tags__pill:hover .tags__count {
  color: var(--color-accent);
}

.tags__empty {
  color: var(--color-gray-400);
  font-size: var(--text-sm);
}
</style>
