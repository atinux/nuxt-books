<script setup lang="ts">
import { getCurrentPage } from '#shared/utils/url-state';
import type { BookSummary } from '#shared/types/book';
import type { SearchParams } from '#shared/utils/url-state';

const props = defineProps<{ books: BookSummary[]; searchParams: SearchParams }>();
const eagerPrefetch = computed(() => getCurrentPage(props.searchParams) === 1);
</script>

<template>
  <EmptyState
    v-if="books.length === 0"
    body="Nothing matched these filters. Try widening the year range or clearing the search."
    title="No books found"
  />
  <div v-else class="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
    <BookCard
      v-for="(book, index) in books"
      :key="book.id"
      :book="book"
      :eager-prefetch="eagerPrefetch"
      :priority="index < 10"
      :search-params="searchParams"
    />
  </div>
</template>
