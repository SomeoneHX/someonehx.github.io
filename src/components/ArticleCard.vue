<template>
  <router-link :to="`/blog/${article.slug}/`" class="card">
    <h3 class="card__title">{{ article.title }}</h3>
    <div class="card__meta">{{ formatDate(article.date) }}</div>
    <p class="card__description">{{ article.description }}</p>
    <div v-if="article.tags.length" class="card__tags">
      <span
        v-for="tag in article.tags"
        :key="tag"
        class="card__tag"
        @click.prevent="$emit('tagClick', tag)"
      >{{ tag }}</span>
    </div>
  </router-link>
</template>

<script setup>
defineProps({
  article: { type: Object, required: true },
})

defineEmits(['tagClick'])

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>