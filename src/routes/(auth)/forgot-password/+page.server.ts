import { dev } from '$app/environment';
import { passwordResets } from '$lib/db/password-resets';
import { users } from '$lib/db/users';
import { generatePasswordResetToken } from '$lib/server/auth';
import { createDbClient } from '$lib/server/db';
import { logger } from '$lib/server/logger';
import { fail } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { forgotPasswordSchema } from './schemas';

export const actions = {
	default: async ({ request, url }) => {
		const formData = await request.formData();
		const formFields = Object.fromEntries(formData);

		const validatedFields = forgotPasswordSchema.safeParse(formFields);
		if (!validatedFields.success) {
			return fail(400, {
				data: formFields,
				errors: validatedFields.error.flatten().fieldErrors
			});
		}

		const { email } = validatedFields.data;

		const { db } = createDbClient();

		const [user] = await db
			.select({ id: users.id })
			.from(users)
			.where(and(eq(users.email, email), eq(users.isEmailVerified, true)));

		if (!user) {
			return { success: true };
		}

		await db.delete(passwordResets).where(eq(passwordResets.userId, user.id));

		const { token, tokenExpiresAt } = generatePasswordResetToken();

		await db.insert(passwordResets).values({
			id: token,
			userId: user.id,
			expiresAt: tokenExpiresAt
		});

		const passwordResetUrl = `${url.protocol}//${url.host}/forgot-password/${token}`;

		if (dev) {
			logger.debug('Email', email);
			logger.debug('Password Reset Link', passwordResetUrl, 'cyan');
		}

		// TODO: Send email

		return { success: true };
	}
};
