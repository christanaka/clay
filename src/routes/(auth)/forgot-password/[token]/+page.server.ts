import { passwordResets } from '$lib/db/password-resets';
import { users } from '$lib/db/users';
import { hashPassword, lucia } from '$lib/server/auth';
import { connect } from '$lib/server/db';
import { fail, redirect } from '@sveltejs/kit';
import { eq, sql } from 'drizzle-orm';
import { isWithinExpirationDate } from 'oslo';
import { forgotPasswordTokenSchema } from './schemas';

export const actions = {
	default: async ({ cookies, params, request }) => {
		const formData = await request.formData();
		const formFields = Object.fromEntries(formData);

		const validatedFields = forgotPasswordTokenSchema.safeParse(formFields);
		if (!validatedFields.success) {
			return fail(400, {
				data: formFields,
				errors: validatedFields.error.flatten().fieldErrors
			});
		}

		const { newPassword } = validatedFields.data;

		const { db } = connect();

		const [passwordReset] = await db
			.delete(passwordResets)
			.where(eq(passwordResets.id, params.token))
			.returning({
				userId: passwordResets.userId,
				expiresAt: passwordResets.expiresAt
			});

		if (!passwordReset || !isWithinExpirationDate(passwordReset.expiresAt)) {
			return fail(400, {
				data: formFields,
				errors: { newPassword: ['Password reset link is invalid or has expired.'] }
			});
		}

		await lucia.invalidateUserSessions(passwordReset.userId);

		const hashedPassword = await hashPassword(newPassword);
		await db
			.update(users)
			.set({ hashedPassword, updatedAt: sql`(NOW() AT TIME ZONE 'utc'::text)` })
			.where(eq(users.id, passwordReset.userId));

		// TODO: Send email

		const session = await lucia.createSession(passwordReset.userId, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		redirect(302, '/');
	}
};
