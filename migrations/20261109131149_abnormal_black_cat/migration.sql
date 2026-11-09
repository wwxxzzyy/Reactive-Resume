CREATE TABLE "ai_credit_transaction" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"amount" integer NOT NULL,
	"type" text NOT NULL,
	"description" text NOT NULL,
	"pack_id" text,
	"balance_after" integer NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "ai_credits" integer DEFAULT 3 NOT NULL;--> statement-breakpoint
CREATE INDEX "ai_credit_transaction_user_id_created_at_index" ON "ai_credit_transaction" ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
ALTER TABLE "ai_credit_transaction" ADD CONSTRAINT "ai_credit_transaction_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;