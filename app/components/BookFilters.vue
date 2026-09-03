<script setup lang="ts">
import {
  LANGUAGES,
  LISTS,
  MAX_PAGES,
  MAX_RATING,
  MAX_YEAR,
  MIN_PAGES,
  MIN_RATING,
  MIN_YEAR,
  PAGE_FILTER_VALUES,
  RATING_FILTER_VALUES,
  YEAR_FILTER_VALUES,
} from '#shared/utils/book-constants';
defineProps<{ idPrefix: string }>();

const { commit, filters, pending, preview } = useCatalogFilters();
const activeCount = computed(
  () => Object.entries(filters.value).filter(([key, value]) => key !== 'page' && Boolean(value)).length,
);

function selectedIndex(values: readonly number[], value: number) {
  return values.reduce(
    (closest, option, index) => (Math.abs(option - value) < Math.abs(values[closest]! - value) ? index : closest),
    0,
  );
}

function rangeValue(event: Event, values: readonly number[]) {
  return values[Number((event.currentTarget as HTMLInputElement).value)];
}

function toggleList(slug: string) {
  void commit({ list: filters.value.list === slug ? undefined : slug });
}

function clear() {
  void commit({
    language: undefined,
    list: undefined,
    pages: undefined,
    rating: undefined,
    search: undefined,
    year: undefined,
  });
}
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col" :data-filtering="pending ? '' : undefined">
    <div
      class="min-h-0 flex-1 touch-pan-y [scrollbar-gutter:stable] overflow-x-hidden overflow-y-auto overscroll-contain px-1 pb-6"
    >
      <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-2">
          <div class="flex items-baseline justify-between gap-2">
            <label class="text-muted text-xs font-semibold tracking-wide uppercase" :for="`${idPrefix}-filter-year`">
              Published before
            </label>
            <span class="text-sm font-medium text-black tabular-nums dark:text-white">
              {{ filters.year ?? 'Any year' }}
            </span>
          </div>
          <input
            :id="`${idPrefix}-filter-year`"
            class="focus-visible:ring-accent/30 cursor-pointer rounded-full focus-visible:ring-2 focus-visible:outline-none"
            :max="YEAR_FILTER_VALUES.length - 1"
            min="0"
            :value="selectedIndex(YEAR_FILTER_VALUES, Number(filters.year ?? MAX_YEAR))"
            type="range"
            @input="
              preview({
                year:
                  rangeValue($event, YEAR_FILTER_VALUES) === MAX_YEAR
                    ? undefined
                    : String(rangeValue($event, YEAR_FILTER_VALUES)),
              })
            "
            @change="
              commit({
                year:
                  rangeValue($event, YEAR_FILTER_VALUES) === MAX_YEAR
                    ? undefined
                    : String(rangeValue($event, YEAR_FILTER_VALUES)),
              })
            "
          />
          <div class="text-muted flex justify-between text-[11px] tabular-nums">
            <span>{{ MIN_YEAR }}</span
            ><span>{{ MAX_YEAR }}</span>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <div class="flex items-baseline justify-between gap-2">
            <label class="text-muted text-xs font-semibold tracking-wide uppercase" :for="`${idPrefix}-filter-rating`">
              Minimum rating
            </label>
            <span class="text-sm font-medium text-black tabular-nums dark:text-white">
              {{ Number(filters.rating) > 0 ? `${filters.rating}+ stars` : 'Any rating' }}
            </span>
          </div>
          <input
            :id="`${idPrefix}-filter-rating`"
            class="focus-visible:ring-accent/30 cursor-pointer rounded-full focus-visible:ring-2 focus-visible:outline-none"
            :max="RATING_FILTER_VALUES.length - 1"
            min="0"
            :value="selectedIndex(RATING_FILTER_VALUES, Number(filters.rating ?? MIN_RATING))"
            type="range"
            @input="
              preview({
                rating:
                  rangeValue($event, RATING_FILTER_VALUES) === MIN_RATING
                    ? undefined
                    : String(rangeValue($event, RATING_FILTER_VALUES)),
              })
            "
            @change="
              commit({
                rating:
                  rangeValue($event, RATING_FILTER_VALUES) === MIN_RATING
                    ? undefined
                    : String(rangeValue($event, RATING_FILTER_VALUES)),
              })
            "
          />
          <div class="text-muted flex justify-between text-[11px] tabular-nums">
            <span>Any</span><span>{{ MAX_RATING }} stars</span>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <div class="flex items-baseline justify-between gap-2">
            <label class="text-muted text-xs font-semibold tracking-wide uppercase" :for="`${idPrefix}-filter-pages`">
              Max pages
            </label>
            <span class="text-sm font-medium text-black tabular-nums dark:text-white">
              {{ filters.pages ? `${Number(filters.pages).toLocaleString()} pages` : 'Any length' }}
            </span>
          </div>
          <input
            :id="`${idPrefix}-filter-pages`"
            class="focus-visible:ring-accent/30 cursor-pointer rounded-full focus-visible:ring-2 focus-visible:outline-none"
            :max="PAGE_FILTER_VALUES.length - 1"
            min="0"
            :value="selectedIndex(PAGE_FILTER_VALUES, Number(filters.pages ?? MAX_PAGES))"
            type="range"
            @input="
              preview({
                pages:
                  rangeValue($event, PAGE_FILTER_VALUES) === MAX_PAGES
                    ? undefined
                    : String(rangeValue($event, PAGE_FILTER_VALUES)),
              })
            "
            @change="
              commit({
                pages:
                  rangeValue($event, PAGE_FILTER_VALUES) === MAX_PAGES
                    ? undefined
                    : String(rangeValue($event, PAGE_FILTER_VALUES)),
              })
            "
          />
          <div class="text-muted flex justify-between text-[11px] tabular-nums">
            <span>{{ MIN_PAGES }}</span
            ><span>{{ MAX_PAGES.toLocaleString() }}</span>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-muted text-xs font-semibold tracking-wide uppercase" :for="`${idPrefix}-filter-language`">
            Language
          </label>
          <span class="relative block min-w-0">
            <select
              :id="`${idPrefix}-filter-language`"
              class="border-divider focus:border-accent focus:ring-accent/25 dark:border-divider-dark w-full appearance-none rounded-md border bg-white px-3 py-2 pr-8 text-sm text-black transition-colors focus:ring-2 focus:outline-none dark:bg-[#1c1c1c] dark:text-white"
              :value="filters.language ?? 'en'"
              @change="commit({ language: ($event.currentTarget as HTMLSelectElement).value })"
            >
              <option v-for="language in LANGUAGES" :key="language.value" :value="language.value">
                {{ language.label }}
              </option>
            </select>
            <AppIcon
              name="chevron-down"
              class="text-muted pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2"
            />
          </span>
        </div>

        <fieldset class="flex flex-col gap-2">
          <legend class="text-muted mb-2 text-xs font-semibold tracking-wide uppercase">Book lists</legend>
          <label
            v-for="list in LISTS"
            :key="list.name"
            class="hover:bg-card dark:hover:bg-card-dark -mx-2 flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors"
          >
            <input
              :checked="filters.list === list.slug"
              class="accent-action size-4 cursor-pointer"
              type="checkbox"
              @change="toggleList(list.slug)"
            />
            {{ list.name }}
          </label>
        </fieldset>
      </div>
    </div>

    <div v-if="activeCount > 0" class="border-divider dark:border-divider-dark border-t pt-3">
      <button
        class="border-divider hover:border-gray/40 hover:bg-card dark:border-divider-dark dark:hover:border-gray/30 dark:hover:bg-card-dark inline-flex h-9 w-full items-center justify-center gap-2 rounded-full border bg-white px-4 text-sm font-semibold text-black transition-colors dark:bg-transparent dark:text-white"
        type="button"
        @click="clear"
      >
        Clear all filters
      </button>
    </div>
  </div>
</template>
