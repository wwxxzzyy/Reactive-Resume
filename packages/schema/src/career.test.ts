import { describe, expect, it } from "vite-plus/test";
import {
	careerOfferInputSchema,
	careerProfileDataSchema,
	generateStarFlashcardInputSchema,
	starFlashcardOutputSchema,
} from "./career";

describe("careerProfileDataSchema searchRegions", () => {
	it("leaves searchRegions absent when the input has none", () => {
		const parsed = careerProfileDataSchema.parse({});

		expect(parsed.searchRegions).toBeUndefined();
		expect(Object.hasOwn(parsed, "searchRegions")).toBe(false);
	});

	it("keeps chosen countries, an empty list and null", () => {
		expect(careerProfileDataSchema.parse({ searchRegions: ["SG"] }).searchRegions).toEqual(["SG"]);
		expect(careerProfileDataSchema.parse({ searchRegions: [] }).searchRegions).toEqual([]);
		expect(careerProfileDataSchema.parse({ searchRegions: null }).searchRegions).toBeNull();
	});

	it("rejects invalid search regions", () => {
		expect(careerProfileDataSchema.safeParse({ searchRegions: ["XX"] }).success).toBe(false);
		expect(careerProfileDataSchema.safeParse({ searchRegions: ["SG", "SG"] }).success).toBe(false);
		expect(careerProfileDataSchema.safeParse({ searchRegions: ["SG", "AU", "DE", "FR"] }).success).toBe(false);
	});
});

describe("manual offer input", () => {
	const input = { applicationId: "application", currency: "EUR", period: "year", base: 95000, variable: null };
	it("keeps unknown amounts distinct from zero and preserves explicit terms", () => {
		expect(careerOfferInputSchema.parse({ ...input, base: null, variable: 0, period: "hour" })).toMatchObject({
			base: null,
			variable: 0,
			learning: null,
			period: "hour",
		});
	});
	it.each([
		{ applicationId: "" },
		{ currency: "eur" },
		{ currency: "EURO" },
		{ period: "week" },
		{ base: -1 },
		{ variable: Infinity },
		{ learning: -1 },
		{ officeDays: 6 },
		{ officeDays: 1.5 },
		{ equity: "x".repeat(1001) },
		{ respondBy: "tomorrow" },
	])("rejects invalid terms %j", (patch) => {
		expect(careerOfferInputSchema.safeParse({ ...input, ...patch }).success).toBe(false);
	});
});

describe("generateStarFlashcard schemas", () => {
	it("validates valid flashcard input and applies defaults", () => {
		const parsed = generateStarFlashcardInputSchema.parse({
			bullet: "Led cross-functional team of 6 engineers to rewrite payment pipeline, cutting checkout drop-off by 14%.",
		});
		expect(parsed.bullet).toContain("Led cross-functional team");
		expect(parsed.locale).toBe("en-US");
		expect(parsed.providerId).toBeUndefined();
	});

	it("rejects input with bullet too short", () => {
		expect(generateStarFlashcardInputSchema.safeParse({ bullet: "tiny" }).success).toBe(false);
	});

	it("validates valid flashcard output", () => {
		const parsed = starFlashcardOutputSchema.parse({
			question: "Tell me about a time you optimized a critical flow.",
			title: "Payment Pipeline Rewrite",
			situation: "Legacy payment service had high checkout friction and failure rates.",
			task: "Led redesign of transaction processing pipeline under tight deadline.",
			action: "Adopted asynchronous event-driven queues and streamlined gateway retries.",
			result: "Cut checkout drop-off by 14% and boosted transaction throughput 2.5x.",
			reflection: "Would invest earlier in automated canary deployments.",
			tags: ["Leadership", "Architecture", "Payments"],
		});
		expect(parsed.tags).toEqual(["Leadership", "Architecture", "Payments"]);
		expect(parsed.title).toBe("Payment Pipeline Rewrite");
	});
});
