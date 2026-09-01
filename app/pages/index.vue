<script setup lang="ts">
import { parseSearchParams } from '#shared/utils/url-state';
import type { CatalogResponse } from '#shared/types/book';

const route = useRoute();
const query = computed(() => parseSearchParams(route.query));
const { data, error, status } = await useFetch<CatalogResponse>('/api/books', { query, server: false });
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <div
      class="flex-1 px-4 py-5 transition-opacity duration-200 ease-out sm:px-6"
      :class="{ 'opacity-60': status === 'pending' }"
      :data-filtering="status === 'pending' ? '' : undefined"
    >
      <div v-if="error" class="grid flex-1 place-items-center px-6 py-20 text-center">
        <div class="flex max-w-sm flex-col items-center gap-3">
          <AppIcon name="alert-triangle" class="text-danger size-6" />
          <p class="text-sm font-medium">Can't load books</p>
          <p class="text-muted text-sm leading-6">
            The catalog query failed. Check your database connection and try again.
          </p>
          <button
            class="border-divider hover:bg-card dark:border-divider-dark dark:hover:bg-card-dark mt-1 inline-flex h-8 items-center justify-center rounded-full border px-3 text-xs font-semibold"
            type="button"
            @click="refreshNuxtData()"
          >
            Try again
          </button>
        </div>
      </div>
      <BookGrid v-else-if="data" :books="data.books" :search-params="query" />
      <BookGridSkeleton v-else />
    </div>

    <footer class="border-divider dark:border-divider-dark mt-auto border-t px-4 py-3 sm:px-6">
      <BookPagination v-if="data" :search-params="query" :total="data.total" />
      <div v-else aria-hidden="true" class="flex items-center justify-between gap-4">
        <span class="text-muted inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-sm opacity-40">
          <AppIcon name="chevron-left" class="size-4" /> Previous
        </span>
        <span class="skeleton-animation skeleton-subtle block h-4 w-20" />
        <span class="text-muted inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-sm opacity-40">
          Next <AppIcon name="chevron-right" class="size-4" />
        </span>
      </div>
    </footer>
  </div>
</template>
