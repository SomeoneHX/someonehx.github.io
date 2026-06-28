<template>
  <section class="drawer">
    <div class="drawer__edge"></div>
    <div class="drawer__body">
      <div class="container">
        <ProfileSection />
      </div>

      <section class="section">
        <div class="container">
          <h2 class="section__heading">最新文章</h2>
          <div class="grid-2">
            <ArticleCard
              v-for="article in latestArticles"
              :key="article.slug"
              :article="article"
            />
          </div>

          <router-link to="/blog/" class="drawer__more">
            查看更多 →
          </router-link>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <h2 class="section__heading">其他站点</h2>
          <div class="drawer__links">
            <slot name="links">
              <a href="#" class="drawer__link">待添加</a>
            </slot>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import data from '@/generated/content.json'
import ProfileSection from '@/components/ProfileSection.vue'
import ArticleCard from '@/components/ArticleCard.vue'

const latestArticles = computed(() => data.articles.slice(0, 6))
</script>

<style scoped>
.drawer {
  position: sticky;
  top: var(--nav-height);
  z-index: 10;
  background: var(--color-white);
}

.drawer__edge {
  height: 1px;
  background: var(--color-gray-200);
}

.drawer__body {
  padding-bottom: var(--space-3xl);
}

.section__heading {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-gray-400);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: var(--space-lg);
}

.drawer__more {
  display: inline-block;
  margin-top: var(--space-xl);
  font-size: var(--text-sm);
  color: var(--color-gray-500);
  transition: color var(--transition-fast);
}

.drawer__more:hover {
  color: var(--color-gray-900);
}

.drawer__links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
}

.drawer__link {
  font-size: var(--text-sm);
  color: var(--color-gray-500);
  border-bottom: 1px solid var(--color-gray-300);
  padding-bottom: 2px;
  transition: color var(--transition-fast), border-color var(--transition-fast);
}

.drawer__link:hover {
  color: var(--color-gray-900);
  border-color: var(--color-gray-900);
}
</style>