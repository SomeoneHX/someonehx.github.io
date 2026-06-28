<template>
  <nav class="navbar">
    <div class="navbar__inner container">
      <router-link to="/" class="navbar__logo">someonehx</router-link>
      <div class="navbar__links">
        <router-link to="/blog/" class="navbar__link">Blog</router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: var(--nav-height);
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
  font-size: var(--text-sm);
  color: var(--color-gray-500);
  transition: color var(--transition-fast);
}

.navbar__link:hover,
.navbar__link--active {
  color: var(--color-gray-900);
}
</style>