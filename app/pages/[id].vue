<script setup lang="ts">
const router = useRouter();
const route = useRoute();

const { data: book, error } = await useFetch<BookDetails>(`/api/books/${route.params.id}`);

if (error.value || !book.value) {
  throw createError({ fatal: true, status: 404, statusText: 'Book not found' });
}

useSeoMeta({
  description: () => book.value?.description ?? undefined,
  ogDescription: () => book.value?.description ?? undefined,
  ogTitle: () => book.value?.title,
  title: () => book.value?.title,
});

function goBack() {
  if (window.history.length > 1) router.back();
  else void navigateTo('/');
}
</script>

<template>
  <div class="flex flex-1 flex-col px-4 py-5 sm:px-6">
    <button
      class="text-muted hover:bg-card dark:hover:bg-card-dark mb-6 -ml-1.5 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors hover:text-black dark:hover:text-white"
      type="button"
      @click="goBack"
    >
      <AppIcon name="arrow-left" class="size-4" />
      Back to books
    </button>

    <BookDetail v-if="book" :book="book" />
    <BookDetailSkeleton v-else />
  </div>
</template>
