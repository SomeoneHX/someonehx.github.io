<template>
  <header class="navbar">
    <div class="navbar__inner container">
      <router-link to="/" class="navbar__logo">Someone.HX</router-link>

      <nav class="navbar__links" aria-label="主导航">
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
        <router-link to="/guestbook/" class="navbar__link">
          <VIcon icon="mdi:message-text-outline" width="16" class="navbar__link-icon" />
          留言
        </router-link>
      </nav>

      <div class="navbar__actions">
        <button class="navbar__search-btn" @click="openSearch" title="搜索" aria-label="搜索">
          <VIcon icon="mdi:magnify" width="16" />
        </button>
        <button
          class="navbar__theme-btn"
          @click="toggleDarkMode"
          :title="isDark ? '切换亮色模式' : '切换深色模式'"
          :aria-label="isDark ? '切换亮色模式' : '切换深色模式'"
        >
          <VIcon :icon="isDark ? 'mdi:white-balance-sunny' : 'mdi:moon-waning-crescent'" width="16" />
        </button>
      </div>
    </div>
  </header>
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

/* 桌面：单行，logo 在左，tabs+操作在右 */
.navbar__inner {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  height: 100%;
}

.navbar__logo {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-gray-900);
  letter-spacing: -0.02em;
  white-space: nowrap;
}

.navbar__logo:hover {
  color: var(--color-gray-600);
}

.navbar__links {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-left: auto;
}

.navbar__link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--text-sm);
  color: var(--color-gray-500);
  white-space: nowrap;
  transition: color var(--transition-fast);
}

.navbar__link:hover,
.navbar__link--active {
  color: var(--color-gray-900);
}

.navbar__link-icon {
  flex-shrink: 0;
}

.navbar__actions {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.navbar__search-btn,
.navbar__theme-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
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

/* 窄屏：导航拆两行——第一行 logo + 搜索/深浅色，第二行 tabs（可横滑） */
@media (max-width: 860px) {
  .navbar__inner {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-rows: calc(var(--nav-height) - var(--nav-tabs-height)) var(--nav-tabs-height);
    grid-template-areas:
      'logo actions'
      'tabs  tabs';
    align-items: center;
    column-gap: var(--space-sm);
    row-gap: 0;
  }

  .navbar__logo {
    grid-area: logo;
    align-self: center;
    justify-self: start;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .navbar__actions {
    grid-area: actions;
    justify-self: end;
  }

  .navbar__links {
    grid-area: tabs;
    margin-left: 0;
    align-self: stretch;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    gap: var(--space-md);
    padding: 0 2px;
  }

  .navbar__links::-webkit-scrollbar {
    display: none;
  }

  .navbar__search-btn,
  .navbar__theme-btn {
    width: 36px;
    height: 36px;
  }
}
</style>
