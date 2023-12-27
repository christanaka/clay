import { emailVerifications } from '$lib/db/email-verification';
import { users } from '$lib/db/users';
import { lucia } from '$lib/server/auth';
import { connect } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';
import { and, eq, sql } from 'drizzle-orm';
import { isWithinExpirationDate } from 'oslo';

export const load = async ({ cookies, params }) => {
	const token = params.token;

	if (token) {
		const { db } = connect();

		const [emailVerification] = await db
			.delete(emailVerifications)
			.where(and(eq(emailVerifications.token, token)))
			.returning({
				userId: emailVerifications.userId,
				tokenExpiresAt: emailVerifications.tokenExpiresAt
			});

		if (!emailVerification || !isWithinExpirationDate(emailVerification.tokenExpiresAt)) {
			return {
				isTokenValid: false
			};
		}

		await lucia.invalidateUserSessions(emailVerification.userId);

		await db
			.update(users)
			.set({ isEmailVerified: true, updatedAt: sql`(NOW() AT TIME ZONE 'utc'::text)` })
			.where(eq(users.id, emailVerification.userId));

		const session = await lucia.createSession(emailVerification.userId, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		redirect(302, '/');
	}
};
