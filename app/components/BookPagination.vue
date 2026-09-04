<script setup lang="ts">
import { buildHref, getCurrentPage, getTotalPages, withPage } from '#shared/utils/url-state';
import type { SearchParams } from '#shared/utils/url-state';

const props = defineProps<{ hasNext: boolean; pending: boolean; searchParams: SearchParams; total?: number }>();
const route = useRoute();
const pagination = ref<HTMLElement>();
const pendingDirection = ref<'next' | 'previous'>();
const visible = ref(false);
const warmedPages = new Set<string>();
let observer: IntersectionObserver | undefined;

const totalPages = computed(() => (props.total === undefined ? undefined : getTotalPages(props.total)));
const currentPage = computed(() => getCurrentPage(props.searchParams, totalPages.value));
const currentHref = computed(() => buildHref(props.searchParams));
const previousSearchParams = computed(() => withPage(props.searchParams, currentPage.value - 1));
const nextSearchParams = computed(() => withPage(props.searchParams, currentPage.value + 1));
const previousHref = computed(() => buildHref(previousSearchParams.value));
const nextHref = computed(() => buildHref(nextSearchParams.value));

function warmPage(searchParams: SearchParams) {
  const href = buildHref(searchParams);
  if (warmedPages.has(href)) return;

  warmedPages.add(href);
  void $fetch('/api/books', { query: searchParams }).catch(() => warmedPages.delete(href));
}

function warmAdjacentPages() {
  if (!visible.value || props.pending) return;
  if (currentPage.value > 1) warmPage(previousSearchParams.value);
  if (props.hasNext) warmPage(nextSearchParams.value);
}

function startPageNavigation(event: MouseEvent, direction: 'next' | 'previous') {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  pendingDirection.value = direction;
  window.scrollTo({ left: 0, top: 0 });
}

watch(
  () => route.fullPath,
  () => {
    pendingDirection.value = undefined;
  },
);
watch(currentHref, href => warmedPages.add(href), { immediate: true });
watch([visible, previousHref, nextHref, () => props.hasNext, () => props.pending], warmAdjacentPages);

onMounted(() => {
  if (!pagination.value || !('IntersectionObserver' in window)) {
    visible.value = true;
    return;
  }

  observer = new IntersectionObserver(entries => {
    visible.value = entries.some(entry => entry.isIntersecting);
  });
  observer.observe(pagination.value);
});
onBeforeUnmount(() => observer?.disconnect());

const stepClass =
  'text-muted hover:bg-card dark:hover:bg-card-dark focus-visible:ring-action/40 inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors hover:text-black focus-visible:ring-2 focus-visible:outline-none dark:hover:text-white';
</script>

<template>
  <nav ref="pagination" aria-label="Pagination" class="flex items-center justify-between gap-4">
    <FastLink
      v-if="currentPage > 1"
      aria-label="Previous page"
      :class="stepClass"
      prefetch-on="visibility"
      :to="previousHref"
      @click="startPageNavigation($event, 'previous')"
    >
      <AppIcon v-if="pendingDirection === 'previous'" name="loader" class="size-3.5 animate-spin" />
      <AppIcon v-else name="chevron-left" class="size-4" />
      Previous
    </FastLink>
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

    <FastLink
      v-if="hasNext"
      aria-label="Next page"
      :class="stepClass"
      prefetch-on="visibility"
      :to="nextHref"
      @click="startPageNavigation($event, 'next')"
    >
      Next
      <AppIcon v-if="pendingDirection === 'next'" name="loader" class="size-3.5 animate-spin" />
      <AppIcon v-else name="chevron-right" class="size-4" />
    </FastLink>
    <span v-else aria-disabled="true" :class="[stepClass, 'pointer-events-none opacity-40']">
      Next
      <AppIcon name="chevron-right" class="size-4" />
    </span>
  </nav>
</template>
