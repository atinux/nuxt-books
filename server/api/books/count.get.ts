import { getBooksCount } from '../../utils/book-catalog';
import { hashCacheKey } from '../../utils/cache-key';
import { parseSearchParams } from '#shared/utils/url-state';
import { toBookFilters, toBookQuery } from '#shared/utils/book-utils';
import type { CatalogCountResponse } from '#shared/types/book';

export default defineCachedEventHandler(
  async event => {
    const params = parseSearchParams(getQuery(event));
    const total = await getBooksCount(toBookFilters(toBookQuery(params)));

    return { total } satisfies CatalogCountResponse;
  },
  {
    getKey: event => hashCacheKey(toBookFilters(toBookQuery(parseSearchParams(getQuery(event))))),
    maxAge: 60 * 60,
    name: 'books-count',
    swr: true,
  },
);
