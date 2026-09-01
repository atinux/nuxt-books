CREATE EXTENSION IF NOT EXISTS "unaccent";
--> statement-breakpoint
CREATE TABLE "authors" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"average_rating" numeric(3, 2),
	"text_reviews_count" integer,
	"ratings_count" integer
);
--> statement-breakpoint
CREATE TABLE "book_to_author" (
	"book_id" integer NOT NULL,
	"author_id" text NOT NULL,
	CONSTRAINT "book_to_author_book_id_author_id_pk" PRIMARY KEY("book_id","author_id")
);
--> statement-breakpoint
CREATE TABLE "books" (
	"id" serial PRIMARY KEY NOT NULL,
	"isbn" text,
	"isbn13" text,
	"title" text NOT NULL,
	"publication_year" integer,
	"publisher" text,
	"image_url" text,
	"description" text,
	"num_pages" integer,
	"language_code" text,
	"text_reviews_count" integer,
	"ratings_count" integer,
	"average_rating" numeric(3, 2),
	"series" text[],
	"popular_shelves" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"title_tsv" text NOT NULL,
	"thumbhash" text,
	CONSTRAINT "books_isbn_unique" UNIQUE("isbn")
);
--> statement-breakpoint
ALTER TABLE "book_to_author" ADD CONSTRAINT "book_to_author_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_to_author" ADD CONSTRAINT "book_to_author_author_id_authors_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."authors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_books_title_tsv" ON "books" USING gin (to_tsvector('english', "title_tsv"));--> statement-breakpoint
CREATE INDEX "idx_books_publication_year" ON "books" USING btree ("publication_year");--> statement-breakpoint
CREATE INDEX "idx_books_average_rating" ON "books" USING btree ("average_rating");--> statement-breakpoint
CREATE INDEX "idx_books_language_code" ON "books" USING btree ("language_code");--> statement-breakpoint
CREATE INDEX "idx_books_num_pages" ON "books" USING btree ("num_pages");--> statement-breakpoint
CREATE INDEX "idx_books_created_at" ON "books" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_books_isbn" ON "books" USING btree ("isbn");--> statement-breakpoint
CREATE INDEX "idx_books_id_title_image_url_thumbhash" ON "books" USING btree ("id","title","image_url","thumbhash");
