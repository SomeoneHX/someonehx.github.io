<template>
  <div class="guestbook">
    <div class="container section">
      <h1 class="guestbook__title">
        <VIcon icon="mdi:message-text-outline" width="22" class="guestbook__title-icon" />
        留言板
      </h1>

      <p class="guestbook__desc">
        欢迎留下你的想法、建议或随便聊聊。
      </p>

      <ClientOnly>
        <GiscusView term="/guestbook/" />
      </ClientOnly>
    </div>
  </div>
</template>

<script setup>
import GiscusView from '@/components/GiscusView.vue'
</script>

<style scoped>
.guestbook__title {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--text-2xl);
  font-weight: 700;
  margin-bottom: var(--space-sm);
}

.guestbook__title-icon {
  flex-shrink: 0;
  color: var(--color-accent);
}

.guestbook__desc {
  font-size: var(--text-sm);
  color: var(--color-gray-500);
  margin-bottom: var(--space-2xl);
  line-height: 1.6;
}
</style>
