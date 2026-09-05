<template>
  <div ref="root" class="dynamic-content" v-html="renderedHtml"></div>
  <ImageViewer :src="viewerSrc" :alt="viewerAlt" @close="viewerSrc = ''" />
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import ImageViewer from './ImageViewer.vue'
import { renderMarkdownWithHeadings } from '@/utils/markdown'

const props = defineProps({
  markdown: { type: String, required: true },
})

const emit = defineEmits(['rendered'])

const root = ref(null)
const viewerSrc = ref('')
const viewerAlt = ref('')
const renderedHtml = ref('')

let renderVersion = 0

watch(
  () => props.markdown,
  async (markdown) => {
    const version = ++renderVersion
    const result = await renderMarkdownWithHeadings(markdown)
    if (version !== renderVersion) return
    renderedHtml.value = result.html
    emit('rendered', result.headings)
  },
  { immediate: true }
)

function onImageClick(e) {
  const img = e.target.closest('img')
  if (!img || img.closest('.bilibili-embed')) return
  viewerSrc.value = img.currentSrc || img.src
  viewerAlt.value = img.alt || ''
}

function onKeydown(e) {
  if (e.key === 'Escape' && viewerSrc.value) {
    viewerSrc.value = ''
  }
}

function onBoxToggle(e) {
  const header = e.target.closest('.box__header')
  if (!header) return
  const box = header.closest('.box')
  if (!box) return
  box.toggleAttribute('data-open')
}

/* 代码块复制：事件委托，从 pre code 中取纯源码（剥离行号 span） */
async function onCopyClick(e) {
  const btn = e.target.closest('[data-code-copy]')
  if (!btn) return
  const codeEl = btn.closest('.code-block')?.querySelector('pre code')
  if (!codeEl) return

  const clone = codeEl.cloneNode(true)
  clone.querySelectorAll('.line-number').forEach((n) => n.remove())
  const text = clone.innerText || codeEl.textContent || ''

  let ok = false
  try {
    await navigator.clipboard.writeText(text)
    ok = true
  } catch (err) {
    /* 非安全上下文回退：隐藏 textarea + execCommand */
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.cssText = 'position:fixed;opacity:0'
      document.body.appendChild(ta)
      ta.select()
      ok = document.execCommand('copy')
      ta.remove()
    } catch (err2) {
      ok = false
    }
  }

  const original = btn.textContent
  btn.textContent = ok ? '已复制' : '复制失败'
  setTimeout(() => {
    btn.textContent = original
  }, 1600)
}

