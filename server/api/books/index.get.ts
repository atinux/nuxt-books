import { getBooksCount, getBooksPage } from '../../utils/book-catalog';
import { parseSearchParams } from '#shared/utils/url-state';
import { toBookFilters, toBookQuery } from '#shared/utils/book-utils';
import type { CatalogResponse } from '#shared/types/book';

export default defineEventHandler(async event => {
  const params = parseSearchParams(getQuery(event));
  console.log('params', params)
  const query = toBookQuery(params);
  const [books, total] = await Promise.all([getBooksPage(query), getBooksCount(toBookFilters(query))]);

  return { books, total } satisfies CatalogResponse;
});
