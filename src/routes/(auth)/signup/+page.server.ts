import { dev } from '$app/environment';
import { emailVerifications } from '$lib/db/email-verification';
import { users } from '$lib/db/users';
import {
	generateEmailVerificationCode,
	generateEmailVerificationToken,
	lucia
} from '$lib/server/auth';
import { connect } from '$lib/server/db';
import { fail, redirect } from '@sveltejs/kit';
import { generateId } from 'lucia';
import { Argon2id } from 'oslo/password';
import { signupSchema } from './schemas';

export const load = async ({ locals }) => {
	if (locals.user) {
		redirect(302, '/');
	}
};

export const actions = {
	default: async ({ cookies, request, url }) => {
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
			const { code, codeExpiresAt } = generateEmailVerificationCode();
			const { token, tokenExpiresAt } = generateEmailVerificationToken();
			await db.insert(emailVerifications).values({
				userId: userId,
				email,
				code,
				codeExpiresAt,
				token,
				tokenExpiresAt
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
				console.log(
					'\x1b[32m',
					' \u279c',
					'\x1b[0m\x1b[1m',
					'Verification Url:',
					'\x1b[36m',
					`${url.protocol}//${url.host}/verifyemail/${token}`,
					'\x1b[0m'
				);
			}

			// TODO: Send email
		}

		redirect(302, '/verifyemail');
	}
};
