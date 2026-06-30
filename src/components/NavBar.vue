<template>
  <nav class="navbar">
    <div class="navbar__inner container">
      <router-link to="/" class="navbar__logo">Someone.HX</router-link>
      <div class="navbar__links">
        <router-link to="/blog/" class="navbar__link">
          <VIcon icon="mdi:post-outline" width="16" class="navbar__link-icon" />
          Blog
        </router-link>
        <router-link to="/tags/%E9%A1%B9%E7%9B%AE/" class="navbar__link">
          <VIcon icon="mdi:code-braces" width="16" class="navbar__link-icon" />
          项目
        </router-link>
        <router-link to="/tags/" class="navbar__link">
          <VIcon icon="mdi:tag-outline" width="16" class="navbar__link-icon" />
          标签
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  height: var(--nav-height);
  flex-shrink: 0;
  background: var(--color-white);
  border-bottom: 1px solid var(--color-gray-200);
  backdrop-filter: blur(8px);
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
</style>