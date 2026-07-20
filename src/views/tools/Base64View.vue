<template>
  <div class="base64">
    <div class="base64__cols">
      <div class="base64__col">
        <label class="base64__label">输入</label>
        <textarea
          v-model="input"
          class="base64__textarea"
          rows="6"
          placeholder="在此输入文本..."
        ></textarea>
      </div>
      <div class="base64__col">
        <label class="base64__label">输出</label>
        <textarea
          :value="output"
          class="base64__textarea"
          rows="6"
          placeholder="结果将显示在此处"
          readonly
        ></textarea>
      </div>
    </div>

    <div class="base64__actions">
      <button class="base64__btn base64__btn--primary" @click="encode">
        <VIcon icon="mdi:arrow-right-bold" width="14" />
        编码
      </button>
      <button class="base64__btn base64__btn--primary" @click="decode">
        <VIcon icon="mdi:arrow-left-bold" width="14" />
        解码
      </button>
      <button class="base64__btn" @click="swap">
        <VIcon icon="mdi:swap-vertical" width="14" />
        交换
      </button>
      <button class="base64__btn" @click="clear">
        <VIcon icon="mdi:close" width="14" />
        清空
      </button>
      <button class="base64__btn" @click="copy">
        <VIcon icon="mdi:content-copy" width="14" />
        {{ copied ? '已复制' : '复制' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const input = ref('')
const output = ref('')
const copied = ref(false)

function encode() {
  try {
    output.value = btoa(String.fromCharCode(...new TextEncoder().encode(input.value)))
  } catch {
    output.value = '编码失败'
  }
}

function decode() {
  try {
    output.value = new TextDecoder().decode(
      Uint8Array.from(atob(input.value), c => c.charCodeAt(0))
    )
  } catch {
    output.value = '解码失败：输入不是有效的 Base64 编码'
  }
}

function swap() {
  const tmp = input.value
  input.value = output.value
  output.value = tmp
}

function clear() {
  input.value = ''
  output.value = ''
}

async function copy() {
  if (!output.value) return
  try {
    await navigator.clipboard.writeText(output.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    output.value = '' // no-op
  }
}
</script>

<style scoped>
.base64__cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
}

@media (max-width: 600px) {
  .base64__cols {
    grid-template-columns: 1fr;
  }
}

.base64__label {
  display: block;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-gray-700);
  margin-bottom: var(--space-sm);
}

.base64__textarea {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-sm);
  background: var(--color-card-bg);
  color: var(--color-gray-900);
  font-family: var(--font-mono, 'SFMono-Regular', 'Consolas', monospace);
  font-size: var(--text-sm);
  line-height: 1.5;
  resize: vertical;
  box-sizing: border-box;
}

.base64__textarea:focus {
  outline: none;
  border-color: var(--color-accent);
}

.base64__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  margin-top: var(--space-md);
}

.base64__btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-sm);
  background: var(--color-card-bg);
  color: var(--color-gray-700);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: border-color var(--transition-fast),
              color var(--transition-fast),
              background var(--transition-fast);
}

.base64__btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.base64__btn--primary {
  background: var(--color-accent);
  color: #fff;
  border-color: var(--color-accent);
}

.base64__btn--primary:hover {
  opacity: 0.85;
  color: #fff;
}
</style>
