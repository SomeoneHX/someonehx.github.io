<template>
  <section class="hero-banner">
    <div
      class="hero-banner__bg"
      :style="bgUrl ? { backgroundImage: `url(${bgUrl})` } : undefined"
      :class="{ 'hero-banner__bg--visible': imageVisible }"
    />

    <div class="hero-banner__overlay" />

    <div class="hero-banner__footer" v-if="copyright">
      <p class="hero-banner__copyright">{{ copyright }}</p>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const bgUrl = ref('')
const copyright = ref('')
const imageVisible = ref(false)

onMounted(async () => {
  try {
    const res = await fetch('https://bing.biturl.top/?format=json')
    const data = await res.json()

    const img = new Image()
    img.onload = () => {
      bgUrl.value = data.url
      imageVisible.value = true
    }
    img.src = data.url

    copyright.value = data.copyright
  } catch {
    // fallback: keep gray background
  }
})
</script>

<style scoped>
.hero-banner {
  height: calc(100vh - var(--nav-height));
  position: relative;
  z-index: 0;
  overflow: hidden;
  background: var(--color-gray-100);
}

.hero-banner__bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0;
  transition: opacity 0.8s ease;
}

.hero-banner__bg--visible {
  opacity: 1;
}

.hero-banner__overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.1) 0%,
    rgba(0, 0, 0, 0.5) 100%
  );
}

.hero-banner__footer {
  position: absolute;
  bottom: var(--space-lg);
  left: 0;
  right: 0;
  z-index: 2;
  padding: 0 var(--space-lg);
  text-align: center;
}

.hero-banner__copyright {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: rgba(255, 255, 255, 0.55);
  margin: 0;
  line-height: 1.4;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}
</style>
