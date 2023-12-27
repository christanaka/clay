import { users } from '$lib/db/users';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const signupSchema = createInsertSchema(users, {
	firstName: (schema) =>
		schema.firstName
			.trim()
			.min(1, { message: 'Required' })
			.max(50)
			.regex(/^[a-zA-Z]+$/, { message: 'Invalid' }),
	lastName: (schema) =>
		schema.lastName
			.trim()
			.min(1, { message: 'Required' })
			.max(50)
			.regex(/^[a-zA-Z]+$/, { message: 'Invalid' }),
	email: z.string().trim().min(1, { message: 'Required' }).email().max(320)
})
	.pick({
		firstName: true,
		lastName: true,
		email: true
	})
	.extend({
		password: z
			.string()
			.min(1, { message: 'Required' })
			.min(6, { message: 'Must be at least 6 characters' })
			.max(255),
		agreeToTerms: z
			.string()
			.optional()
			.refine((val) => val === 'on', {
				message: 'Terms must be agreed to before creating an account'
			})
	});
