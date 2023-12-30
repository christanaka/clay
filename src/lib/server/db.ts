import { DATABASE_URL } from '$env/static/private';
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

neonConfig.fetchConnectionCache = true;

export const createDbClient = () => {
	const client = neon(DATABASE_URL);
	const db = drizzle(client);

	return { db };
};
