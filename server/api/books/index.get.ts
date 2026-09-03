import { getBooksPage } from '../../utils/book-catalog';
import { parseSearchParams } from '#shared/utils/url-state';
import { toBookQuery } from '#shared/utils/book-utils';
import type { CatalogPageResponse } from '#shared/types/book';

export default defineEventHandler(async event => {
  const params = parseSearchParams(getQuery(event));
  const query = toBookQuery(params);
  return getBooksPage(query) satisfies Promise<CatalogPageResponse>;
});
