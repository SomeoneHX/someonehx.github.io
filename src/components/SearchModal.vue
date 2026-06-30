<template>
  <Teleport to="body">
    <div v-if="visible" class="search-overlay" @click.self="close">
      <div class="search-modal" ref="modalRef" role="dialog" aria-label="搜索文章">
        <div class="search-modal__input-wrapper">
          <VIcon icon="mdi:magnify" width="18" class="search-modal__input-icon" />
          <input
            ref="inputRef"
            v-model="query"
            class="search-modal__input"
            type="text"
            placeholder="搜索文章..."
            @keydown="onKeydown"
          />
          <button v-if="query" class="search-modal__clear" @click="query = ''">
            <VIcon icon="mdi:close" width="16" />
          </button>
        </div>

        <div v-if="query && !results.length" class="search-modal__empty">
          未找到匹配的文章
        </div>

        <ul v-if="results.length" class="search-modal__results" ref="listRef">
          <li
            v-for="(item, i) in results"
            :key="item.slug"
            :ref="i === selectedIndex ? selectedRef : undefined"
            class="search-modal__item"
            :class="{ 'search-modal__item--selected': i === selectedIndex }"
            @click="openArticle(item.slug)"
            @mouseenter="selectedIndex = i"
          >
            <div class="search-modal__item-title">{{ item.title }}</div>
            <div class="search-modal__item-meta">
              <time v-if="item.date">{{ formatDate(item.date) }}</time>
              <span v-if="item.tags.length" class="search-modal__item-tags">{{ item.tags.join(', ') }}</span>
            </div>
            <p v-if="item.description" class="search-modal__item-desc">{{ item.description }}</p>
          </li>
        </ul>

        <div class="search-modal__footer">
          <span class="search-modal__footer-key"><VIcon icon="mdi:arrow-up-down" width="14" /> 导航</span>
          <span class="search-modal__footer-key"><VIcon icon="mdi:keyboard-return" width="14" /> 打开</span>
          <span class="search-modal__footer-key"><kbd>esc</kbd> 关闭</span>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import Fuse from 'fuse.js'
import data from '@/generated/content.json'

const router = useRouter()

const props = defineProps({
  visible: Boolean,
})

const emit = defineEmits(['close'])

const query = ref('')
const selectedIndex = ref(0)
const inputRef = ref(null)
const listRef = ref(null)
const selectedRef = ref(null)

const results = computed(() => {
  if (!query.value.trim()) return []
  return fuse.search(query.value.trim()).map(r => r.item)
})

let fuse = null

function buildIndex() {
  fuse = new Fuse(data.articles, {
    keys: [
      { name: 'title', weight: 3 },
      { name: 'description', weight: 2 },
      { name: 'tags', weight: 1.5 },
      { name: 'text', weight: 1 },
    ],
    threshold: 0.4,
    includeMatches: false,
  })
}

watch(() => props.visible, async (v) => {
  if (v) {
    buildIndex()
    query.value = ''
    selectedIndex.value = 0
    await nextTick()
    inputRef.value?.focus()
  }
})

function onKeydown(e) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    selectedIndex.value = Math.min(selectedIndex.value + 1, results.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    const item = results.value[selectedIndex.value]
    if (item) openArticle(item.slug)
  } else if (e.key === 'Escape') {
    close()
  }
}

function openArticle(slug) {
  close()
  router.push(`/blog/${slug}/`)
}

function close() {
  emit('close')
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<style scoped>
.search-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
}

.search-modal {
  width: 100%;
  max-width: 540px;
  background: var(--color-glass-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.search-modal__input-wrapper {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid color-mix(in srgb, var(--color-gray-200) 50%, transparent);
}

.search-modal__input-icon {
  flex-shrink: 0;
  color: var(--color-gray-400);
}

.search-modal__input {
  flex: 1;
  border: none;
  background: none;
  outline: none;
  font-size: var(--text-lg);
  color: var(--color-gray-900);
}

.search-modal__input::placeholder {
  color: var(--color-gray-400);
}

.search-modal__clear {
  display: flex;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-gray-400);
  padding: 2px;
}

.search-modal__clear:hover {
  color: var(--color-gray-600);
}

.search-modal__empty {
  padding: var(--space-2xl);
  text-align: center;
  color: var(--color-gray-400);
  font-size: var(--text-sm);
}

.search-modal__results {
  max-height: 400px;
  overflow-y: auto;
  padding: var(--space-xs) 0;
}

.search-modal__item {
  display: block;
  padding: var(--space-md) var(--space-lg);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.search-modal__item--selected {
  background: color-mix(in srgb, var(--color-gray-100) 60%, transparent);
}

.search-modal__item-title {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-gray-900);
  margin-bottom: 2px;
}

.search-modal__item-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  font-size: var(--text-xs);
  color: var(--color-gray-400);
  margin-bottom: 2px;
}

.search-modal__item-tags {
  color: var(--color-accent);
}

.search-modal__item-desc {
  font-size: var(--text-sm);
  color: var(--color-gray-500);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-modal__footer {
  display: flex;
  gap: var(--space-lg);
  padding: var(--space-sm) var(--space-lg);
  border-top: 1px solid color-mix(in srgb, var(--color-gray-200) 50%, transparent);
  font-size: var(--text-xs);
  color: var(--color-gray-400);
}

.search-modal__footer-key {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.search-modal__footer-key kbd {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  padding: 1px 5px;
  border: 1px solid var(--color-gray-200);
  border-radius: 3px;
  background: var(--color-gray-50);
}
</style>
