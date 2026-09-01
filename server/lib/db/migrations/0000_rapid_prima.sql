CREATE TABLE `authors` (
	`average_rating` real,
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`ratings_count` integer,
	`text_reviews_count` integer
);
--> statement-breakpoint
CREATE TABLE `book_to_author` (
	`author_id` text NOT NULL,
	`book_id` integer NOT NULL,
	PRIMARY KEY(`book_id`, `author_id`),
	FOREIGN KEY (`author_id`) REFERENCES `authors`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `books` (
	`average_rating` real,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`description` text,
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`image_url` text,
	`isbn` text,
	`isbn13` text,
	`language_code` text,
	`num_pages` integer,
	`popular_shelves` text,
	`publication_year` integer,
	`publisher` text,
	`ratings_count` integer,
	`series` text,
	`text_reviews_count` integer,
	`thumbhash` text,
	`title` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `books_isbn_unique` ON `books` (`isbn`);--> statement-breakpoint
CREATE INDEX `idx_books_average_rating` ON `books` (`average_rating`);--> statement-breakpoint
CREATE INDEX `idx_books_id_title_image_url_thumbhash` ON `books` (`id`,`title`,`image_url`,`thumbhash`);--> statement-breakpoint
CREATE INDEX `idx_books_created_at` ON `books` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_books_isbn` ON `books` (`isbn`);--> statement-breakpoint
CREATE INDEX `idx_books_language_code` ON `books` (`language_code`);--> statement-breakpoint
CREATE INDEX `idx_books_num_pages` ON `books` (`num_pages`);--> statement-breakpoint
CREATE INDEX `idx_books_publication_year` ON `books` (`publication_year`);--> statement-breakpoint
CREATE VIRTUAL TABLE `books_fts` USING fts5(
	`title`,
	content='books',
	content_rowid='id',
	tokenize='unicode61 remove_diacritics 2'
);--> statement-breakpoint
CREATE TRIGGER `books_fts_insert` AFTER INSERT ON `books` BEGIN
	INSERT INTO `books_fts` (`rowid`, `title`) VALUES (new.`id`, new.`title`);
END;--> statement-breakpoint
CREATE TRIGGER `books_fts_delete` AFTER DELETE ON `books` BEGIN
	INSERT INTO `books_fts` (`books_fts`, `rowid`, `title`) VALUES ('delete', old.`id`, old.`title`);
END;--> statement-breakpoint
CREATE TRIGGER `books_fts_update` AFTER UPDATE OF `title` ON `books` BEGIN
	INSERT INTO `books_fts` (`books_fts`, `rowid`, `title`) VALUES ('delete', old.`id`, old.`title`);
	INSERT INTO `books_fts` (`rowid`, `title`) VALUES (new.`id`, new.`title`);
END;--> statement-breakpoint
INSERT INTO `books_fts` (`books_fts`) VALUES ('rebuild');
