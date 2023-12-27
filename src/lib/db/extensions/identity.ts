import { customType } from 'drizzle-orm/pg-core';

export const identity = customType<{ data: number; notNull: true; default: true }>({
	dataType() {
		return 'integer generated always as identity';
	}
});
