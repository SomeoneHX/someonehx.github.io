<template>
  <router-link :to="`/blog/${article.slug}/`" custom v-slot="{ href, navigate }">
    <a :href="href" class="card" @click="handleCardClick($event, navigate)">
      <div class="card__cover-wrap">
        <img v-if="article.cover" :src="article.cover" alt="" class="card__cover" />
        <div v-else class="card__cover card__cover--fallback" />
        <div class="card__cover-overlay" />
        <h3 class="card__cover-title">{{ article.title }}</h3>
      </div>
      <span
        v-if="article.links?.length"
        class="card__ext-link"
        @click.stop.prevent="openExternalLink(article.links[0].url)"
      >
        <VIcon icon="mdi:open-in-new" width="14" class="card__ext-icon" />
      </span>
      <div class="card__content">
      <div class="card__meta">
        <span class="card__meta-item">
          <VIcon icon="mdi:calendar-outline" width="14" class="card__meta-icon" />
          {{ formatDate(article.date) }}
        </span>
        <template v-if="article.readingMinutes">
          <span class="card__meta-sep" aria-hidden="true">·</span>
          <span class="card__meta-item">
            <VIcon icon="mdi:clock-outline" width="14" class="card__meta-icon" />
            约 {{ article.readingMinutes }} 分钟
          </span>
        </template>
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
import { isSlowMotion } from '@/utils/slowMotion'

defineProps({
  article: { type: Object, required: true },
})

defineEmits(['tagClick'])

function handleCardClick(event, navigate) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey) return
  /* 慢动作激活时放行 Shift+点击：照常走本卡片的 rect 保存 + navigate，
     保证 FLIP 分支完整（shift+click 让位浏览器默认的习惯仅限非慢动作态） */
  if (event.shiftKey && !isSlowMotion()) return
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