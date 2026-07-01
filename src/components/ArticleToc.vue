<template>
  <nav class="article-toc">
    <div class="article-toc__title">
      <VIcon icon="mdi:list-contents" width="16" />
      目录
    </div>
    <ul class="article-toc__list">
      <li
        v-for="h in visibleHeadings"
        :key="h.id"
        :class="['article-toc__item', `article-toc__item--h${h.depth}`]"
        :style="{ paddingLeft: indentSize(h.depth) + 'px' }"
      >
        <a
          :href="'#' + h.id"
          :class="{ 'is-active': activeId === h.id }"
          @click.prevent="scrollTo(h.id)"
        >{{ h.text }}</a>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  headings: { type: Array, default: () => [] },
  minDepth: { type: Number, default: 1 },
  maxDepth: { type: Number, default: 6 },
  indentStep: { type: Number, default: 16 },
  rootMargin: { type: String, default: '-80px 0px -60% 0px' },
})

const activeId = ref('')
let observer = null

const visibleHeadings = computed(() =>
  props.headings.filter(h => h.depth >= props.minDepth && h.depth <= props.maxDepth)
)

const baseDepth = computed(() => {
  if (!visibleHeadings.value.length) return 1
  return Math.min(...visibleHeadings.value.map(h => h.depth))
})

function indentSize(depth) {
  return (depth - baseDepth.value) * props.indentStep
}

function scrollTo(id) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter(e => e.isIntersecting)
      if (visible.length) {
        const topmost = visible.reduce((a, b) =>
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b
        )
        activeId.value = topmost.target.id
      }
    },
    { rootMargin: props.rootMargin }
  )

  nextTick(() => {
    for (const h of visibleHeadings.value) {
      const el = document.getElementById(h.id)
      if (el) observer.observe(el)
    }
  })
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<style scoped>
.article-toc {
  font-size: var(--text-sm);
}

.article-toc__title {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-weight: 600;
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--color-gray-200);
  color: var(--color-gray-700);
}

.article-toc__list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.article-toc__item {
  margin-bottom: 2px;
}

.article-toc__item a {
  display: block;
  padding: 4px 0;
  color: var(--color-gray-500);
  text-decoration: none;
  line-height: 1.4;
  border-left: 2px solid transparent;
  padding-left: var(--space-sm);
  transition: color var(--transition-fast), border-color var(--transition-fast);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.article-toc__item a:hover {
  color: var(--color-gray-700);
}

.article-toc__item a.is-active {
  color: var(--color-accent);
  border-left-color: var(--color-accent);
}
</style>
