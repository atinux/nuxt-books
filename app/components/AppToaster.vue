<script setup lang="ts">
import { Toaster } from 'vue-sonner';

const colorMode = useColorMode();
const theme = computed(() => (colorMode.value === 'dark' ? 'dark' : 'light'));
</script>

<template>
  <div class="pointer-events-none fixed inset-0 z-9999">
    <Toaster position="bottom-right" :theme="theme" />
  </div>
</template>
