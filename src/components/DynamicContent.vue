<template>
  <div class="dynamic-content" v-html="html"></div>
</template>

<script setup>
defineProps({
  html: { type: String, required: true },
})
</script>

<style scoped>
.dynamic-content h1,
.dynamic-content h2,
.dynamic-content h3 {
  margin-top: var(--space-2xl);
  margin-bottom: var(--space-md);
  font-weight: 600;
  line-height: 1.3;
}

.dynamic-content h1 { font-size: var(--text-2xl); }
.dynamic-content h2 { font-size: var(--text-xl); }
.dynamic-content h3 { font-size: var(--text-lg); }

.dynamic-content p {
  margin-bottom: var(--space-md);
  line-height: 1.8;
  color: var(--color-gray-700);
}

.dynamic-content ul,
.dynamic-content ol {
  margin-bottom: var(--space-md);
  padding-left: var(--space-xl);
}

.dynamic-content ul { list-style: disc; }
.dynamic-content ol { list-style: decimal; }

.dynamic-content li {
  margin-bottom: var(--space-xs);
}

.dynamic-content a {
  color: var(--color-gray-900);
  border-bottom: 1px solid var(--color-gray-300);
  transition: border-color var(--transition-fast);
}

.dynamic-content a:hover {
  border-color: var(--color-gray-900);
}

.dynamic-content pre {
  background: var(--color-gray-100);
  padding: var(--space-md);
  margin-bottom: var(--space-md);
  overflow-x: auto;
  font-size: var(--text-sm);
}

.dynamic-content :not(pre) > code {
  background: var(--color-gray-100);
  padding: 2px 6px;
  font-size: 0.9em;
  border-radius: 2px;
}

.dynamic-content blockquote {
  border-left: 2px solid var(--color-gray-300);
  padding-left: var(--space-md);
  margin-bottom: var(--space-md);
  color: var(--color-gray-600);
}

.dynamic-content img {
  margin: var(--space-lg) auto;
}

.dynamic-content hr {
  border: none;
  border-top: 1px solid var(--color-gray-200);
  margin: var(--space-2xl) 0;
}

.dynamic-content table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: var(--space-md);
}

.dynamic-content th,
.dynamic-content td {
  border: 1px solid var(--color-gray-200);
  padding: var(--space-sm) var(--space-md);
  text-align: left;
}

.dynamic-content th {
  background: var(--color-gray-100);
  font-weight: 600;
}
</style>