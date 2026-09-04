<script setup lang="ts">
import { stringifySearchParams } from '#shared/utils/url-state';
import type { BookSummary } from '#shared/types/book';
import type { SearchParams } from '#shared/utils/url-state';

const props = defineProps<{
  book: BookSummary;
  eagerPrefetch: boolean;
  priority: boolean;
  searchParams: SearchParams;
}>();

const href = computed(() => {
  const query = stringifySearchParams(props.searchParams);
  return query ? `/${props.book.id}?${query}` : `/${props.book.id}`;
});
</script>

<template>
  <FastLink
    class="focus-visible:ring-action focus-visible:ring-offset-surface dark:focus-visible:ring-offset-surface-dark group relative block rounded-md transition-transform duration-200 ease-out hover:z-10 hover:scale-[1.04] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
    :prefetch-on="eagerPrefetch ? 'visibility' : 'interaction'"
    :to="href"
  >
    <BookCover
      class="group-hover:shadow-soft transition-shadow"
      :priority="priority"
      sizes="sm:25vw md:20vw lg:16vw xl:14vw"
      :src="book.image_url"
      :thumbhash="book.thumbhash"
      :title="book.title"
    />
    <span class="sr-only">{{ book.title }}</span>
  </FastLink>
</template>
