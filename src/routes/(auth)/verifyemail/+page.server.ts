import { emailVerifications } from '$lib/db/email-verification';
import { users } from '$lib/db/users';
import { lucia } from '$lib/server/auth';
import { connect } from '$lib/server/db';
import { fail, redirect } from '@sveltejs/kit';
import { and, eq, sql } from 'drizzle-orm';
import { isWithinExpirationDate } from 'oslo';
import { verifyEmailSchema } from './schemas';

export const actions = {
	default: async ({ cookies, locals, request }) => {
		if (!locals.user) {
			return fail(401);
		}

		const formData = await request.formData();
		const formFields = Object.fromEntries(formData);

		const validatedFields = verifyEmailSchema.safeParse(formFields);
		if (!validatedFields.success) {
			return fail(400, {
				data: formFields,
				errors: validatedFields.error.flatten().fieldErrors
			});
		}

		const { code } = validatedFields.data;

		const { db } = connect();

		const [emailVerification] = await db
			.delete(emailVerifications)
			.where(
				and(
					eq(emailVerifications.userId, locals.user.id),
					eq(emailVerifications.email, locals.user.email),
					eq(emailVerifications.code, code)
				)
			)
			.returning({
				codeExpiresAt: emailVerifications.codeExpiresAt,
				email: emailVerifications.email
			});

		if (!emailVerification || !isWithinExpirationDate(emailVerification.codeExpiresAt)) {
			return fail(400, {
				data: formFields,
				errors: { code: ['Code is invalid or has expired'] }
			});
		}

		await lucia.invalidateUserSessions(locals.user.id);

		await db
			.update(users)
			.set({ isEmailVerified: true, updatedAt: sql`(NOW() AT TIME ZONE 'utc'::text)` })
			.where(eq(users.id, locals.user.id));

		const session = await lucia.createSession(locals.user.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		redirect(302, '/');
	}
};
