<script setup lang="ts">
import { formatCount, getLanguageLabel } from '#shared/utils/book-utils';
import type { BookDetails } from '#shared/types/book';

const props = defineProps<{ book: BookDetails }>();
const rating = computed(() => Number(props.book.average_rating));
const hasRating = computed(() => props.book.average_rating !== null && !Number.isNaN(rating.value));
const facts = computed(() => [
  { icon: 'book-open' as const, label: 'Pages', value: props.book.num_pages?.toLocaleString() ?? 'Unknown' },
  { icon: 'globe' as const, label: 'Language', value: getLanguageLabel(props.book.language_code) },
  { icon: 'calendar' as const, label: 'Published', value: props.book.publication_year ?? 'Unknown' },
  { icon: 'building' as const, label: 'Publisher', value: props.book.publisher ?? 'Unknown' },
  { icon: 'hash' as const, label: 'ISBN', value: props.book.isbn ?? 'None' },
]);
</script>

<template>
  <article class="flex flex-col gap-8 md:flex-row md:gap-10">
    <div class="mx-auto w-40 shrink-0 sm:w-48 md:mx-0 md:w-72">
      <BookCover
        class="shadow-soft ring-divider/70 dark:ring-divider-dark/70 ring-1"
        priority
        sizes="sm:192px md:288px"
        :src="book.image_url"
        :thumbhash="book.thumbhash"
        :title="book.title"
      />
    </div>

    <div class="min-w-0 flex-1">
      <h1>{{ book.title }}</h1>
      <p v-if="book.authors.length" class="text-muted mt-2 text-base sm:text-lg">{{ book.authors.join(', ') }}</p>

      <div v-if="hasRating" class="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1">
        <StarRating :rating="rating" />
        <span class="text-sm font-semibold tabular-nums">{{ rating.toFixed(1) }}</span>
        <span v-if="book.ratings_count" class="text-muted text-sm tabular-nums">
          {{ formatCount(book.ratings_count) }} ratings
        </span>
      </div>

      <p v-if="book.description" class="text-muted mt-6 max-w-prose text-sm leading-7">{{ book.description }}</p>

      <dl
        class="border-divider dark:border-divider-dark mt-8 grid grid-cols-1 gap-x-8 gap-y-4 border-t pt-6 sm:grid-cols-2"
      >
        <div v-for="fact in facts" :key="fact.label" class="flex items-start gap-3">
          <AppIcon :name="fact.icon" class="text-muted mt-0.5 size-4 shrink-0" />
          <div class="min-w-0">
            <dt class="text-muted text-xs font-semibold tracking-wide uppercase">{{ fact.label }}</dt>
            <dd class="mt-0.5 truncate text-sm" :class="{ 'font-mono text-xs': fact.label === 'ISBN' }">
              {{ fact.value }}
            </dd>
          </div>
        </div>
      </dl>
    </div>
  </article>
</template>
