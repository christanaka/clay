import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const client = postgres(process.env.DATABASE_URL!, { ssl: 'require', max: 1 });
const db = drizzle(client);

const main = async () => {
	try {
		await migrate(db, { migrationsFolder: 'drizzle' });
		console.log('Migration complete.');
		process.exit(0);
	} catch (error) {
		console.log(error);
		process.exit(1);
	}
};

main();
