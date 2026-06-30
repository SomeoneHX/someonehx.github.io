<template>
  <router-link :to="`/blog/${article.slug}/`" custom v-slot="{ href, navigate }">
    <a :href="href" class="card" @click="handleCardClick($event, navigate)">
      <img v-if="article.cover" :src="article.cover" alt="" class="card__cover" />
      <div v-else class="card__cover card__cover--text">{{ article.title }}</div>
      <span
        v-if="article.links?.length"
        class="card__ext-link"
        @click.stop.prevent="openExternalLink(article.links[0].url)"
      >
        <VIcon icon="mdi:open-in-new" width="14" class="card__ext-icon" />
      </span>
      <div class="card__content">
      <div class="card__meta">
        <VIcon icon="mdi:calendar-outline" width="14" class="card__meta-icon" />
        {{ formatDate(article.date) }}
      </div>
      <p class="card__description">{{ article.description }}</p>
      <div v-if="article.tags.length" class="card__tags">
        <span
          v-for="tag in article.tags"
          :key="tag"
          class="card__tag"
          @click.prevent.stop="$emit('tagClick', tag)"
        >{{ tag }}</span>
      </div>
    </div>
    </a>
  </router-link>
</template>

<script setup>
import { saveCardRect } from '@/utils/cardStore'

defineProps({
  article: { type: Object, required: true },
})

defineEmits(['tagClick'])

function handleCardClick(event, navigate) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  saveCardRect(event.currentTarget.getBoundingClientRect())
  navigate()
}

function openExternalLink(url) {
  window.open(url, '_blank', 'noopener,noreferrer')
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>