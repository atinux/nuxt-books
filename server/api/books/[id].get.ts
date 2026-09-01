import { getBookById } from '../../utils/book-catalog';

export default defineEventHandler(async event => {
  const id = getRouterParam(event, 'id');
  const book = id ? await getBookById(id) : undefined;

  if (!book) {
    throw createError({ status: 404, statusText: 'Book not found' });
  }

  return book;
});
