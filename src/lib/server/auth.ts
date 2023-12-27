import { dev } from '$app/environment';
import { sessions } from '$lib/db/sessions';
import { users } from '$lib/db/users';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { Lucia } from 'lucia';
import { alphabet, generateRandomString } from 'oslo/random';
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
			isEmailVerified: attributes.isEmailVerified,
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
		isEmailVerified: boolean;
		firstName: string;
		lastName: string;
	}
}

export const generateEmailVerificationCode = () => generateRandomString(8, alphabet('0-9', 'A-Z'));
