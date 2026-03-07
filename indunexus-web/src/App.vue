<template>
  <div id="app">
    <router-view />
    
    <!-- Toast 通知 -->
    <Toast />
  </div>
</template>

<script setup lang="ts">
import Toast from './components/Toast.vue';
</script>

<style>
#app {
  min-height: 100vh;
  background: var(--color-bg);
}
</style>
