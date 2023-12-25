import { DATABASE_URL } from '$env/static/private';
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';

const connect = () => {
	const pool = new Pool({ connectionString: DATABASE_URL });
	const db = drizzle(pool);
	return db;
};

export { connect };
