import { lucia } from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';

export const load = async () => {
	redirect(302, '/');
};

export const actions = {
	default: async ({ cookies, locals }) => {
		if (!locals.session) {
			return fail(401);
		}

		await lucia.invalidateSession(locals.session.id);
		const sessionCookie = lucia.createBlankSessionCookie();
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		redirect(302, '/login');
	}
};
