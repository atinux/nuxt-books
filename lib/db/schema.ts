import { sql } from 'drizzle-orm';
import { pgTable, serial, text, integer, timestamp, decimal, json, primaryKey, index } from 'drizzle-orm/pg-core';

export const authors = pgTable('authors', {
  average_rating: decimal('average_rating', { precision: 3, scale: 2 }),
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  ratings_count: integer('ratings_count'),
  text_reviews_count: integer('text_reviews_count'),
});

export const books = pgTable(
  'books',
  {
    average_rating: decimal('average_rating', { precision: 3, scale: 2 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    description: text('description'),
    id: serial('id').primaryKey(),
    image_url: text('image_url'),
    isbn: text('isbn').unique(),
    isbn13: text('isbn13'),
    language_code: text('language_code'),
    num_pages: integer('num_pages'),
    popular_shelves: json('popular_shelves'),
    publication_year: integer('publication_year'),
    publisher: text('publisher'),
    ratings_count: integer('ratings_count'),
    series: text('series').array(),
    text_reviews_count: integer('text_reviews_count'),
    thumbhash: text('thumbhash'),
    title: text('title').notNull(),
    title_tsv: text('title_tsv').notNull(),
  },
  table => ({
    averageRatingIdx: index('idx_books_average_rating').on(table.average_rating),
    coveringIdx: index('idx_books_id_title_image_url_thumbhash').on(
      table.id,
      table.title,
      table.image_url,
      table.thumbhash,
    ),
    createdAtIdx: index('idx_books_created_at').on(table.createdAt),
    isbnIdx: index('idx_books_isbn').on(table.isbn),
    languageCodeIdx: index('idx_books_language_code').on(table.language_code),
    numPagesIdx: index('idx_books_num_pages').on(table.num_pages),
    publicationYearIdx: index('idx_books_publication_year').on(table.publication_year),
    titleTsvIdx: index('idx_books_title_tsv').using('gin', sql`to_tsvector('english', ${table.title_tsv})`),
  }),
);

export const bookToAuthor = pgTable(
  'book_to_author',
  {
    authorId: text('author_id')
      .notNull()
      .references(() => authors.id),
    bookId: integer('book_id')
      .notNull()
      .references(() => books.id),
  },
  t => ({
    pk: primaryKey({ columns: [t.bookId, t.authorId] }),
  }),
);
