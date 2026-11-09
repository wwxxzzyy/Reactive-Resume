import type { AIProvider } from "@reactive-resume/ai/types";
import { ORPCError } from "@orpc/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@reactive-resume/db/client";
import { aiProvider, serverAiConfig } from "@reactive-resume/db/schema";
import { env } from "@reactive-resume/env/server";
import { decryptCredential, encryptCredential } from "../ai/credentials";
import { testConnection } from "../ai/service";

function validateBaseUrl(url?: string | null): string | null {
	if (!url) return null;
	const trimmed = url.trim();
	if (!trimmed) return null;
	if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
		throw new ORPCError("BAD_REQUEST", { message: "Base URL must start with http:// or https://" });
	}
	try {
		const parsed = new URL(trimmed);
		if (parsed.username || parsed.password) {
			throw new ORPCError("BAD_REQUEST", { message: "Credentials are not allowed in Base URL." });
		}
		return trimmed;
	} catch {
		throw new ORPCError("BAD_REQUEST", { message: "Invalid Base URL format." });
	}
}

export const serverAiService = {
	async getConfig() {
		const [dbRow] = await db.select().from(serverAiConfig).where(eq(serverAiConfig.id, "default")).limit(1);

		if (dbRow) {
			return {
				configured: true,
				source: "database" as const,
				provider: dbRow.provider,
				model: dbRow.model,
				baseUrl: dbRow.baseUrl,
				enabled: dbRow.enabled,
				testStatus: dbRow.testStatus,
				testError: dbRow.testError,
				apiKeyPreview: dbRow.apiKeyPreview,
				lastTestedAt: dbRow.lastTestedAt,
				updatedAt: dbRow.updatedAt,
			};
		}

		if (env.AI_PROVIDER && env.AI_MODEL) {
			const preview = env.AI_API_KEY
				? `${env.AI_API_KEY.slice(0, 4)}•••••••${env.AI_API_KEY.slice(-4)}`
				: "Managed by server";

			return {
				configured: true,
				source: "environment" as const,
				provider: env.AI_PROVIDER,
				model: env.AI_MODEL,
				baseUrl: env.AI_BASE_URL ?? null,
				enabled: true,
				testStatus: "success",
				testError: null,
				apiKeyPreview: preview,
				lastTestedAt: null,
				updatedAt: null,
			};
		}

		return {
			configured: false,
			source: "none" as const,
			provider: null,
			model: null,
			baseUrl: null,
			enabled: false,
			testStatus: "unconfigured",
			testError: null,
			apiKeyPreview: "",
			lastTestedAt: null,
			updatedAt: null,
		};
	},

	async testConfig(input: {
		provider: AIProvider;
		model: string;
		apiKey?: string | undefined;
		baseUrl?: string | null | undefined;
	}) {
		let keyToTest = input.apiKey?.trim();

		// If key not supplied in test request, retrieve existing key from database
		if (!keyToTest) {
			const [dbRow] = await db.select().from(serverAiConfig).where(eq(serverAiConfig.id, "default")).limit(1);

			if (dbRow && dbRow.encryptedApiKey) {
				try {
					keyToTest = decryptCredential(dbRow.encryptedApiKey);
				} catch {
					throw new ORPCError("BAD_REQUEST", {
						message: "Existing key could not be decrypted. Enter a new key.",
					});
				}
			} else if (env.AI_API_KEY) {
				keyToTest = env.AI_API_KEY;
			}
		}

		if (!keyToTest && input.provider !== "ollama") {
			throw new ORPCError("BAD_REQUEST", { message: "API key is required to test the connection." });
		}

		const safeBaseUrl = validateBaseUrl(input.baseUrl);

		const result = await testConnection({
			provider: input.provider,
			model: input.model.trim(),
			apiKey: keyToTest || "",
			baseURL: safeBaseUrl || "",
		});

		if (!result.ok) {
			return {
				success: false,
				message: result.message,
				kind: result.kind,
			};
		}

		return {
			success: true,
			message: `Connection successful! ${input.provider} model "${input.model}" is active and responding.`,
			kind: "success",
		};
	},

	async saveConfig(input: {
		provider: AIProvider;
		model: string;
		apiKey?: string | undefined;
		baseUrl?: string | null | undefined;
		enabled?: boolean | undefined;
	}) {
		const [existing] = await db.select().from(serverAiConfig).where(eq(serverAiConfig.id, "default")).limit(1);

		let storedEncryptedApiKey = existing?.encryptedApiKey;
		let storedSalt = existing?.apiKeySalt;
		let storedHash = existing?.apiKeyHash;
		let storedPreview = existing?.apiKeyPreview;

		if (input.apiKey && input.apiKey.trim().length > 0) {
			const encrypted = encryptCredential(input.apiKey.trim());
			storedEncryptedApiKey = encrypted.encryptedApiKey;
			storedSalt = encrypted.apiKeySalt;
			storedHash = encrypted.apiKeyHash;
			storedPreview = encrypted.apiKeyPreview;
		}

		if (!storedEncryptedApiKey && input.provider !== "ollama") {
			throw new ORPCError("BAD_REQUEST", { message: "API key is required." });
		}

		// Test connection before saving
		let decryptedKey = input.apiKey?.trim();
		if (!decryptedKey && storedEncryptedApiKey) {
			decryptedKey = decryptCredential(storedEncryptedApiKey);
		}

		const safeBaseUrl = validateBaseUrl(input.baseUrl);

		const testResult = await testConnection({
			provider: input.provider,
			model: input.model.trim(),
			apiKey: decryptedKey || "",
			baseURL: safeBaseUrl || "",
		});

		const testStatus = testResult.ok ? "success" : "error";
		const testError = testResult.ok ? null : testResult.message;
		const lastTestedAt = new Date();

		const values = {
			id: "default",
			provider: input.provider,
			model: input.model.trim(),
			baseUrl: safeBaseUrl,
			encryptedApiKey: storedEncryptedApiKey || "",
			apiKeySalt: storedSalt || "",
			apiKeyHash: storedHash || "",
			apiKeyPreview: storedPreview || "None (Ollama)",
			enabled: input.enabled ?? true,
			testStatus,
			testError,
			lastTestedAt,
		};

		await db.insert(serverAiConfig).values(values).onConflictDoUpdate({
			target: serverAiConfig.id,
			set: values,
		});

		// Refresh mirror records in aiProvider table
		if (values.enabled && testResult.ok) {
			await db.delete(aiProvider).where(sql`${aiProvider.id} LIKE 'server-ai:%'`);
		}

		return {
			success: true,
			provider: values.provider,
			model: values.model,
			testStatus,
			testError,
			message: testResult.ok
				? `Server-wide AI successfully configured and activated using ${values.provider} (${values.model}).`
				: `Saved, but connection test failed: ${testResult.message}`,
		};
	},

	async deleteConfig() {
		await db.delete(serverAiConfig).where(eq(serverAiConfig.id, "default"));
		await db.delete(aiProvider).where(sql`${aiProvider.id} LIKE 'server-ai:%'`);
		return { success: true };
	},
};
