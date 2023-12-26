import { dev } from '$app/environment';
import { sessions } from '$lib/db/sessions';
import { users } from '$lib/db/users';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { Lucia } from 'lucia';
import { connect } from './db';

const { db } = connect();

const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: !dev
		}
	},
	getUserAttributes: (attributes) => {
		return {
			email: attributes.email,
			firstName: attributes.firstName,
			lastName: attributes.lastName
		};
	}
});

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
	}
	interface DatabaseUserAttributes {
		email: string;
		firstName: string;
		lastName: string;
	}
}
