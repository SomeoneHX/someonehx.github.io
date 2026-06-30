<template>
  <section class="giscus-section">
    <h2 class="giscus-section__heading">评论</h2>
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
  </section>
</template>

<script setup>
import 'giscus'
import { computed } from 'vue'
import { useDarkMode } from '@/composables/useDarkMode'

defineProps({
  term: { type: String, required: true },
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
</script>

<style scoped>
.giscus-section {
  margin-top: var(--space-3xl);
  padding-top: var(--space-xl);
  border-top: 1px solid var(--color-gray-200);
}

.giscus-section__heading {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-gray-400);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: var(--space-lg);
}

.giscus-section__hint {
  font-size: var(--text-sm);
  color: var(--color-gray-400);
}
</style>
