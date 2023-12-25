import { sql } from 'drizzle-orm';
import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
	id: text('id').primaryKey(),
	email: text('email').notNull().unique(),
	hashedPassword: text('hashed_password'),
	emailVerified: boolean('email_verified').notNull(),
	firstName: text('first_name'),
	lastName: text('last_name'),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
		.notNull()
		.default(sql`(NOW() AT TIME ZONE 'utc'::text)`),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
		.notNull()
		.default(sql`(NOW() AT TIME ZONE 'utc'::text)`),
	isDeleted: boolean('is_deleted').notNull()
});

export type User = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;
