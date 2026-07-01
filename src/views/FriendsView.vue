<template>
  <div class="friends">
    <div class="container section">
      <h1 class="friends__title">
        <VIcon icon="mdi:link-variant" width="22" class="friends__title-icon" />
        友链
      </h1>

      <p class="friends__desc">
        以下是一些朋友的站点。欢迎交换友链，可通过 <router-link to="/guestbook/" class="friends__desc-link">留言板</router-link> 联系。
      </p>

      <div v-if="friends.length" class="friends__grid">
        <a
          v-for="friend in friends"
          :key="friend.url"
          :href="friend.url"
          target="_blank"
          rel="noopener noreferrer"
          class="friends__card"
        >
          <div class="friends__card-avatar">
            <VIcon icon="mdi:web" width="24" />
          </div>
          <div class="friends__card-body">
            <h3 class="friends__card-name">{{ friend.name }}</h3>
            <p v-if="friend.description" class="friends__card-desc">{{ friend.description }}</p>
          </div>
          <VIcon icon="mdi:open-in-new" width="14" class="friends__card-icon" />
        </a>
      </div>

      <p v-else class="friends__empty">暂无友链</p>
    </div>
  </div>
</template>

<script setup>
const friends = [
  // {
  //   name: '示例友链',
  //   url: 'https://example.com',
  //   description: '这里填写站点描述',
  // },
]
</script>

<style scoped>
.friends__title {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--text-2xl);
  font-weight: 700;
  margin-bottom: var(--space-sm);
}

.friends__title-icon {
  flex-shrink: 0;
  color: var(--color-accent);
}

.friends__desc {
  font-size: var(--text-sm);
  color: var(--color-gray-500);
  margin-bottom: var(--space-2xl);
  line-height: 1.6;
}

.friends__desc-link {
  color: var(--color-gray-900);
  border-bottom: 1px solid var(--color-gray-300);
  transition: border-color var(--transition-fast);
}

.friends__desc-link:hover {
  border-color: var(--color-gray-900);
}

.friends__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
}

@media (max-width: 600px) {
  .friends__grid {
    grid-template-columns: 1fr;
  }
}

.friends__card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-md);
  transition: border-color var(--transition-fast),
              box-shadow var(--transition-fast);
  text-decoration: none;
}

.friends__card:hover {
  border-color: var(--color-accent);
  box-shadow: var(--shadow-sm);
}

.friends__card-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--color-gray-100);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-gray-400);
  flex-shrink: 0;
  overflow: hidden;
}

.friends__card-body {
  flex: 1;
  min-width: 0;
}

.friends__card-name {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-gray-900);
  margin-bottom: 2px;
}

.friends__card-desc {
  font-size: var(--text-xs);
  color: var(--color-gray-400);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.friends__card-icon {
  flex-shrink: 0;
  color: var(--color-gray-300);
  transition: color var(--transition-fast);
}

.friends__card:hover .friends__card-icon {
  color: var(--color-accent);
}

.friends__empty {
  color: var(--color-gray-400);
  font-size: var(--text-sm);
}
</style>
