<template>
  <div class="toys">
    <div class="container section">
      <h1 class="toys__title">
        <VIcon icon="mdi:toy-brick-outline" width="22" class="toys__title-icon" />
        工具箱
      </h1>

      <div v-if="toys.length" class="grid-2">
        <ToyCard v-for="toy in toys" :key="toy.slug" :toy="toy" />
      </div>
      <p v-else class="toys__empty">暂无工具</p>
    </div>
  </div>
</template>

<script setup>
import ToyCard from '@/components/ToyCard.vue'
import { toys } from '@/data/toys.js'
</script>

<style scoped>
.toys__title {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--text-2xl);
  font-weight: 700;
  margin-bottom: var(--space-xl);
}

.toys__title-icon {
  flex-shrink: 0;
  color: var(--color-accent);
}

.toys__empty {
  color: var(--color-gray-400);
  font-size: var(--text-sm);
}
</style>
