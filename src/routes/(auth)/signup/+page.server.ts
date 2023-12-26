import { users } from '$lib/db/users';
import { connect } from '$lib/server/db';
import { fail, redirect } from '@sveltejs/kit';
import { generateId } from 'lucia';
import { Argon2id } from 'oslo/password';
import type { Actions, PageServerLoad } from './$types';
import { signupSchema } from './schemas';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		redirect(302, '/');
	}
};

export const actions = {
	default: async ({ request }) => {
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
			// TODO: Email verification
		}

		redirect(302, '/login');
	}
} satisfies Actions;
