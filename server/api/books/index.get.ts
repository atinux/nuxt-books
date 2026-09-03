import { getBooksPage } from '../../utils/book-catalog';
import { hashCacheKey } from '../../utils/cache-key';
import { parseSearchParams } from '#shared/utils/url-state';
import { toBookQuery } from '#shared/utils/book-utils';
import type { CatalogPageResponse } from '#shared/types/book';

export default defineCachedEventHandler(
  async event => {
    const params = parseSearchParams(getQuery(event));
    const query = toBookQuery(params);
    return getBooksPage(query) satisfies Promise<CatalogPageResponse>;
  },
  {
    getKey: event => hashCacheKey(toBookQuery(parseSearchParams(getQuery(event)))),
    maxAge: 60 * 60,
    name: 'books-page',
    swr: true,
  },
);
