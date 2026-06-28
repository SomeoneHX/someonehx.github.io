<template>
  <div class="profile">
    <h1 class="profile__name">Someone.HX</h1>
    <div class="profile__links">
      <a
        v-for="link in links"
        :key="link.label"
        :href="link.url"
        target="_blank"
        rel="noopener noreferrer"
        class="profile__link"
      >
        <VIcon :icon="link.icon" width="16" class="profile__link-icon" />
        {{ link.label }}
      </a>
    </div>
  </div>
</template>

<script setup>
const links = [
  { label: 'GitHub', icon: 'mdi:github', url: 'https://github.com/SomeoneHX' },
  { label: 'Luogu', icon: 'simple-icons:luogu', url: 'https://www.luogu.com.cn/user/1816684' },
]
</script>

<style scoped>
.profile {
  padding: var(--space-xl) 0 var(--space-2xl);
}

.profile__name {
  font-size: var(--text-3xl);
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--color-gray-900);
  margin-bottom: var(--space-lg);
}

.profile__links {
  display: flex;
  gap: var(--space-md);
}

.profile__link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--text-sm);
  color: var(--color-gray-500);
  border-bottom: 1px solid transparent;
  transition: color var(--transition-fast), border-color var(--transition-fast);
}

.profile__link:hover {
  color: var(--color-accent);
  border-color: var(--color-accent);
}

.profile__link-icon {
  flex-shrink: 0;
}
</style>