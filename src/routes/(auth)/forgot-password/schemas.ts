import { z } from 'zod';

export const forgotPasswordSchema = z.object({
	email: z.string().trim().min(1, { message: 'Required' }).email().max(320)
});
