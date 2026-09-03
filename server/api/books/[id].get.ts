import { getBookById } from '../../utils/book-catalog';
import { hashCacheKey } from '../../utils/cache-key';

export default defineCachedEventHandler(
  async event => {
    const id = getRouterParam(event, 'id');
    const book = id ? await getBookById(id) : undefined;

    if (!book) {
      throw createError({ status: 404, statusText: 'Book not found' });
    }

    return book;
  },
  {
    getKey: event => hashCacheKey(getRouterParam(event, 'id')),
    maxAge: 60 * 60,
    name: 'book-detail',
    swr: true,
  },
);
