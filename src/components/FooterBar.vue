<template>
  <footer class="footer">
    <div class="container footer__inner">
      <p class="footer__copyright">&copy; 2026 Someone.HX</p>
      <div class="footer__links">
        <a
          v-for="link in links"
          :key="link.label"
          :href="link.url"
          target="_blank"
          rel="noopener noreferrer"
          class="footer__link"
        >
          <VIcon :icon="link.icon" width="14" class="footer__link-icon" />
          {{ link.label }}
        </a>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { profileLinks as links } from '@/data/profile'
</script>

<style scoped>
.footer {
  background: var(--color-black);
  padding: var(--space-xl) 0;
  margin-top: auto;
}

.footer__inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer__copyright {
  font-size: var(--text-sm);
  color: var(--color-gray-500);
}

.footer__links {
  display: flex;
  gap: var(--space-md);
}

.footer__link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--text-sm);
  color: var(--color-gray-400);
  transition: color var(--transition-fast);
}

.footer__link:hover {
  color: var(--color-white);
}

.footer__link-icon {
  flex-shrink: 0;
}
</style>
