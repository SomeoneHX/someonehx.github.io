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
  padding: 0;
  margin-bottom: var(--space-md);
  overflow-x: auto;
  font-size: var(--text-sm);
  line-height: 1.6;
}

.dynamic-content pre code {
  display: block;
  padding: var(--space-md);
  background: none;
  font-size: inherit;
}

.dynamic-content .code-line {
  display: block;
  min-height: 1.6em;
}

.dynamic-content .code-highlight {
  display: block;
}

.dynamic-content .line-number::before {
  content: attr(line);
  display: inline-block;
  width: 2.5em;
  text-align: right;
  padding-right: 1em;
  color: var(--color-gray-400);
  user-select: none;
}

.dynamic-content .highlight-line {
  background: var(--color-gray-200);
  margin: 0 calc(-1 * var(--space-md));
  padding: 0 var(--space-md);
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

.dynamic-content .epigraph {
  font-style: italic;
  text-align: right;
  border-left: none;
  border-right: 2px solid var(--color-gray-300);
  padding-left: 0;
  padding-right: var(--space-md);
}

.dynamic-content .epigraph p:last-child {
  margin-bottom: 0;
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

.dynamic-content .box {
  border: 1px solid var(--color-gray-300);
  border-radius: 4px;
  padding: var(--space-md);
  margin-bottom: var(--space-md);
  background: var(--color-gray-50);
}

.dynamic-content .box--info {
  border-color: var(--color-gray-300);
}

.dynamic-content .box--success {
  border-color: var(--color-gray-400);
}

.dynamic-content .box--warning {
  border-left: 3px solid var(--color-gray-600);
}

.dynamic-content .box--error {
  border-left: 3px solid var(--color-gray-900);
  background: var(--color-gray-100);
}

.dynamic-content .box > summary {
  cursor: pointer;
  font-weight: 600;
  margin-bottom: var(--space-sm);
  list-style: none;
}

.dynamic-content .box > summary::marker {
  display: none;
  content: '';
}

.dynamic-content .align-center {
  text-align: center;
}

.dynamic-content .align-right {
  text-align: right;
}

.dynamic-content details.box[open] > summary {
  margin-bottom: var(--space-sm);
}

.dynamic-content details.box:not([open]) > summary {
  margin-bottom: 0;
}

.dynamic-content details.box > summary + * {
  margin-top: var(--space-sm);
}

.dynamic-content .token.comment,
.dynamic-content .token.prolog,
.dynamic-content .token.doctype,
.dynamic-content .token.cdata {
  color: var(--color-gray-400);
  font-style: italic;
}

.dynamic-content .token.punctuation {
  color: var(--color-gray-500);
}

.dynamic-content .token.property,
.dynamic-content .token.tag,
.dynamic-content .token.boolean,
.dynamic-content .token.number,
.dynamic-content .token.constant,
.dynamic-content .token.symbol,
.dynamic-content .token.deleted {
  color: var(--color-gray-800);
}

.dynamic-content .token.selector,
.dynamic-content .token.attr-name,
.dynamic-content .token.string,
.dynamic-content .token.char,
.dynamic-content .token.builtin,
.dynamic-content .token.inserted {
  color: var(--color-gray-700);
}

.dynamic-content .token.operator,
.dynamic-content .token.entity,
.dynamic-content .token.url {
  color: var(--color-gray-600);
}

.dynamic-content .token.atrule,
.dynamic-content .token.attr-value,
.dynamic-content .token.keyword {
  color: var(--color-gray-900);
  font-weight: 600;
}

.dynamic-content .token.function,
.dynamic-content .token.class-name,
.dynamic-content .token.maybe-class-name {
  color: var(--color-gray-800);
}

.dynamic-content .token.regex,
.dynamic-content .token.important,
.dynamic-content .token.variable {
  color: var(--color-gray-700);
}

.dynamic-content .token.bold {
  font-weight: bold;
}

.dynamic-content .token.italic {
  font-style: italic;
}
</style>
