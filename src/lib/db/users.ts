import { sql } from 'drizzle-orm';
import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { citext } from './extensions/citext';

export const users = pgTable('users', {
	id: text('id').primaryKey(),
	email: citext('email').notNull().unique(),
	firstName: text('first_name').notNull(),
	lastName: text('last_name').notNull(),
	hashedPassword: text('hashed_password').notNull(),
	emailVerified: boolean('email_verified').notNull().default(false),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
		.notNull()
		.default(sql`(NOW() AT TIME ZONE 'utc'::text)`),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
		.notNull()
		.default(sql`(NOW() AT TIME ZONE 'utc'::text)`),
	isDeleted: boolean('is_deleted').notNull().default(false)
});

export type User = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;
