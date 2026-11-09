import { ORPCError } from "@orpc/server";
import { count, desc, eq, sql } from "drizzle-orm";
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
	 * Process a successful Stripe payment and credit user's wallet idempotently.
	 */
	async handleStripeCheckoutCompleted(session: {
		id: string;
		client_reference_id?: string | null;
		payment_intent?: string | null;
		amount_total?: number | null;
		currency?: string | null;
		metadata?: Record<string, string> | null;
	}) {
		const userId = session.metadata?.userId || session.client_reference_id;
		const packId = session.metadata?.packId as CreditPackId | undefined;

		if (!userId || !packId) {
			return { success: false, reason: "Missing userId or packId in metadata." };
		}

		const pack = CREDIT_PACKS.find((p) => p.id === packId);
		if (!pack) {
			return { success: false, reason: "Invalid packId in session metadata." };
		}

		// Idempotency check: verify this Stripe session hasn't already been fulfilled
		const [existingTx] = await db
			.select({ id: aiCreditTransaction.id })
			.from(aiCreditTransaction)
			.where(sql`${aiCreditTransaction.metadata}->>'stripeSessionId' = ${session.id}`)
			.limit(1);

		if (existingTx) {
			return { success: true, alreadyProcessed: true };
		}

		const [targetUser] = await db
			.select({ id: user.id, aiCredits: user.aiCredits })
			.from(user)
			.where(eq(user.id, userId))
			.limit(1);

		if (!targetUser) {
			return { success: false, reason: "Target user not found." };
		}

		const currentBalance = targetUser.aiCredits ?? 3;
		const newBalance = currentBalance + pack.credits;

		await db.update(user).set({ aiCredits: newBalance }).where(eq(user.id, userId));

		await db.insert(aiCreditTransaction).values({
			userId,
			amount: pack.credits,
			type: "stripe_checkout",
			description: `${pack.name} (+${pack.credits} Credits via Stripe)`,
			packId: pack.id,
			balanceAfter: newBalance,
			metadata: {
				stripeSessionId: session.id,
				stripePaymentIntent: session.payment_intent ?? null,
				amountPaidCents: session.amount_total ?? Math.round(pack.price * 100),
				currency: session.currency ?? "usd",
				completedAt: new Date().toISOString(),
			},
		});

		return {
			success: true,
			userId,
			packId,
			creditsAdded: pack.credits,
			newBalance,
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
