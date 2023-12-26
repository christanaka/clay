import { DATABASE_URL } from '$env/static/private';
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

neonConfig.fetchConnectionCache = true;

export const connect = () => {
	const sql = neon(DATABASE_URL);
	const db = drizzle(sql);

	return { db };
};
