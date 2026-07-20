<template>
  <div class="md-editor">
    <div class="md-editor__toolbar">
      <button
        :class="['md-editor__tab', { 'md-editor__tab--active': activeTab === 'edit' }]"
        @click="activeTab = 'edit'"
      >编辑</button>
      <button
        :class="['md-editor__tab', { 'md-editor__tab--active': activeTab === 'preview' }]"
        @click="activeTab = 'preview'"
      >预览</button>
      <button
        :class="['md-editor__tab', { 'md-editor__tab--active': activeTab === 'split' }]"
        @click="activeTab = 'split'"
      >分栏</button>
    </div>

    <div class="md-editor__panes">
      <div
        v-show="activeTab === 'edit' || activeTab === 'split'"
        class="md-editor__pane md-editor__pane--edit"
      >
        <textarea
          v-model="source"
          class="md-editor__textarea"
          placeholder="在此输入 Markdown..."
          @input="onInput"
        ></textarea>
      </div>
      <div
        v-show="activeTab === 'preview' || activeTab === 'split'"
        class="md-editor__pane md-editor__pane--preview"
      >
        <DynamicContent v-if="html" :html="html" />
        <p v-else class="md-editor__placeholder">预览将显示在此处</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import DynamicContent from '@/components/DynamicContent.vue'
import { renderMarkdown } from '@/utils/markdown'

const source = ref('')
const html = ref('')
const activeTab = ref('split')

let debounceTimer = null

function updatePreview() {
  const text = source.value
  if (!text) {
    html.value = ''
    return
  }
  renderMarkdown(text).then(result => {
    html.value = result
  })
}

function onInput() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(updatePreview, 300)
}
</script>

<style scoped>
.md-editor__toolbar {
  display: flex;
  gap: var(--space-xxs);
  margin-bottom: var(--space-md);
  border-bottom: 1px solid var(--color-gray-200);
  padding-bottom: var(--space-sm);
}

.md-editor__tab {
  background: none;
  border: none;
  padding: var(--space-xs) var(--space-md);
  font-size: var(--text-sm);
  color: var(--color-gray-500);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: color var(--transition-fast),
              background var(--transition-fast);
}

.md-editor__tab:hover {
  color: var(--color-gray-900);
  background: var(--color-gray-100);
}

.md-editor__tab--active {
  color: var(--color-accent);
  background: var(--color-accent-light);
}



.md-editor__panes {
  display: flex;
  gap: var(--space-md);
  min-height: 400px;
}

.md-editor__pane {
  flex: 1;
  min-width: 0;
}

.md-editor__pane--edit {
  display: flex;
}

.md-editor__textarea {
  width: 100%;
  min-height: 400px;
  padding: var(--space-md);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-md);
  background: var(--color-card-bg);
  color: var(--color-gray-900);
  font-family: var(--font-mono, 'SFMono-Regular', 'Consolas', monospace);
  font-size: var(--text-sm);
  line-height: 1.6;
  resize: vertical;
  box-sizing: border-box;
}

.md-editor__textarea:focus {
  outline: none;
  border-color: var(--color-accent);
}

.md-editor__pane--preview {
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  overflow-y: auto;
  min-height: 400px;
  max-height: 80vh;
}

.md-editor__placeholder {
  color: var(--color-gray-400);
  font-size: var(--text-sm);
  margin: 0;
}

@media (max-width: 720px) {
  .md-editor__panes {
    flex-direction: column;
  }

  .md-editor__pane {
    min-height: 300px;
  }
}
</style>
