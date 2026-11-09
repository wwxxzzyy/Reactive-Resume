import { ORPCError } from "@orpc/server";
import { and, count, desc, eq, gt, ilike, or, sql } from "drizzle-orm";
import { hashPassword } from "@reactive-resume/auth/config";
import { db } from "@reactive-resume/db/client";
import {
	account,
	application,
	oauthAccessToken,
	oauthRefreshToken,
	resume,
	session,
	user,
} from "@reactive-resume/db/schema";
import { generateId, toUsername } from "@reactive-resume/utils/string";
import { trafficService } from "./traffic";

export const adminService = {
	async getStats() {
		const [usersResult] = await db.select({ total: count() }).from(user);
		const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
		const [activeResult] = await db.select({ total: count() }).from(user).where(gt(user.lastActiveAt, thirtyDaysAgo));
		const [resumesResult] = await db.select({ total: count() }).from(resume);
		const [applicationsResult] = await db.select({ total: count() }).from(application);
		const [bannedResult] = await db.select({ total: count() }).from(user).where(eq(user.banned, true));
		const [adminsResult] = await db.select({ total: count() }).from(user).where(eq(user.role, "admin"));

		return {
			totalUsers: Number(usersResult?.total ?? 0),
			activeUsers: Number(activeResult?.total ?? 0),
			totalResumes: Number(resumesResult?.total ?? 0),
			totalApplications: Number(applicationsResult?.total ?? 0),
			bannedUsers: Number(bannedResult?.total ?? 0),
			adminUsers: Number(adminsResult?.total ?? 0),
		};
	},

	async listUsers({
		page = 1,
		pageSize = 20,
		query,
		role = "all",
		status = "all",
	}: {
		page?: number;
		pageSize?: number;
		query?: string | undefined;
		role?: "all" | "admin" | "user";
		status?: "all" | "active" | "banned";
	}) {
		const conditions = [];

		if (query && query.trim().length > 0) {
			const search = `%${query.trim()}%`;
			conditions.push(or(ilike(user.name, search), ilike(user.email, search), ilike(user.username, search)));
		}

		if (role !== "all") {
			conditions.push(eq(user.role, role));
		}

		if (status === "active") {
			conditions.push(or(eq(user.banned, false), sql`${user.banned} IS NULL`));
		} else if (status === "banned") {
			conditions.push(eq(user.banned, true));
		}

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		const [totalResult] = await db.select({ total: count() }).from(user).where(whereClause);
		const total = Number(totalResult?.total ?? 0);

		const offset = (page - 1) * pageSize;
		const users = await db
			.select()
			.from(user)
			.where(whereClause)
			.orderBy(desc(user.createdAt))
			.limit(pageSize)
			.offset(offset);

		// Fetch resume counts and application counts for these users
		const userIds = users.map((u) => u.id);
		const resumeCountsMap = new Map<string, number>();
		const appCountsMap = new Map<string, number>();

		if (userIds.length > 0) {
			const resumeCounts = await db
				.select({ userId: resume.userId, count: count() })
				.from(resume)
				.where(sql`${resume.userId} IN ${userIds}`)
				.groupBy(resume.userId);

			for (const r of resumeCounts) {
				resumeCountsMap.set(r.userId, Number(r.count));
			}

			const appCounts = await db
				.select({ userId: application.userId, count: count() })
				.from(application)
				.where(sql`${application.userId} IN ${userIds}`)
				.groupBy(application.userId);

			for (const a of appCounts) {
				appCountsMap.set(a.userId, Number(a.count));
			}
		}

		const items = users.map((u) => ({
			id: u.id,
			name: u.name,
			email: u.email,
			username: u.username,
			displayUsername: u.displayUsername,
			role: u.role ?? "user",
			banned: Boolean(u.banned),
			banReason: u.banReason,
			banExpires: u.banExpires,
			emailVerified: u.emailVerified,
			createdAt: u.createdAt,
			lastActiveAt: u.lastActiveAt,
			aiCredits: u.aiCredits ?? 3,
			resumesCount: resumeCountsMap.get(u.id) ?? 0,
			applicationsCount: appCountsMap.get(u.id) ?? 0,
		}));

		return {
			items,
			total,
			page,
			pageSize,
			totalPages: Math.ceil(total / pageSize) || 1,
		};
	},

	async updateRole(userId: string, newRole: "admin" | "user") {
		const [targetUser] = await db.select().from(user).where(eq(user.id, userId)).limit(1);
		if (!targetUser) throw new ORPCError("NOT_FOUND", { message: "User not found." });

		if (targetUser.username === "shawn" && newRole !== "admin") {
			throw new ORPCError("BAD_REQUEST", { message: "Cannot demote designated platform administrator 'shawn'." });
		}

		await db.update(user).set({ role: newRole, updatedAt: new Date() }).where(eq(user.id, userId));

		return { success: true, userId, role: newRole };
	},

	async banUser(userId: string, banned: boolean, reason?: string, durationDays?: number) {
		const [targetUser] = await db.select().from(user).where(eq(user.id, userId)).limit(1);
		if (!targetUser) throw new ORPCError("NOT_FOUND", { message: "User not found." });

		if (targetUser.username === "shawn" && banned) {
			throw new ORPCError("BAD_REQUEST", { message: "Cannot ban designated platform administrator 'shawn'." });
		}

		const banExpires = banned && durationDays ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000) : null;

		await db.transaction(async (tx) => {
			await tx
				.update(user)
				.set({
					banned,
					banReason: banned ? (reason ?? "Suspended by platform administrator.") : null,
					banExpires,
					updatedAt: new Date(),
				})
				.where(eq(user.id, userId));

			if (banned) {
				// Terminate all active sessions & tokens immediately upon account suspension
				await tx.delete(session).where(eq(session.userId, userId));
				await tx.delete(oauthAccessToken).where(eq(oauthAccessToken.userId, userId));
				await tx.delete(oauthRefreshToken).where(eq(oauthRefreshToken.userId, userId));
			}
		});

		return { success: true, userId, banned };
	},

	async resetPassword(userId: string, newPassword: string) {
		const [targetUser] = await db.select().from(user).where(eq(user.id, userId)).limit(1);
		if (!targetUser) throw new ORPCError("NOT_FOUND", { message: "User not found." });

		const hashedPassword = await hashPassword(newPassword);

		await db.transaction(async (tx) => {
			const [existingAccount] = await tx
				.select()
				.from(account)
				.where(and(eq(account.userId, userId), eq(account.providerId, "credential")))
				.limit(1);

			if (existingAccount) {
				await tx
					.update(account)
					.set({ password: hashedPassword, updatedAt: new Date() })
					.where(eq(account.id, existingAccount.id));
			} else {
				await tx.insert(account).values({
					id: generateId(),
					accountId: userId,
					providerId: "credential",
					userId,
					password: hashedPassword,
				});
			}

			// Invalidate all active user sessions & tokens upon password change
			await tx.delete(session).where(eq(session.userId, userId));
			await tx.delete(oauthAccessToken).where(eq(oauthAccessToken.userId, userId));
			await tx.delete(oauthRefreshToken).where(eq(oauthRefreshToken.userId, userId));
		});

		return { success: true, userId };
	},

	async createUser(data: { name: string; email: string; username: string; password: string; role: "admin" | "user" }) {
		const normalizedUsername = toUsername(data.username);
		const normalizedEmail = data.email.trim().toLowerCase();

		const [existing] = await db
			.select()
			.from(user)
			.where(or(eq(user.email, normalizedEmail), eq(user.username, normalizedUsername)))
			.limit(1);

		if (existing) {
			throw new ORPCError("CONFLICT", { message: "Email or username is already registered." });
		}

		const userId = generateId();
		const hashedPassword = await hashPassword(data.password);

		await db.insert(user).values({
			id: userId,
			name: data.name.trim(),
			email: normalizedEmail,
			username: normalizedUsername,
			displayUsername: normalizedUsername,
			role: data.role,
			emailVerified: true,
			timezone: "UTC",
		});

		await db.insert(account).values({
			id: generateId(),
			accountId: userId,
			providerId: "credential",
			userId,
			password: hashedPassword,
		});

		return { success: true, id: userId, username: normalizedUsername };
	},

	async deleteUser(userId: string) {
		const [targetUser] = await db.select().from(user).where(eq(user.id, userId)).limit(1);
		if (!targetUser) throw new ORPCError("NOT_FOUND", { message: "User not found." });

		if (targetUser.username === "shawn") {
			throw new ORPCError("BAD_REQUEST", { message: "Cannot delete designated platform administrator 'shawn'." });
		}

		// Delete user cascades to account, session, resume, applications, etc.
		await db.transaction(async (tx) => {
			await tx.delete(session).where(eq(session.userId, userId));
			await tx.delete(oauthAccessToken).where(eq(oauthAccessToken.userId, userId));
			await tx.delete(oauthRefreshToken).where(eq(oauthRefreshToken.userId, userId));
			await tx.delete(user).where(eq(user.id, userId));
		});

		return { success: true, userId };
	},

	getTrafficStats() {
		return trafficService.getTrafficStats();
	},
};
