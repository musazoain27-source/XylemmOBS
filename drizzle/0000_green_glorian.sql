CREATE TABLE `rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `rate_limits_expiry` ON `rate_limits` (`expires_at`);--> statement-breakpoint
CREATE TABLE `tickets` (
	`id` text PRIMARY KEY NOT NULL,
	`token_hash` text NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`mod_version` text NOT NULL,
	`minecraft` text NOT NULL,
	`gpu` text NOT NULL,
	`settings` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`reply` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tickets_token_hash` ON `tickets` (`token_hash`);--> statement-breakpoint
CREATE INDEX `tickets_status_created` ON `tickets` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `tickets_created` ON `tickets` (`created_at`);