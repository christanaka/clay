import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

const db = drizzle(postgres(process.env.DATABASE_URL!, { ssl: 'require', max: 1 }));

const main = async () => {
	try {
		await migrate(db, { migrationsFolder: 'drizzle' });
		console.log('Migration complete.');
	} catch (error) {
		console.log(error);
	}
	process.exit(0);
};
main();