<script setup lang="ts">
import { buildHref, parseSearchParams, withFilters } from '#shared/utils/url-state';

const DEBOUNCE_MS = 220;
const route = useRoute();
const inputId = useId();
const input = ref<HTMLInputElement>();
const value = ref('');
const pending = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;

function syncFromRoute() {
  value.value = parseSearchParams(route.query).search ?? '';
}

async function navigate(search: string) {
  const current = parseSearchParams(route.query);
  pending.value = true;
  try {
    await navigateTo(buildHref(withFilters(current, { search: search.trim() || undefined })), { replace: true });
  } finally {
    pending.value = false;
  }
}

function scheduleNavigate() {
  clearTimeout(timer);
  timer = setTimeout(() => navigate(value.value), DEBOUNCE_MS);
}

function submit() {
  clearTimeout(timer);
  void navigate(value.value);
}

function clear() {
  clearTimeout(timer);
  value.value = '';
  void navigate('');
  input.value?.focus();
}

watch(() => route.fullPath, syncFromRoute, { immediate: true });
onBeforeUnmount(() => clearTimeout(timer));
</script>

<template>
  <form
    :aria-busy="pending"
    class="relative flex-1"
    :data-filtering="pending ? '' : undefined"
    role="search"
    @submit.prevent="submit"
  >
    <label class="sr-only" :for="inputId">Search books</label>
    <span
      aria-hidden="true"
      class="text-muted pointer-events-none absolute top-1/2 left-3.5 flex size-4 -translate-y-1/2 items-center justify-center"
    >
      <AppIcon v-if="pending" name="loader" class="size-4 animate-spin" />
      <AppIcon v-else name="search" class="size-4" />
    </span>
    <input
      :id="inputId"
      ref="input"
      v-model="value"
      class="border-divider placeholder-gray focus:border-accent focus:ring-accent/25 dark:border-divider-dark peer h-11 w-full rounded-lg border bg-white py-2 pr-10 pl-10 text-base text-black transition-colors focus:ring-2 focus:outline-none sm:text-sm dark:bg-[#1c1c1c] dark:text-white"
      name="search"
      placeholder="Search books…"
      type="search"
      @input="scheduleNavigate"
    />
    <button
      v-if="value"
      aria-label="Clear search"
      class="text-muted hover:bg-card focus-visible:ring-accent/40 dark:hover:bg-card-dark absolute top-1/2 right-1.5 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-md transition-colors hover:text-black focus-visible:ring-2 focus-visible:outline-none dark:hover:text-white"
      type="button"
      @click="clear"
    >
      <AppIcon name="x" class="size-4" />
    </button>
  </form>
</template>
