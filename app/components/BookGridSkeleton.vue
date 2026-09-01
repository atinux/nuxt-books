<script setup lang="ts">
import { ITEMS_PER_PAGE } from '#shared/utils/book-constants';

withDefaults(defineProps<{ count?: number }>(), { count: ITEMS_PER_PAGE });
</script>

<template>
  <div aria-hidden="true" class="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
    <span
      v-for="index in count"
      :key="index"
      class="skeleton-animation skeleton-subtle aspect-[2/3] w-full rounded-md"
    />
  </div>
</template>
