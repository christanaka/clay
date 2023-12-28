import { dev } from '$app/environment';
import { emailVerifications } from '$lib/db/email-verifications';
import { users } from '$lib/db/users';
import {
	generateEmailVerificationCode,
	generateEmailVerificationToken,
	hashPassword,
	lucia
} from '$lib/server/auth';
import { connect } from '$lib/server/db';
import { logger } from '$lib/server/logger';
import { fail, redirect } from '@sveltejs/kit';
import { generateId } from 'lucia';
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
		const hashedPassword = await hashPassword(password);

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

		if (!userInsertCount) {
			redirect(302, '/verify-email');
		}

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

		const verifyEmailUrl = `${url.protocol}//${url.host}/verify-email/${token}`;

		if (dev) {
			logger.debug('Email', email);
			logger.debug('Verification Code', code);
			logger.debug('Verification Link', verifyEmailUrl);
		}

		// TODO: Send email

		redirect(302, '/verify-email');
	}
};
