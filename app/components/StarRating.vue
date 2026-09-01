<script setup lang="ts">
const props = defineProps<{ rating: number }>();
const rounded = computed(() => Math.round(props.rating * 2) / 2);
</script>

<template>
  <span :aria-label="`Rated ${rating.toFixed(1)} out of 5`" class="inline-flex items-center gap-0.5" role="img">
    <AppIcon
      v-for="index in 5"
      :key="index"
      name="star"
      class="size-4 fill-current"
      :class="index <= rounded || index - 0.5 === rounded ? 'text-warning' : 'text-divider dark:text-divider-dark'"
      :stroke-width="0"
    />
  </span>
</template>
