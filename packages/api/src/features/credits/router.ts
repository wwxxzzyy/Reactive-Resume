import z from "zod";
import { adminProcedure, protectedProcedure } from "../../context";
import { CREDIT_COSTS, CREDIT_PACKS } from "./packs";
import { creditsService } from "./service";

export const creditsRouter = {
	getBalance: protectedProcedure
		.route({
			method: "GET",
			path: "/credits/balance",
			tags: ["Credits"],
			summary: "Get current user's AI credits balance",
		})
		.input(z.object({}).optional())
		.output(
			z.object({
				credits: z.number(),
				totalTransactions: z.number(),
			}),
		)
		.handler(({ context }) => creditsService.getBalance(context.user.id)),

	getPacks: protectedProcedure
		.route({
			method: "GET",
			path: "/credits/packs",
			tags: ["Credits"],
			summary: "Get available AI credit packs and cost breakdown",
		})
		.input(z.object({}).optional())
		.output(
			z.object({
				packs: z.array(
					z.object({
						id: z.enum(["starter", "hunter", "executive"]),
						name: z.string(),
						credits: z.number(),
						price: z.number(),
						priceDisplay: z.string(),
						badge: z.string().optional(),
						popular: z.boolean().optional(),
						perCreditDisplay: z.string(),
						savingsDisplay: z.string().optional(),
						description: z.string(),
						features: z.array(z.string()),
					}),
				),
				costs: z.record(z.string(), z.number()),
			}),
		)
		.handler(() => ({
			packs: CREDIT_PACKS,
			costs: CREDIT_COSTS,
		})),

	getTransactions: protectedProcedure
		.route({
			method: "GET",
			path: "/credits/transactions",
			tags: ["Credits"],
			summary: "Get user's AI credit transaction ledger",
		})
		.input(
			z.object({
				limit: z.number().min(1).max(100).default(20),
				offset: z.number().min(0).default(0),
			}),
		)
		.output(
			z.object({
				items: z.array(
					z.object({
						id: z.string(),
						amount: z.number(),
						type: z.string(),
						description: z.string(),
						packId: z.string().nullable(),
						balanceAfter: z.number(),
						createdAt: z.date(),
					}),
				),
				total: z.number(),
				limit: z.number(),
				offset: z.number(),
			}),
		)
		.handler(({ context, input }) => creditsService.getTransactions(context.user.id, input.limit, input.offset)),

	purchasePack: protectedProcedure
		.route({
			method: "POST",
			path: "/credits/purchase",
			tags: ["Credits"],
			summary: "Top up AI wallet with a credit pack",
		})
		.input(
			z.object({
				packId: z.enum(["starter", "hunter", "executive"]),
			}),
		)
		.output(
			z.object({
				success: z.boolean(),
				creditsAdded: z.number(),
				newBalance: z.number(),
				pack: z.object({
					id: z.enum(["starter", "hunter", "executive"]),
					name: z.string(),
					credits: z.number(),
					priceDisplay: z.string(),
				}),
			}),
		)
		.handler(({ context, input }) => creditsService.purchasePack(context.user.id, input.packId)),

	grantCredits: adminProcedure
		.route({
			method: "POST",
			path: "/admin/credits/grant",
			tags: ["Platform Administration"],
			summary: "Admin grant or adjust credits for any account",
		})
		.input(
			z.object({
				userId: z.string(),
				amount: z.number(),
				reason: z.string().default("Admin Grant"),
			}),
		)
		.output(
			z.object({
				success: z.boolean(),
				targetUsername: z.string(),
				previousBalance: z.number(),
				newBalance: z.number(),
				amount: z.number(),
			}),
		)
		.handler(({ context, input }) => {
			const adminUser = context.user as { username?: string };
			return creditsService.grantCredits(input.userId, input.amount, input.reason, adminUser.username ?? "admin");
		}),
};
