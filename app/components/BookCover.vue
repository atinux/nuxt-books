<script setup lang="ts">
import { createPngDataUri } from 'unlazy/thumbhash';
import { EMPTY_IMAGE_URL, getLargeBookImageUrl } from '#shared/utils/book-constants';

const props = defineProps<{
  priority?: boolean;
  sizes: string;
  src: string | null;
  thumbhash: string | null;
  title: string;
}>();

const source = computed(() => getLargeBookImageUrl(props.src ?? EMPTY_IMAGE_URL));
const placeholder = computed(() => (props.thumbhash ? createPngDataUri(props.thumbhash) : undefined));
</script>

<template>
  <div class="bg-card dark:bg-card-dark relative aspect-[2/3] w-full overflow-hidden rounded-md">
    <NuxtImg
      :alt="title"
      class="absolute inset-0 size-full object-cover"
      :height="600"
      :loading="priority ? 'eager' : 'lazy'"
      :placeholder="placeholder"
      :preload="priority"
      :sizes="sizes"
      :src="source"
      :width="400"
    />
  </div>
</template>
