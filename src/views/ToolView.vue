<template>
  <article ref="rootRef" class="tool" :style="flipStyle">
    <template v-if="!toy">
      <div class="container section">
        <p class="tool__not-found">工具未找到</p>
      </div>
    </template>
    <template v-else>
      <div class="container section">
        <button class="tool__back" @click="goBack">
          <VIcon icon="mdi:arrow-left" width="14" />
          返回
        </button>
        <h1 class="tool__title">
          <VIcon :icon="toy.icon" width="24" class="tool__title-icon" />
          {{ toy.name }}
        </h1>
        <p class="tool__desc">{{ toy.description }}</p>
        <component :is="toolComponent" />
      </div>
    </template>
  </article>
</template>

<script setup>
import { ref, computed, defineAsyncComponent, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toysMap } from '@/data/toys.js'
import { takeToyCardRect } from '@/utils/toyCardStore'

const route = useRoute()
const router = useRouter()
const rootRef = ref(null)
const flipStyle = ref(null)

const toy = computed(() => toysMap[route.params.slug] || null)

const toolComponents = {
  base64: defineAsyncComponent(() => import('@/views/tools/Base64View.vue')),
}

const toolComponent = computed(() => {
  if (!toy.value) return null
  return toolComponents[toy.value.slug] || null
})

const rect = takeToyCardRect()

if (rect) {
  const scrollingElement = document.scrollingElement || document.documentElement
  scrollingElement.scrollTop = 0
  scrollingElement.scrollLeft = 0
  document.body.scrollTop = 0
  document.body.scrollLeft = 0
  document.documentElement.scrollTop = 0
  document.documentElement.scrollLeft = 0

  const computedStyle = getComputedStyle(document.documentElement)
  const navHeight = parseFloat(computedStyle.getPropertyValue('--nav-height')) || 56
  const radiusMd = computedStyle.getPropertyValue('--radius-md').trim() || '12px'
  const cardBg = computedStyle.getPropertyValue('--color-card-bg').trim() || '#ffffff'

  const finalW = window.innerWidth
  const finalH = window.innerHeight - navHeight
  const dx = rect.left
  const dy = rect.top - navHeight
  const sx = rect.width / finalW
  const sy = rect.height / finalH

  flipStyle.value = {
    transformOrigin: '0 0',
    transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`,
    background: cardBg,
    borderRadius: radiusMd,
    overflow: 'hidden',
  }

  const startTransform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`

  onMounted(() => {
    const el = rootRef.value
    if (!el) return

    requestAnimationFrame(() => {
      const anim = el.animate([
        {
          transform: startTransform,
          borderRadius: radiusMd,
          background: cardBg,
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

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/toys/')
  }
}
</script>

<style scoped>
.tool__back {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  margin-bottom: var(--space-md);
  font-size: var(--text-sm);
  color: var(--color-gray-500);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: color var(--transition-fast);
}

.tool__back:hover {
  color: var(--color-accent);
}

.tool__title {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--text-2xl);
  font-weight: 700;
  margin-bottom: var(--space-sm);
}

.tool__title-icon {
  flex-shrink: 0;
  color: var(--color-accent);
}

.tool__desc {
  font-size: var(--text-sm);
  color: var(--color-gray-500);
  margin-bottom: var(--space-xl);
  line-height: 1.6;
}

.tool__not-found {
  padding: var(--space-3xl) 0;
  color: var(--color-gray-400);
  text-align: center;
}
</style>
