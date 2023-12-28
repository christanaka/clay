import { z } from 'zod';

export const forgotPasswordTokenSchema = z.object({
	newPassword: z.string().min(1, { message: 'Required' }).max(255)
});
