<script setup lang="ts">
import { buildHref, getCurrentPage, getTotalPages, withPage } from '#shared/utils/url-state';
import type { SearchParams } from '#shared/utils/url-state';

const props = defineProps<{ hasNext: boolean; searchParams: SearchParams; total?: number }>();
const route = useRoute();
const pendingDirection = ref<'next' | 'previous'>();

const totalPages = computed(() => (props.total === undefined ? undefined : getTotalPages(props.total)));
const currentPage = computed(() => getCurrentPage(props.searchParams, totalPages.value));
const previousHref = computed(() => buildHref(withPage(props.searchParams, currentPage.value - 1)));
const nextHref = computed(() => buildHref(withPage(props.searchParams, currentPage.value + 1)));
const prefetchedPayloads = new Set<string>();

function payloadHref(href: string) {
  const url = new URL(href, window.location.origin);
  const pathname = url.pathname === '/' ? '' : url.pathname.replace(/\/$/, '');
  return `${pathname}/_payload.json${url.search}`;
}

async function prefetchPayload(href: string) {
  const payload = payloadHref(href);
  if (prefetchedPayloads.has(payload)) return;
  prefetchedPayloads.add(payload);

  try {
    const response = await fetch(payload, { cache: 'force-cache', credentials: 'same-origin' });
    await response.arrayBuffer();
  } catch {
    prefetchedPayloads.delete(payload);
  }
}

function prefetchAdjacentPages() {
  if (currentPage.value > 1) void prefetchPayload(previousHref.value);
  if (props.hasNext) void prefetchPayload(nextHref.value);
}

watch(
  () => route.fullPath,
  () => {
    pendingDirection.value = undefined;
    prefetchAdjacentPages();
  },
);

onMounted(prefetchAdjacentPages);

const stepClass =
  'text-muted hover:bg-card dark:hover:bg-card-dark focus-visible:ring-action/40 inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors hover:text-black focus-visible:ring-2 focus-visible:outline-none dark:hover:text-white';
</script>

<template>
  <nav aria-label="Pagination" class="flex items-center justify-between gap-4">
    <NuxtLink
      v-if="currentPage > 1"
      aria-label="Previous page"
      :class="stepClass"
      prefetch-on="visibility"
      :to="previousHref"
      @click="pendingDirection = 'previous'"
    >
      <AppIcon v-if="pendingDirection === 'previous'" name="loader" class="size-3.5 animate-spin" />
      <AppIcon v-else name="chevron-left" class="size-4" />
      Previous
    </NuxtLink>
    <span v-else aria-disabled="true" :class="[stepClass, 'pointer-events-none opacity-40']">
      <AppIcon name="chevron-left" class="size-4" />
      Previous
    </span>

    <p class="text-muted flex items-center gap-2 text-xs tabular-nums sm:text-sm">
      <span v-if="total !== undefined" class="hidden sm:inline">
        <span class="font-medium text-black dark:text-white">{{ total.toLocaleString() }}</span> books
      </span>
      <span v-else aria-hidden="true" class="skeleton-animation skeleton-subtle hidden h-4 w-20 sm:block" />
      <span aria-hidden="true" class="bg-divider dark:bg-divider-dark hidden h-3 w-px sm:block" />
      <span>
        Page {{ currentPage.toLocaleString() }}
        <template v-if="totalPages !== undefined">of {{ totalPages.toLocaleString() }}</template>
      </span>
    </p>

    <NuxtLink
      v-if="hasNext"
      aria-label="Next page"
      :class="stepClass"
      prefetch-on="visibility"
      :to="nextHref"
      @click="pendingDirection = 'next'"
    >
      Next
      <AppIcon v-if="pendingDirection === 'next'" name="loader" class="size-3.5 animate-spin" />
      <AppIcon v-else name="chevron-right" class="size-4" />
    </NuxtLink>
    <span v-else aria-disabled="true" :class="[stepClass, 'pointer-events-none opacity-40']">
      Next
      <AppIcon name="chevron-right" class="size-4" />
    </span>
  </nav>
</template>
