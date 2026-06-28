<template>
  <div class="app">
    <NavBar />
    <div class="app__main">
      <router-view />
    </div>
    <FooterBar />
  </div>
</template>

<script setup>
import NavBar from '@/components/NavBar.vue'
import FooterBar from '@/components/FooterBar.vue'
</script>

<style scoped>
.app__main {
  flex: 1;
}
</style>
