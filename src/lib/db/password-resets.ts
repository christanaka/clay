import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

export const passwordResets = pgTable('password-resets', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export type PasswordReset = typeof passwordResets.$inferSelect;
export type PasswordResetInsert = typeof passwordResets.$inferInsert;
