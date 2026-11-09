import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { ORPCError } from "@orpc/client";
import { generateStarFlashcard } from "./star-flashcards";

const mocks = vi.hoisted(() => ({
	getDefaultRunnable: vi.fn(),
	getRunnableById: vi.fn(),
	generateJson: vi.fn(),
	getModel: vi.fn(),
}));

vi.mock("../ai-providers/service", () => ({
	aiProvidersService: {
		getDefaultRunnable: mocks.getDefaultRunnable,
		getRunnableById: mocks.getRunnableById,
	},
}));

vi.mock("../ai/service", () => ({
	getModel: mocks.getModel,
}));

vi.mock("../ai/generate-json", () => ({
	aiDeadline: () => AbortSignal.timeout(1000),
	generateJson: mocks.generateJson,
}));

describe("generateStarFlashcard", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("throws PRECONDITION_FAILED when no AI provider is configured", async () => {
		mocks.getDefaultRunnable.mockResolvedValue(null);

		await expect(
			generateStarFlashcard("user-1", {
				bullet: "Built real-time analytics pipeline using Kafka and Go.",
				locale: "en-US",
			}),
		).rejects.toThrow(ORPCError);

		await expect(
			generateStarFlashcard("user-1", {
				bullet: "Built real-time analytics pipeline using Kafka and Go.",
				locale: "en-US",
			}),
		).rejects.toMatchObject({
			code: "PRECONDITION_FAILED",
			message: expect.stringContaining("Connect an AI provider"),
		});
	});

	it("successfully generates a STAR flashcard using default provider", async () => {
		mocks.getDefaultRunnable.mockResolvedValue({
			id: "provider-1",
			provider: "openai",
			model: "gpt-4o-mini",
			apiKey: "sk-test",
		});
		mocks.getModel.mockReturnValue({});

		const expectedOutput = {
			question: "Tell me about a time you engineered a real-time data system under high load.",
			title: "Real-time Kafka Analytics Pipeline",
			situation: "Legacy batch ETL jobs caused 4-hour delay in operational metrics.",
			task: "Architect and deliver a sub-second streaming analytics solution.",
			action: "Built distributed consumers in Go and partitioned Kafka topics by client ID.",
			result: "Reduced metric delivery latency from 4 hours to 250ms with 99.99% uptime.",
			reflection: "Would introduce dead-letter queues earlier in staging.",
			tags: ["Go", "Kafka", "Streaming Architecture"],
		};
		mocks.generateJson.mockResolvedValue(expectedOutput);

		const result = await generateStarFlashcard("user-1", {
			bullet: "Built real-time analytics pipeline using Kafka and Go, reducing delay to 250ms.",
			role: "Senior Backend Engineer",
			company: "FinTech Corp",
			locale: "en-US",
		});

		expect(result).toEqual(expectedOutput);
		expect(mocks.getDefaultRunnable).toHaveBeenCalledWith({ userId: "user-1" });
		expect(mocks.generateJson).toHaveBeenCalled();
	});

	it("uses specific providerId when supplied in input", async () => {
		mocks.getRunnableById.mockResolvedValue({
			id: "custom-provider",
			provider: "anthropic",
			model: "claude-3-5-sonnet",
			apiKey: "sk-ant",
		});
		mocks.getModel.mockReturnValue({});
		mocks.generateJson.mockResolvedValue({
			question: "How do you handle streaming reliability?",
			title: "Pipeline",
			situation: "S",
			task: "T",
			action: "A",
			result: "R",
			reflection: "R",
			tags: [],
		});

		await generateStarFlashcard("user-1", {
			providerId: "custom-provider",
			bullet: "Built streaming pipeline with zero data loss.",
			locale: "en-US",
		});

		expect(mocks.getRunnableById).toHaveBeenCalledWith({ userId: "user-1", id: "custom-provider" });
		expect(mocks.getDefaultRunnable).not.toHaveBeenCalled();
	});
});
