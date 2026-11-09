import * as pg from "drizzle-orm/pg-core";

export const serverAiConfig = pg.pgTable("server_ai_config", {
	id: pg.text("id").primaryKey().default("default"),
	provider: pg.text("provider").notNull(),
	model: pg.text("model").notNull(),
	baseUrl: pg.text("base_url"),
	encryptedApiKey: pg.text("encrypted_api_key").notNull(),
	apiKeySalt: pg.text("api_key_salt").notNull(),
	apiKeyHash: pg.text("api_key_hash").notNull(),
	apiKeyPreview: pg.text("api_key_preview").notNull(),
	enabled: pg.boolean("enabled").notNull().default(true),
	testStatus: pg.text("test_status").notNull().default("untested"),
	testError: pg.text("test_error"),
	lastTestedAt: pg.timestamp("last_tested_at", { withTimezone: true }),
	updatedAt: pg
		.timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
});
