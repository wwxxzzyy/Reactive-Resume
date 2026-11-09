import * as pg from "drizzle-orm/pg-core";
import { generateId } from "@reactive-resume/utils/string";
import { user } from "./auth";

export const aiCreditTransaction = pg.pgTable(
	"ai_credit_transaction",
	{
		id: pg
			.text("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		amount: pg.integer("amount").notNull(),
		type: pg.text("type").notNull(),
		description: pg.text("description").notNull(),
		packId: pg.text("pack_id"),
		balanceAfter: pg.integer("balance_after").notNull(),
		metadata: pg.jsonb("metadata"),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [pg.index().on(t.userId, t.createdAt.desc())],
);
