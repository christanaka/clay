import { dev } from '$app/environment';
import { emailVerificationCodes } from '$lib/db/email-verification-codes';
import { users } from '$lib/db/users';
import { generateEmailVerificationCode, lucia } from '$lib/server/auth';
import { connect } from '$lib/server/db';
import { fail, redirect } from '@sveltejs/kit';
import { generateId } from 'lucia';
import { TimeSpan, createDate } from 'oslo';
import { Argon2id } from 'oslo/password';
import { signupSchema } from './schemas';

export const load = async ({ locals }) => {
	if (locals.user) {
		redirect(302, '/');
	}
};

export const actions = {
	default: async ({ cookies, request }) => {
		const formData = await request.formData();
		const formFields = Object.fromEntries(formData);

		const validatedFields = signupSchema.safeParse(formFields);
		if (!validatedFields.success) {
			return fail(400, {
				data: formFields,
				errors: validatedFields.error.flatten().fieldErrors
			});
		}

		const { firstName, lastName, email, password } = validatedFields.data;
		const userId = generateId(15);
		const hashedPassword = await new Argon2id().hash(password);

		const { db } = connect();

		const { rowCount: userInsertCount } = await db
			.insert(users)
			.values({
				id: userId,
				email,
				hashedPassword,
				firstName,
				lastName
			})
			.onConflictDoNothing({ target: users.email });

		if (userInsertCount) {
			const code = generateEmailVerificationCode();
			await db.insert(emailVerificationCodes).values({
				userId: userId,
				email,
				code,
				expiresAt: createDate(new TimeSpan(5, 'm'))
			});

			const session = await lucia.createSession(userId, {});
			const sessionCookie = await lucia.createSessionCookie(session.id);
			cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});

			if (dev) {
				console.log('\x1b[32m', ' \u279c', '\x1b[0m\x1b[1m', 'Email:', '\x1b[2m', email, '\x1b[0m');
				console.log(
					'\x1b[32m',
					' \u279c',
					'\x1b[0m\x1b[1m',
					'Verification Code:',
					'\x1b[36m',
					code,
					'\x1b[0m'
				);
			}

			// TODO: Send email
		}

		redirect(302, '/verify');
	}
};
