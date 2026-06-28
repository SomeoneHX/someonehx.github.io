<template>
  <section class="hero-banner">
    <div
      class="hero-banner__bg"
      :style="bgUrl ? { backgroundImage: `url(${bgUrl})`, filter: `blur(${blurAmount}px)`, transform: `scale(${scaleAmount})` } : undefined"
      :class="{ 'hero-banner__bg--visible': imageVisible }"
    />

    <div class="hero-banner__overlay" :style="overlayStyle" />

    <div class="hero-banner__footer" v-if="copyright">
      <p class="hero-banner__copyright">{{ copyright }}</p>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const CACHE_KEY = 'hero-banner'

const bgUrl = ref('')
const copyright = ref('')
const imageVisible = ref(false)
const scrollProgress = ref(0)

const blurAmount = computed(() => scrollProgress.value * 15)
const scaleAmount = computed(() => 1 + scrollProgress.value * 0.15)

const overlayStyle = computed(() => {
  const a = 0.1 + scrollProgress.value * 0.5
  const b = 0.5 + scrollProgress.value * 0.4
  return {
    background: `linear-gradient(180deg, rgba(0,0,0,${a}) 0%, rgba(0,0,0,${b}) 100%)`,
  }
})

function onScroll() {
  const heroHeight = window.innerHeight - 56
  scrollProgress.value = Math.min(window.scrollY / heroHeight, 1)
}

function loadImage(url, cp) {
  const img = new Image()
  img.onload = () => {
    bgUrl.value = url
    imageVisible.value = true
  }
  img.src = url
  copyright.value = cp
}

onMounted(async () => {
  window.addEventListener('scroll', onScroll, { passive: true })

  const cached = getCached()
  if (cached) {
    loadImage(cached.url, cached.copyright)
    return
  }

  try {
    const res = await fetch('https://bing.biturl.top/?format=json')
    const data = await res.json()
    setCached(data.url, data.copyright)
    loadImage(data.url, data.copyright)
  } catch {
    // fallback: keep gray background
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})

function getCached() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    const today = new Date().toISOString().slice(0, 10)
    return data.date === today ? data : null
  } catch {
    return null
  }
}

function setCached(url, cp) {
  const data = {
    date: new Date().toISOString().slice(0, 10),
    url,
    copyright: cp,
  }
  localStorage.setItem(CACHE_KEY, JSON.stringify(data))
}
</script>

<style scoped>
.hero-banner {
  height: calc(100vh - var(--nav-height));
  position: sticky;
  top: var(--nav-height);
  z-index: 1;
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
  will-change: transform, filter;
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
