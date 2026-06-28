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
              @tagClick="goToTag"
            />
          </div>

          <router-link to="/blog/" class="drawer__more">
            <span>查看更多</span>
            <VIcon icon="mdi:arrow-right" width="14" class="drawer__more-icon" />
          </router-link>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <h2 class="section__heading">项目</h2>
          <div class="drawer__links">
            <a
              v-for="site in projectArticles"
              :key="site.slug"
              :href="site.link"
              target="_blank"
              rel="noopener noreferrer"
              class="drawer__link"
            >{{ site.title }}</a>
            <p v-if="!projectArticles.length" class="drawer__link drawer__link--empty">暂无项目</p>
          </div>
          <router-link to="/projects/" class="drawer__more">
            <span>全部项目</span>
            <VIcon icon="mdi:arrow-right" width="14" class="drawer__more-icon" />
          </router-link>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import data from '@/generated/content.json'
import ProfileSection from '@/components/ProfileSection.vue'
import ArticleCard from '@/components/ArticleCard.vue'

const router = useRouter()
const latestArticles = computed(() => data.articles.filter(a => !a.link).slice(0, 6))
const projectArticles = computed(() => data.articles.filter(a => a.link))

function goToTag(tag) {
  router.push(`/tags/${tag}/`)
}
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
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  margin-top: var(--space-xl);
  font-size: var(--text-sm);
  color: var(--color-gray-500);
  transition: color var(--transition-fast);
}

.drawer__more:hover {
  color: var(--color-accent);
}

.drawer__more-icon {
  flex-shrink: 0;
  transition: transform var(--transition-fast);
}

.drawer__more:hover .drawer__more-icon {
  transform: translateX(3px);
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

.drawer__link--empty {
  color: var(--color-gray-300);
  border-bottom: none;
  cursor: default;
}

.drawer__link--empty:hover {
  color: var(--color-gray-300);
  border-color: transparent;
}
</style>