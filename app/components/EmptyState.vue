<script setup lang="ts">
defineProps<{ body?: string; title: string }>();
</script>

<template>
  <div class="grid flex-1 place-items-center px-6 py-20 text-center">
    <div class="flex max-w-sm flex-col items-center gap-3">
      <BookMark animated class="text-action mb-1 size-10" />
      <p class="text-sm font-medium">{{ title }}</p>
      <p v-if="body" class="text-muted text-sm leading-6">{{ body }}</p>
      <slot />
    </div>
  </div>
</template>
