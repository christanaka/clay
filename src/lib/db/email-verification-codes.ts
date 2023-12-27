import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { citext } from './extensions';
import { users } from './users';

export const emailVerificationCodes = pgTable('email_verification_codes', {
	// Blocked by: https://github.com/drizzle-team/drizzle-kit-mirror/issues/167
	// id: identity('id').primaryKey(),
	id: serial('id').primaryKey(),
	code: text('code').notNull(),
	userId: text('user_id')
		.notNull()
		.unique()
		.references(() => users.id),
	email: citext('email').notNull(),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export type EmailVerificationCode = typeof emailVerificationCodes.$inferSelect;
export type EmailVerificationCodeInsert = typeof emailVerificationCodes.$inferInsert;
