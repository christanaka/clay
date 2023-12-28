import { users } from '$lib/db/users';
import { lucia, verifyPassword } from '$lib/server/auth';
import { connect } from '$lib/server/db';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { loginSchema, type LoginSchemaFieldErrors } from './schemas';

export const load = async ({ locals }) => {
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
				hashedPassword: users.hashedPassword
			})
			.from(users)
			.where(eq(users.email, email));

		if (!user) {
			return fail(400, {
				data: formFields,
				errors: {
					email: ['Invalid email and/or password']
				} as LoginSchemaFieldErrors
			});
		}

		const isValidPassword = await verifyPassword(user.hashedPassword, password);
		if (!isValidPassword) {
			return fail(400, {
				data: formFields,
				errors: {
					email: ['Invalid email and/or password']
				} as LoginSchemaFieldErrors
			});
		}

		const session = await lucia.createSession(user.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		redirect(302, '/');
	}
};