onMounted(() => {
  root.value?.addEventListener('click', onImageClick)
  root.value?.addEventListener('click', onBoxToggle)
  root.value?.addEventListener('click', onCopyClick)
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  root.value?.removeEventListener('click', onImageClick)
  root.value?.removeEventListener('click', onBoxToggle)
  root.value?.removeEventListener('click', onCopyClick)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<style>
@import 'katex/dist/katex.css';

code[class*="language-"],
pre[class*="language-"] {
  color: var(--prism-text);
  background: none;
  font-family: var(--font-mono);
  font-size: 1em;
  text-align: left;
  white-space: pre;
  word-spacing: normal;
  word-break: normal;
  word-wrap: normal;
  line-height: 1.5;
  tab-size: 4;
  hyphens: none;
}

pre[class*="language-"] {
  padding: 1em;
  margin: .5em 0;
  overflow: auto;
}

:not(pre) > code[class*="language-"],
pre[class*="language-"] {
  background: var(--prism-bg);
}

:not(pre) > code[class*="language-"] {
  padding: .1em;
  border-radius: .3em;
  white-space: normal;
}

.token.comment,
.token.prolog,
.token.doctype,
.token.cdata {
  color: var(--prism-comment);
}

.token.punctuation {
  color: var(--prism-punctuation);
}

.token.namespace {
  opacity: .7;
}

.token.property,
.token.tag,
.token.boolean,
.token.number,
.token.constant,
.token.symbol,
.token.deleted {
  color: var(--prism-property);
}

.token.selector,
.token.attr-name,
.token.string,
.token.char,
.token.builtin,
.token.inserted {
  color: var(--prism-selector);
}

.token.operator,
.token.entity,
.token.url,
.language-css .token.string,
.style .token.string {
  color: var(--prism-operator);
}

.token.atrule,
.token.attr-value,
.token.keyword {
  color: var(--prism-keyword);
}

.token.function,
.token.class-name {
  color: var(--prism-function);
}

.token.regex,
.token.important,
.token.variable {
  color: var(--prism-regex);
}

.token.important,
.token.bold {
  font-weight: bold;
}

.token.italic {
  font-style: italic;
}

.token.entity {
  cursor: help;
}

.dynamic-content h1,
.dynamic-content h2,
.dynamic-content h3,
.dynamic-content h4,
.dynamic-content h5,
.dynamic-content h6 {
  margin-top: var(--space-2xl);
  margin-bottom: var(--space-md);
  font-weight: 600;
  line-height: 1.3;
}

.dynamic-content h1 { font-size: var(--text-2xl); }
.dynamic-content h2 { font-size: var(--text-xl); }
.dynamic-content h3 { font-size: var(--text-lg); }
.dynamic-content h4 { font-size: var(--text-base); }
.dynamic-content h5 { font-size: var(--text-sm); }
.dynamic-content h6 { font-size: var(--text-sm); }

.dynamic-content h1[id],
.dynamic-content h2[id],
.dynamic-content h3[id],
.dynamic-content h4[id],
.dynamic-content h5[id],
.dynamic-content h6[id] {
  scroll-margin-top: calc(var(--nav-height) + 16px);
}

.dynamic-content h1[id]:hover,
.dynamic-content h2[id]:hover,
.dynamic-content h3[id]:hover,
.dynamic-content h4[id]:hover,
.dynamic-content h5[id]:hover,
.dynamic-content h6[id]:hover {
  cursor: pointer;
}

.dynamic-content h1[id]:hover::after,
.dynamic-content h2[id]:hover::after,
.dynamic-content h3[id]:hover::after,
.dynamic-content h4[id]:hover::after,
.dynamic-content h5[id]:hover::after,
.dynamic-content h6[id]:hover::after {
  content: ' #';
  color: var(--color-gray-400);
  font-weight: 400;
}

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
  background: var(--prism-bg);
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
  background: var(--prism-highlight-bg);
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

.dynamic-content .bilibili-embed {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%;
  margin-bottom: var(--space-md);
  background: var(--color-black);
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
  margin-bottom: var(--space-md);
  background: var(--color-gray-50);
  overflow: hidden;
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

.dynamic-content .box__header {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  user-select: none;
  transition: background var(--transition-fast);
}

.dynamic-content .box__header:hover {
  background: rgba(0, 0, 0, 0.03);
}

.dynamic-content .box__header::after {
  content: '';
  margin-left: auto;
  border: 4px solid transparent;
  border-top-color: var(--color-gray-500);
  transition: transform var(--transition-fast);
}

.dynamic-content .box[data-open] .box__header::after {
  transform: rotate(180deg);
}

.dynamic-content .box__type {
  font-weight: 600;
  font-size: var(--text-sm);
}

.dynamic-content .box__title {
  color: var(--color-gray-600);
  font-size: var(--text-sm);
}

.dynamic-content .box__body {
  padding: var(--space-md);
  border-top: 1px solid var(--color-gray-300);
}

.dynamic-content .box:not([data-open]) .box__body {
  display: none;
  border-top: none;
}

.dynamic-content .align-center {
  text-align: center;
}

.dynamic-content .align-right {
  text-align: right;
}

/* ---- 代码块容器：语言标签 + 复制按钮 ---- */
.dynamic-content .code-block {
  margin-bottom: var(--space-md);
}

.dynamic-content .code-block pre {
  margin: 0;
}

.dynamic-content .code-block__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  padding: 4px var(--space-md);
  background: var(--prism-head-bg);
  border-bottom: 1px solid rgba(128, 128, 128, 0.18);
  user-select: none;
}

.dynamic-content .code-block__lang {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.04em;
  color: var(--prism-head-fg);
}

.dynamic-content .code-block__copy {
  border: none;
  background: none;
  cursor: pointer;
  padding: 2px 8px;
  font-size: var(--text-xs);
  font-family: inherit;
  color: var(--prism-head-fg);
  border-radius: 4px;
  opacity: 0.75;
  transition: opacity var(--transition-fast), background var(--transition-fast);
}

.dynamic-content .code-block__copy:hover {
  opacity: 1;
  background: rgba(128, 128, 128, 0.15);
}

/* ---- 脚注 ---- */
.dynamic-content .footnotes {
  margin-top: var(--space-2xl);
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-gray-200);
  font-size: var(--text-sm);
  color: var(--color-gray-600);
}

.dynamic-content .footnotes ol {
  margin: 0;
  padding-left: var(--space-lg);
}

.dynamic-content .footnotes li {
  margin-bottom: var(--space-sm);
}

.dynamic-content .footnotes li > p:only-child {
  margin-bottom: 0;
}

.dynamic-content .footnote-backref {
  margin-left: 4px;
  border-bottom: none;
  text-decoration: none;
  color: var(--color-gray-400);
}

.dynamic-content .footnote-ref a {
  border-bottom: none;
}

.dynamic-content .sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

</style>
