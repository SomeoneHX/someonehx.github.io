<template>
  <section class="rain-placeholder">
    <div class="rain-placeholder__inner">
      <p class="rain-placeholder__hint">Rain area — user to provide content</p>
    </div>
  </section>
</template>

<script setup>
</script>

<style scoped>
.rain-placeholder {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-gray-100);
  position: relative;
  z-index: 0;
}

.rain-placeholder__inner {
  text-align: center;
}

.rain-placeholder__hint {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--color-gray-400);
}
</style>