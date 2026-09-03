import { getBooksCount } from '../../utils/book-catalog';
import { parseSearchParams } from '#shared/utils/url-state';
import { toBookFilters, toBookQuery } from '#shared/utils/book-utils';
import type { CatalogCountResponse } from '#shared/types/book';

export default defineEventHandler(async event => {
  const params = parseSearchParams(getQuery(event));
  const total = await getBooksCount(toBookFilters(toBookQuery(params)));

  return { total } satisfies CatalogCountResponse;
});
