CREATE TABLE "server_ai_config" (
	"id" text PRIMARY KEY DEFAULT 'default',
	"provider" text NOT NULL,
	"model" text NOT NULL,
	"base_url" text,
	"encrypted_api_key" text NOT NULL,
	"api_key_salt" text NOT NULL,
	"api_key_hash" text NOT NULL,
	"api_key_preview" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"test_status" text DEFAULT 'untested' NOT NULL,
	"test_error" text,
	"last_tested_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
