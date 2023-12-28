import { emailVerifications } from '$lib/db/email-verifications';
import { createInsertSchema } from 'drizzle-zod';

export const verifyEmailSchema = createInsertSchema(emailVerifications, {
	code: (schema) => schema.code.min(1, { message: 'Required' }).max(50)
}).pick({
	code: true
});
