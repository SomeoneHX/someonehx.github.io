<template>
  <section class="giscus-section">
    <div class="giscus-section__head">
      <h2 class="giscus-section__heading">评论</h2>
      <div v-if="hasLuogu" class="giscus-section__tabs" role="tablist" aria-label="评论区切换">
        <button
          type="button"
          role="tab"
          class="giscus-section__tab"
          :class="{ 'is-active': activeTab === 'giscus' }"
          :aria-selected="activeTab === 'giscus'"
          @click="activeTab = 'giscus'"
        >
          Giscus
        </button>
        <button
          type="button"
          role="tab"
          class="giscus-section__tab"
          :class="{ 'is-active': activeTab === 'luogu' }"
          :aria-selected="activeTab === 'luogu'"
          @click="activeTab = 'luogu'"
        >
          洛谷评论
        </button>
      </div>
    </div>

    <div v-show="activeTab === 'giscus'" class="giscus-section__panel" role="tabpanel">
      <component
        :is="'giscus-widget'"
        v-if="configured"
        :repo="config.repo"
        :repoid="config.repoId"
        :category="config.category"
        :categoryid="config.categoryId"
        :mapping="config.mapping"
        :term="term"
        :theme="theme"
        :reactions-enabled="true"
        :emit-metadata="false"
        :input-position="config.inputPosition"
        :strict="config.strict"
        :lang="config.lang"
        :loading="'lazy'"
      />
      <p v-else class="giscus-section__hint">
        请配置 Giscus 后启用评论
      </p>
    </div>

    <div
      v-show="activeTab === 'luogu'"
      v-if="hasLuogu"
      class="giscus-section__panel"
      role="tabpanel"
    >
      <LuoguCommentsView :article-id="luoguArticle" />
    </div>
  </section>
</template>

<script setup>
import 'giscus'
import { ref, computed } from 'vue'
import { useDarkMode } from '@/composables/useDarkMode'
import LuoguCommentsView from './LuoguCommentsView.vue'

const props = defineProps({
  term: { type: String, required: true },
  /* 元数据里绑定的洛谷文章 ID：存在时在评论栏显示 Giscus / 洛谷评论 切换 */
  luoguArticle: { type: String, default: '' },
})

const config = {
  repo: 'SomeoneHX/someonehx.github.io',
  repoId: 'R_kgDOTA3H3Q',
  category: 'Announcements',
  categoryId: 'DIC_kwDOTA3H3c4DANyj',
  mapping: 'pathname',
  inputPosition: 'bottom',
  lang: 'zh-CN',
  strict: '0',
}

const configured = computed(() => !!(config.repoId && config.categoryId))

const { isDark } = useDarkMode()

const theme = computed(() => isDark.value ? 'dark' : 'light')

const hasLuogu = computed(() => !!props.luoguArticle)
const activeTab = ref('giscus')
</script>

<style scoped>
.giscus-section {
  margin-top: var(--space-3xl);
  padding-top: var(--space-xl);
  border-top: 1px solid var(--color-gray-200);
}

.giscus-section__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-sm) var(--space-md);
  margin-bottom: var(--space-lg);
}

.giscus-section__heading {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-gray-400);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0;
}

.giscus-section__tabs {
  display: inline-flex;
  gap: 2px;
  padding: 3px;
  background: var(--color-gray-100);
  border-radius: 999px;
}

.giscus-section__tab {
  border: none;
  background: transparent;
  color: var(--color-gray-500);
  font-size: var(--text-xs);
  padding: 4px 12px;
  border-radius: 999px;
  cursor: pointer;
  transition: color var(--transition-fast),
              background var(--transition-fast),
              box-shadow var(--transition-fast);
}

.giscus-section__tab:hover {
  color: var(--color-gray-700);
}

.giscus-section__tab.is-active {
  background: var(--color-card-bg);
  color: var(--color-accent);
  font-weight: 600;
  box-shadow: var(--shadow-sm);
}

.giscus-section__hint {
  font-size: var(--text-sm);
  color: var(--color-gray-400);
}
</style>
