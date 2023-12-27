import { emailVerificationCodes } from '$lib/db/email-verification-codes';
import { createInsertSchema } from 'drizzle-zod';

export const verifySchema = createInsertSchema(emailVerificationCodes, {
	code: (schema) => schema.code.min(1, { message: 'Required' }).max(50)
}).pick({
	code: true
});
