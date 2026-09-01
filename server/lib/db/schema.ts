import { sql } from 'drizzle-orm';
import { index, integer, primaryKey, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const authors = sqliteTable('authors', {
  average_rating: real('average_rating'),
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  ratings_count: integer('ratings_count'),
  text_reviews_count: integer('text_reviews_count'),
});

export const books = sqliteTable(
  'books',
  {
    average_rating: real('average_rating'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .default(sql`(unixepoch())`)
      .notNull(),
    description: text('description'),
    id: integer('id').primaryKey({ autoIncrement: true }),
    image_url: text('image_url'),
    isbn: text('isbn').unique(),
    isbn13: text('isbn13'),
    language_code: text('language_code'),
    num_pages: integer('num_pages'),
    popular_shelves: text('popular_shelves', { mode: 'json' }).$type<{ count: string; name: string }[] | null>(),
    publication_year: integer('publication_year'),
    publisher: text('publisher'),
    ratings_count: integer('ratings_count'),
    series: text('series', { mode: 'json' }).$type<string[] | null>(),
    text_reviews_count: integer('text_reviews_count'),
    thumbhash: text('thumbhash'),
    title: text('title').notNull(),
  },
  table => [
    index('idx_books_average_rating').on(table.average_rating),
    index('idx_books_id_title_image_url_thumbhash').on(table.id, table.title, table.image_url, table.thumbhash),
    index('idx_books_created_at').on(table.createdAt),
    index('idx_books_isbn').on(table.isbn),
    index('idx_books_language_code').on(table.language_code),
    index('idx_books_num_pages').on(table.num_pages),
    index('idx_books_publication_year').on(table.publication_year),
  ],
);

export const bookToAuthor = sqliteTable(
  'book_to_author',
  {
    authorId: text('author_id')
      .notNull()
      .references(() => authors.id),
    bookId: integer('book_id')
      .notNull()
      .references(() => books.id),
  },
  table => [primaryKey({ columns: [table.bookId, table.authorId] })],
);
