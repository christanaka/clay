import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { citext } from './extensions';
import { users } from './users';

export const emailVerifications = pgTable('email_verifications', {
	// Blocked by: https://github.com/drizzle-team/drizzle-kit-mirror/issues/167
	// id: identity('id').primaryKey(),
	id: serial('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.unique()
		.references(() => users.id),
	email: citext('email').notNull(),
	code: text('code').notNull(),
	codeExpiresAt: timestamp('code_expires_at', { withTimezone: true, mode: 'date' }).notNull(),
	token: text('token').notNull(),
	tokenExpiresAt: timestamp('token_expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export type EmailVerification = typeof emailVerifications.$inferSelect;
export type EmailVerificationInsert = typeof emailVerifications.$inferInsert;
