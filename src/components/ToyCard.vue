<template>
  <router-link :to="`/toys/${toy.slug}/`" custom v-slot="{ href, navigate }">
    <a :href="href" class="card toy-card" @click="handleCardClick($event, navigate)">
      <div class="toy-card__body">
        <VIcon :icon="toy.icon" width="32" class="toy-card__icon" />
        <h3 class="toy-card__title">{{ toy.name }}</h3>
        <p class="toy-card__desc">{{ toy.description }}</p>
      </div>
    </a>
  </router-link>
</template>

<script setup>
import { saveToyCardRect } from '@/utils/toyCardStore'

const props = defineProps({
  toy: { type: Object, required: true },
})

function handleCardClick(event, navigate) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  saveToyCardRect(event.currentTarget.getBoundingClientRect())
  navigate()
}
</script>

<style scoped>
.toy-card {
  padding: 0;
}

.toy-card__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xl) var(--space-lg);
  text-align: center;
}

.toy-card__icon {
  flex-shrink: 0;
  color: var(--color-accent);
  margin-bottom: var(--space-xs);
}

.toy-card__title {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-gray-900);
  line-height: 1.3;
  margin: 0;
}

.toy-card__desc {
  font-size: var(--text-sm);
  color: var(--color-gray-500);
  line-height: 1.5;
  margin: 0;
}
</style>
