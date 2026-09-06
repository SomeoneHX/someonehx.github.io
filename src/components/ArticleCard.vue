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
import { useRoute } from 'vue-router'
import { saveFlipSource } from '@/utils/cardStore'

defineProps({
  article: { type: Object, required: true },
})

const emit = defineEmits(['tagClick', 'open'])
const route = useRoute()

function handleCardClick(event, navigate) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  /* 仅带封面的卡片走共享元素 FLIP：记录封面视觉区 rect（含顶部圆角裁切）
     与整卡 rect（含卡身白底，正向放大时外框随封面一起长大）、封面 URL
     （与文章 hero 同源同图）。无封面卡片走普通卷帘过渡。
     emit('open') 让列表页在跳转前补记自身视图状态（展开数等），返回时恢复 */
    const wrap = event.currentTarget.querySelector('.card__cover-wrap')
    const coverImg = wrap && wrap.querySelector('img')
    if (coverImg) {
      const r = wrap.getBoundingClientRect()
      const c = event.currentTarget.getBoundingClientRect()
      saveFlipSource({
        coverRect: { left: r.left, top: r.top, width: r.width, height: r.height },
        cardRect: { left: c.left, top: c.top, width: c.width, height: c.height },
        cover: coverImg.getAttribute('src'),
        from: route.fullPath,
        /* 被点卡片元素引用（一次性）：正向过渡的整卡层要 clone 整张卡片
           （封面图 + 渐变 + 标题 + 日期/摘要/标签全部参与放大），否则卡片
           文字会静止在垫底里不放大。onLeave 同步消费 clone 后置 null 释放。 */
        el: event.currentTarget,
      })
      emit('open')
    }
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