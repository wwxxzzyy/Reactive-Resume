import type { GenerateStarFlashcardInput, StarFlashcardOutput } from "@reactive-resume/schema/career";
import { ORPCError } from "@orpc/client";
import { starFlashcardOutputSchema } from "@reactive-resume/schema/career";
import { aiProvidersService } from "../ai-providers/service";
import { aiDeadline, generateJson } from "../ai/generate-json";
import { getModel } from "../ai/service";

const SYSTEM_PROMPT = `You are an expert interview coach specialized in behavioral interviews and the STARR framework (Situation, Task, Action, Result, Reflection).

Given a candidate's resume bullet point and optional role/company context, generate:
1. question: A realistic behavioral interview question an interviewer would ask that prompts this story (e.g. "Tell me about a time when...").
2. title: A concise, punchy title under 6 words summarizing this achievement or situation.
3. situation: What was happening before starting? Context, problem, constraints, or challenge.
4. task: What was the candidate's specific objective and responsibility?
5. action: What concrete steps, decisions, and strategies did the candidate implement?
6. result: What changed? Measurable outcomes, metrics, or business impact.
7. reflection: What did the candidate learn or what would they do differently next time?
8. tags: Up to 5 relevant competency tags (e.g. ["Problem Solving", "Cloud Architecture", "Cross-Functional"]).

Rules:
- Base claims strictly on what the bullet point states or directly implies; do not invent fictional company names, dates, or unrelated technologies.
- Maintain professional tone suitable for interview talking points.
- Respond with one JSON object strictly matching the schema.
- Language/locale: write in the language requested by the locale parameter (default English).`;

export async function generateStarFlashcard(
	userId: string,
	input: GenerateStarFlashcardInput,
	signal?: AbortSignal,
): Promise<StarFlashcardOutput> {
	const provider = input.providerId
		? await aiProvidersService.getRunnableById({ userId, id: input.providerId })
		: await aiProvidersService.getDefaultRunnable({ userId });

	if (!provider) {
		throw new ORPCError("PRECONDITION_FAILED", {
			message: "Connect an AI provider in Settings → AI & developer to generate interview flashcards.",
		});
	}

	const model = getModel({
		provider: provider.provider,
		model: provider.model,
		apiKey: provider.apiKey,
		...(provider.baseURL ? { baseURL: provider.baseURL } : {}),
	});

	const deadline = aiDeadline(signal);

	const promptContent = {
		locale: input.locale,
		bullet: input.bullet,
		...(input.role ? { role: input.role } : {}),
		...(input.company ? { company: input.company } : {}),
	};

	try {
		return await generateJson(
			model,
			{
				system: SYSTEM_PROMPT,
				prompt: JSON.stringify(promptContent),
			},
			starFlashcardOutputSchema,
			deadline,
			1,
		);
	} catch (error) {
		if (error instanceof ORPCError) throw error;
		throw new ORPCError("INTERNAL_SERVER_ERROR", {
			message: "Failed to generate interview flashcard. Please check your AI provider or try again.",
			cause: error,
		});
	}
}
