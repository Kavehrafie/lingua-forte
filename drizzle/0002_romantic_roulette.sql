CREATE TABLE `interview_slot` (
	`id` text PRIMARY KEY NOT NULL,
	`starts_at` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `interview_slot_starts_at_unique` ON `interview_slot` (`starts_at`);--> statement-breakpoint
CREATE TABLE `signup` (
	`id` text PRIMARY KEY NOT NULL,
	`full_name` text NOT NULL,
	`email` text NOT NULL,
	`course_title` text NOT NULL,
	`booked_for` integer NOT NULL,
	`note` text,
	`status` text DEFAULT 'confirmed' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
