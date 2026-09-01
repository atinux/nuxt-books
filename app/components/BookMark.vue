<script setup lang="ts">
defineProps<{ animated?: boolean }>();
</script>

<template>
  <svg aria-hidden="true" class="size-6" fill="none" viewBox="0 0 24 24">
    <g
      :class="{ 'book-mark-enter': animated }"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      :stroke-width="1.75"
    >
      <path d="M12 6.5C10.4 5.2 8.4 4.5 6 4.5H3.5v13H6c2.4 0 4.4.7 6 2" />
      <path d="M12 6.5c1.6-1.3 3.6-2 6-2h2.5v13H18c-2.4 0-4.4.7-6 2" />
      <path d="M12 6.5v15" />
    </g>
  </svg>
</template>
