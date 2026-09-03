import { buildHref, parseSearchParams, withFilters } from '#shared/utils/url-state';
import type { SearchParams } from '#shared/utils/url-state';

export function useCatalogFilters() {
  const route = useRoute();
  const filters = useState<SearchParams>('catalog-filters', () => ({}));
  const pendingNavigations = useState('catalog-filter-navigations', () => 0);
  const mounted = ref(false);
  const pending = computed(() => pendingNavigations.value > 0);

  function syncFromRoute() {
    filters.value = parseSearchParams(route.query);
  }

  function preview(patch: Partial<SearchParams>) {
    filters.value = withFilters(filters.value, patch);
  }

  async function commit(patch: Partial<SearchParams>) {
    preview(patch);
    pendingNavigations.value++;

    try {
      await navigateTo(buildHref(filters.value), { replace: true });
    } catch (error) {
      syncFromRoute();
      throw error;
    } finally {
      pendingNavigations.value--;
    }
  }

  watch(
    () => route.fullPath,
    () => {
      if (mounted.value) syncFromRoute();
    },
  );

  onMounted(() => {
    syncFromRoute();
    mounted.value = true;
  });

  return { commit, filters, pending, preview };
}
