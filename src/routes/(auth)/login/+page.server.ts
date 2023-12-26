import { users } from '$lib/db/users';
import { lucia } from '$lib/server/auth';
import { connect } from '$lib/server/db';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { Argon2id } from 'oslo/password';
import type { Actions, PageServerLoad } from './$types';
import { loginSchema } from './schemas';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		redirect(302, '/');
	}
};

export const actions = {
	default: async ({ cookies, request }) => {
		const formData = await request.formData();
		const formFields = Object.fromEntries(formData);

		const validatedFields = loginSchema.safeParse(formFields);
		if (!validatedFields.success) {
			return fail(400, {
				data: formFields,
				errors: validatedFields.error.flatten().fieldErrors
			});
		}

		const { email, password } = validatedFields.data;

		const { db } = connect();

		const [user] = await db
			.select({
				id: users.id,
				email: users.email,
				hashedPassword: users.hashedPassword,
				firstName: users.firstName,
				lastName: users.lastName
			})
			.from(users)
			.where(eq(users.email, email))
			.limit(1);

		if (!user) {
			return fail(400, {
				data: formFields,
				errors: {
					email: ['Invalid email and/or password'],
					password: undefined
				}
			});
		}

		const isValidPassword = await new Argon2id().verify(user.hashedPassword, password);
		if (!isValidPassword) {
			return fail(400, {
				data: formFields,
				errors: {
					email: ['Invalid email and/or password'],
					password: undefined
				}
			});
		}

		const session = await lucia.createSession(user.id, {
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName
		});
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		redirect(302, '/');
	}
} satisfies Actions;
