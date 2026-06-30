<template>
  <article ref="rootRef" class="article" :style="flipStyle">
    <div class="container">
      <button class="article__back" @click="goBack">
        <VIcon icon="mdi:arrow-left" width="14" />
        返回
      </button>
      <header class="article__header">
        <h1 class="article__title">{{ article?.title }}</h1>
        <div class="article__meta">
          <time v-if="article?.date" :datetime="article.date">
            <VIcon icon="mdi:calendar-outline" width="14" class="article__meta-icon" />
            {{ formatDate(article.date) }}
          </time>
        </div>
        <div v-if="article?.tags?.length" class="article__tags">
          <router-link
            v-for="tag in article.tags"
            :key="tag"
            :to="`/tags/${tag}/`"
            class="article__tag"
          >{{ tag }}</router-link>
        </div>
        <div v-if="article?.links?.length" class="article__links">
          <a
            v-for="link in article.links"
            :key="link.url"
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer"
            class="article__visit-btn"
          >
            <VIcon icon="mdi:open-in-new" width="16" />
            {{ link.label }}
          </a>
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
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DynamicContent from '@/components/DynamicContent.vue'
import { takeCardRect } from '@/utils/cardStore'
import data from '@/generated/content.json'

const route = useRoute()
const router = useRouter()
const rootRef = ref(null)
const flipStyle = ref(null)
const rect = takeCardRect()

if (rect) {
  const computedStyle = getComputedStyle(document.documentElement)
  const navHeight = parseFloat(computedStyle.getPropertyValue('--nav-height')) || 56
  const radiusMd = computedStyle.getPropertyValue('--radius-md').trim() || '12px'
  const shadowMd = '0 4px 16px rgba(0, 0, 0, 0.08)'

  const finalW = window.innerWidth
  const finalH = window.innerHeight - navHeight
  const dx = rect.left
  const dy = rect.top - navHeight
  const sx = rect.width / finalW
  const sy = rect.height / finalH

  flipStyle.value = {
    transformOrigin: '0 0',
    transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`,
    background: '#ffffff',
    borderRadius: radiusMd,
    boxShadow: shadowMd,
    overflow: 'hidden',
  }

  const startTransform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`

  onMounted(() => {
    const el = rootRef.value
    if (!el) return

    requestAnimationFrame(() => {
      flipStyle.value = { ...flipStyle.value, boxShadow: undefined }

      const anim = el.animate([
        {
          transform: startTransform,
          borderRadius: radiusMd,
          background: '#ffffff',
        },
        {
          transform: 'translate(0, 0) scale(1, 1)',
          borderRadius: '0px',
          background: 'transparent',
        },
      ], {
        duration: 500,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      })

      anim.finished.then(() => {
        flipStyle.value = null
      })
    })
  })
}

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

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/blog/')
  }
}
</script>

<style scoped>
.article__back {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  margin-top: var(--space-lg);
  font-size: var(--text-sm);
  color: var(--color-gray-500);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: color var(--transition-fast);
}

.article__back:hover {
  color: var(--color-accent);
}

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
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-md);
  font-size: var(--text-sm);
  color: var(--color-gray-500);
  margin-bottom: var(--space-md);
}

.article__meta time {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
}

.article__meta-icon {
  flex-shrink: 0;
}

.article__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.article__tag {
  font-size: var(--text-xs);
  padding: 3px 10px;
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-sm);
  color: var(--color-gray-600);
  transition: border-color var(--transition-fast),
              color var(--transition-fast),
              background var(--transition-fast);
}

.article__tag:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: var(--color-accent-light);
}

.article__not-found {
  padding: var(--space-3xl) 0;
  color: var(--color-gray-400);
  text-align: center;
}

.article__links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  margin-bottom: var(--space-xl);
}

.article__visit-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-lg);
  background: var(--color-accent);
  color: #fff;
  font-size: var(--text-sm);
  border-radius: var(--radius-sm);
  transition: opacity var(--transition-fast);
}

.article__visit-btn:hover {
  opacity: 0.85;
  color: #fff;
}
</style>
