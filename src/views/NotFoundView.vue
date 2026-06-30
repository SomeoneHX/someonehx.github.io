<template>
  <div class="not-found">
    <div class="container section">
      <div class="not-found__content">
        <h1 class="not-found__code">404</h1>
        <p class="not-found__message">页面未找到</p>
        <p class="not-found__hint">你访问的页面不存在或已被移除</p>
        <router-link to="/" class="not-found__home">
          <VIcon icon="mdi:arrow-left" width="14" class="not-found__home-icon" />
          返回首页
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - var(--nav-height) - 120px);
}

.not-found__content {
  text-align: center;
}

.not-found__code {
  font-size: 6rem;
  font-weight: 800;
  line-height: 1;
  color: var(--color-accent);
  letter-spacing: -0.04em;
  margin-bottom: var(--space-md);
}

.not-found__message {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--color-gray-900);
  margin-bottom: var(--space-sm);
}

.not-found__hint {
  font-size: var(--text-sm);
  color: var(--color-gray-500);
  margin-bottom: var(--space-xl);
}

.not-found__home {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--text-sm);
  color: var(--color-gray-500);
  border-bottom: 1px solid transparent;
  transition: color var(--transition-fast), border-color var(--transition-fast);
}

.not-found__home:hover {
  color: var(--color-accent);
  border-color: var(--color-accent);
}

.not-found__home-icon {
  flex-shrink: 0;
}
</style>
