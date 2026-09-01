<script setup lang="ts">
import type { NuxtError } from '#app';

const props = defineProps<{ error: NuxtError }>();

const isBookNotFound = computed(() => props.error.status === 404 && props.error.statusText === 'Book not found');
const title = computed(() =>
  isBookNotFound.value ? 'Book not found' : props.error.status === 404 ? 'Page not found' : 'Something went wrong',
);
const body = computed(() =>
  isBookNotFound.value
    ? "We couldn't find a book with that id."
    : props.error.status === 404
      ? "That page isn't in the catalog."
      : "We couldn't load this page. Please try again.",
);
</script>

<template>
  <NuxtLayout>
    <EmptyState :body="body" :title="title">
      <button
        class="border-divider hover:border-gray/40 hover:bg-card dark:border-divider-dark dark:hover:border-gray/30 dark:hover:bg-card-dark mt-1 inline-flex h-9 items-center justify-center gap-2 rounded-full border bg-white px-4 text-sm font-semibold text-black transition-colors dark:bg-transparent dark:text-white"
        type="button"
        @click="clearError({ redirect: '/' })"
      >
        Back to the shelf
      </button>
    </EmptyState>
  </NuxtLayout>
</template>
