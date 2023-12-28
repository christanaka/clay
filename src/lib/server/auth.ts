import { dev } from '$app/environment';
import { sessions } from '$lib/db/sessions';
import { users } from '$lib/db/users';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { Lucia, TimeSpan, generateId } from 'lucia';
import { createDate } from 'oslo';
import { Argon2id } from 'oslo/password';
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

export const hashPassword = async (password: string) => new Argon2id().hash(password);

export const verifyPassword = async (hashedPassword: string, password: string) =>
	new Argon2id().verify(hashedPassword, password);

export const generateEmailVerificationCode = () => {
	return {
		code: generateRandomString(8, alphabet('0-9', 'A-Z')),
		codeExpiresAt: createDate(new TimeSpan(5, 'm'))
	};
};

export const generateEmailVerificationToken = () => {
	return {
		token: generateId(40),
		tokenExpiresAt: createDate(new TimeSpan(2, 'h'))
	};
};

export const generatePasswordResetToken = () => {
	return {
		token: generateId(40),
		tokenExpiresAt: createDate(new TimeSpan(2, 'h'))
	};
};
