import { ORPCError } from "@orpc/server";
import { count, desc, eq } from "drizzle-orm";
import { db } from "@reactive-resume/db/client";
import { aiCreditTransaction, user } from "@reactive-resume/db/schema";
import { CREDIT_PACKS, type CreditPackId } from "./packs";

export const creditsService = {
	/**
	 * Get current user's AI wallet balance and lifetime usage summary.
	 */
	async getBalance(userId: string) {
		const [targetUser] = await db
			.select({ id: user.id, aiCredits: user.aiCredits })
			.from(user)
			.where(eq(user.id, userId))
			.limit(1);

		if (!targetUser) {
			throw new ORPCError("NOT_FOUND", { message: "User account not found." });
		}

		const balance = targetUser.aiCredits ?? 3;

		// Check if transaction ledger has been initialized
		const [txCountResult] = await db
			.select({ total: count() })
			.from(aiCreditTransaction)
			.where(eq(aiCreditTransaction.userId, userId));

		const totalTransactions = Number(txCountResult?.total ?? 0);

		// Record initial welcome bonus in ledger if empty
		if (totalTransactions === 0 && balance > 0) {
			await db.insert(aiCreditTransaction).values({
				userId,
				amount: balance,
				type: "signup_bonus",
				description: "Welcome Bonus Credits",
				balanceAfter: balance,
			});
		}

		return {
			credits: balance,
			totalTransactions: Math.max(totalTransactions, 1),
		};
	},

	/**
	 * Fetch transaction ledger for audit and history display.
	 */
	async getTransactions(userId: string, limit = 20, offset = 0) {
		const [totalResult] = await db
			.select({ total: count() })
			.from(aiCreditTransaction)
			.where(eq(aiCreditTransaction.userId, userId));

		const total = Number(totalResult?.total ?? 0);

		const items = await db
			.select()
			.from(aiCreditTransaction)
			.where(eq(aiCreditTransaction.userId, userId))
			.orderBy(desc(aiCreditTransaction.createdAt))
			.limit(limit)
			.offset(offset);

		return {
			items,
			total,
			limit,
			offset,
		};
	},

	/**
	 * Top-up user wallet with a chosen credit pack.
	 */
	async purchasePack(userId: string, packId: CreditPackId) {
		const pack = CREDIT_PACKS.find((p) => p.id === packId);
		if (!pack) {
			throw new ORPCError("BAD_REQUEST", { message: "Invalid credit pack selected." });
		}

		const [targetUser] = await db
			.select({ id: user.id, aiCredits: user.aiCredits })
			.from(user)
			.where(eq(user.id, userId))
			.limit(1);

		if (!targetUser) {
			throw new ORPCError("NOT_FOUND", { message: "User account not found." });
		}

		const currentBalance = targetUser.aiCredits ?? 3;
		const newBalance = currentBalance + pack.credits;

		await db.update(user).set({ aiCredits: newBalance }).where(eq(user.id, userId));

		await db.insert(aiCreditTransaction).values({
			userId,
			amount: pack.credits,
			type: "purchase",
			description: `${pack.name} (+${pack.credits} Credits)`,
			packId: pack.id,
			balanceAfter: newBalance,
			metadata: {
				price: pack.price,
				priceDisplay: pack.priceDisplay,
				completedAt: new Date().toISOString(),
			},
		});

		return {
			success: true,
			creditsAdded: pack.credits,
			newBalance,
			pack,
		};
	},

	/**
	 * Deduct AI credits for an action.
	 */
	async useCredits(userId: string, cost: number, description: string, metadata?: Record<string, unknown>) {
		const [targetUser] = await db
			.select({ id: user.id, aiCredits: user.aiCredits })
			.from(user)
			.where(eq(user.id, userId))
			.limit(1);

		if (!targetUser) {
			throw new ORPCError("NOT_FOUND", { message: "User account not found." });
		}

		const currentBalance = targetUser.aiCredits ?? 0;
		if (currentBalance < cost) {
			throw new ORPCError("BAD_REQUEST", {
				message: `Insufficient AI credits. This operation requires ${cost} credit(s), but your wallet balance is ${currentBalance}. Please top up your wallet.`,
			});
		}

		const newBalance = currentBalance - cost;
		await db.update(user).set({ aiCredits: newBalance }).where(eq(user.id, userId));

		await db.insert(aiCreditTransaction).values({
			userId,
			amount: -cost,
			type: "usage",
			description,
			balanceAfter: newBalance,
			metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
		});

		return {
			success: true,
			cost,
			remainingCredits: newBalance,
		};
	},

	/**
	 * Admin procedure to grant or deduct credits for any account.
	 */
	async grantCredits(userId: string, amount: number, reason: string, adminUsername: string) {
		const [targetUser] = await db
			.select({ id: user.id, username: user.username, aiCredits: user.aiCredits })
			.from(user)
			.where(eq(user.id, userId))
			.limit(1);

		if (!targetUser) {
			throw new ORPCError("NOT_FOUND", { message: "User account not found." });
		}

		const currentBalance = targetUser.aiCredits ?? 0;
		const newBalance = Math.max(0, currentBalance + amount);

		await db.update(user).set({ aiCredits: newBalance }).where(eq(user.id, userId));

		await db.insert(aiCreditTransaction).values({
			userId,
			amount,
			type: "admin_grant",
			description: `Admin adjustment (${amount >= 0 ? "+" : ""}${amount} credits): ${reason || "Direct grant"} by @${adminUsername}`,
			balanceAfter: newBalance,
			metadata: {
				adminUsername,
				reason,
			},
		});

		return {
			success: true,
			targetUsername: targetUser.username,
			previousBalance: currentBalance,
			newBalance,
			amount,
		};
	},
};
