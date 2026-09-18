<template>
  <main class="home">
    <HeroBanner />

    <div class="home__drawer-wrapper">
      <DrawerSection />
    </div>
  </main>
</template>

<script setup lang="ts">
import HeroBanner from '@/components/HeroBanner.vue'
import DrawerSection from '@/components/DrawerSection.vue'
</script>

<style scoped>
.home__drawer-wrapper {
  position: relative;
}
</style>