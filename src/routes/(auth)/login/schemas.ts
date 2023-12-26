import { users } from '$lib/db/users';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const loginSchema = createSelectSchema(users, {
	email: z.string().trim().min(1, { message: 'Required' }).email().max(320)
})
	.pick({ email: true })
	.extend({
		password: z.string().min(1, { message: 'Required' }).max(255)
	});
