<template>
  <nav class="navbar">
    <div class="navbar__inner container">
      <router-link to="/" class="navbar__logo">Someone.HX</router-link>
      <div class="navbar__links">
        <router-link to="/blog/" class="navbar__link">
          <VIcon icon="mdi:post-outline" width="16" class="navbar__link-icon" />
          博客
        </router-link>
        <router-link to="/tags/%E9%A1%B9%E7%9B%AE/" class="navbar__link">
          <VIcon icon="mdi:code-braces" width="16" class="navbar__link-icon" />
          项目
        </router-link>
        <router-link to="/tags/" class="navbar__link">
          <VIcon icon="mdi:tag-outline" width="16" class="navbar__link-icon" />
          标签
        </router-link>
        <router-link to="/about/" class="navbar__link">
          <VIcon icon="mdi:account-outline" width="16" class="navbar__link-icon" />
          关于
        </router-link>
        <router-link to="/archives/" class="navbar__link">
          <VIcon icon="mdi:archive-outline" width="16" class="navbar__link-icon" />
          归档
        </router-link>
        <router-link to="/friends/" class="navbar__link">
          <VIcon icon="mdi:link-variant" width="16" class="navbar__link-icon" />
          友链
        </router-link>
        <router-link to="/guestbook/" class="navbar__link">
          <VIcon icon="mdi:message-text-outline" width="16" class="navbar__link-icon" />
          留言
        </router-link>
        <router-link to="/toys/" class="navbar__link">
          <VIcon icon="mdi:toy-brick-outline" width="16" class="navbar__link-icon" />
          工具箱
        </router-link>
        <button class="navbar__search-btn" @click="openSearch" title="搜索">
          <VIcon icon="mdi:magnify" width="16" />
        </button>
        <button class="navbar__theme-btn" @click="toggleDarkMode" :title="isDark ? '切换亮色模式' : '切换深色模式'">
          <VIcon :icon="isDark ? 'mdi:white-balance-sunny' : 'mdi:moon-waning-crescent'" width="16" />
        </button>
      </div>
    </div>
  </nav>
  <SearchModal :visible="showSearch" @close="closeSearch" />
</template>

<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import { useDarkMode } from '@/composables/useDarkMode'
import SearchModal from '@/components/SearchModal.vue'

const { isDark, initDarkMode, toggleDarkMode } = useDarkMode()
onMounted(initDarkMode)

const showSearch = ref(false)

function openSearch() {
  showSearch.value = true
}

function closeSearch() {
  showSearch.value = false
}

function onKeydown(e) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    showSearch.value = true
  }
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  height: var(--nav-height);
  flex-shrink: 0;
  background: var(--color-navbar-bg);
  border-bottom: 1px solid var(--color-gray-200);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.navbar__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.navbar__logo {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-gray-900);
  letter-spacing: -0.02em;
}

.navbar__logo:hover {
  color: var(--color-gray-600);
}

.navbar__links {
  display: flex;
  gap: var(--space-md);
}

.navbar__link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--text-sm);
  color: var(--color-gray-500);
  transition: color var(--transition-fast);
}

.navbar__link:hover,
.navbar__link--active {
  color: var(--color-gray-900);
}

.navbar__link-icon {
  flex-shrink: 0;
}

.navbar__search-btn,
.navbar__theme-btn {
  display: inline-flex;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-gray-500);
  transition: color var(--transition-fast);
  padding: 0;
}

.navbar__search-btn:hover,
.navbar__theme-btn:hover {
  color: var(--color-accent);
}
</style>