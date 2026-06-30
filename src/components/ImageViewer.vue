<template>
  <Teleport to="body">
    <transition name="viewer">
      <div v-if="src" class="image-viewer" @click.self="close">
        <button class="image-viewer__close" @click="close" aria-label="关闭">
          <VIcon icon="mdi:close" width="24" />
        </button>
        <img :src="src" :alt="alt" class="image-viewer__img" @click.stop />
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
})
const emit = defineEmits(['close'])
function close() { emit('close') }
</script>

<style scoped>
.image-viewer {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-out;
}

.image-viewer__img {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  cursor: default;
}

.image-viewer__close {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 1001;
  color: #fff;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  opacity: 0.7;
  transition: opacity 0.15s;
  line-height: 1;
}

.image-viewer__close:hover {
  opacity: 1;
}

.viewer-enter-active,
.viewer-leave-active {
  transition: opacity 0.2s ease;
}

.viewer-enter-from,
.viewer-leave-to {
  opacity: 0;
}
</style>
