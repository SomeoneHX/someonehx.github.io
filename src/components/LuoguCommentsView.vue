<template>
  <div class="luogu-comments">
    <iframe
      :key="frameKey"
      ref="frameRef"
      class="luogu-comments__frame"
      :src="frameSrc"
      :style="{ height: `${height}px` }"
      scrolling="no"
      loading="lazy"
      title="洛谷文章评论"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useDarkMode } from '@/composables/useDarkMode'

const props = defineProps({
  articleId: { type: String, required: true },
})

/* LGS Reply Viewer 部署基址（iframe 指向其 #/embed 页，只读展示洛谷文章评论区） */
const VIEWER_BASE = 'https://someonehx.github.io/lgs-reply-viewer/'
const RESIZE_MESSAGE = 'lgs-reply-viewer:resize'

const { isDark } = useDarkMode()

const frameRef = ref(null)
const frameKey = ref(0)
const height = ref(200)

/* 嵌入页按 query 决定主题，无法运行中切换；站点主题变化时重建 iframe 跟随 */
const theme = computed(() => (isDark.value ? 'dark' : 'light'))

const frameSrc = computed(() => {
  const params = new URLSearchParams()
  params.set('article', props.articleId)
  params.set('theme', theme.value)
  return `${VIEWER_BASE}#/embed?${params.toString()}`
})

watch(theme, () => {
  height.value = 200
  frameKey.value += 1
})

/* 嵌入页通过 postMessage 上报自身高度，避免宿主页出现滚动条 */
function onMessage(event) {
  const data = event.data
  if (!data || data.type !== RESIZE_MESSAGE) return
  if (event.source !== frameRef.value?.contentWindow) return
  const h = Math.ceil(data.height)
  if (h > 0) height.value = h
}

onMounted(() => window.addEventListener('message', onMessage))
onBeforeUnmount(() => window.removeEventListener('message', onMessage))
</script>

<style scoped>
.luogu-comments {
  width: 100%;
}

.luogu-comments__frame {
  display: block;
  width: 100%;
  height: 200px;
  border: 0;
  overflow: hidden;
  transition: height 0.2s ease;
}
</style>
