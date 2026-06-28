<template>
  <main class="home">
    <RainPlaceholder />

    <div class="home__drawer-wrapper">
      <DrawerSection />
    </div>
  </main>
</template>

<script setup>
import RainPlaceholder from '@/components/RainPlaceholder.vue'
import DrawerSection from '@/components/DrawerSection.vue'
</script>

<style scoped>
.home__drawer-wrapper {
  position: relative;
}
</style>