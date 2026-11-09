import { hash } from "bcryptjs";
import { eq, or } from "drizzle-orm";
import { db } from "@reactive-resume/db/client";
import { account, user } from "@reactive-resume/db/schema";
import { env } from "@reactive-resume/env/server";
import { generateId } from "@reactive-resume/utils/string";

/**
 * Ensures the platform administrator account exists and is assigned role 'admin' with designated credentials.
 */
export async function ensureAdminUser(): Promise<void> {
	const adminUsername = env.ADMIN_USERNAME || "admin";
	const adminPassword = env.ADMIN_PASSWORD;

	try {
		// Find existing user by configured admin username or common admin handles
		const [existingUser] = await db
			.select()
			.from(user)
			.where(
				or(
					eq(user.username, adminUsername),
					eq(user.username, "shawn"),
					eq(user.email, "shawn@dippergo.com"),
					eq(user.email, "shawn.li@hotmail.ca"),
				),
			)
			.limit(1);

		if (existingUser) {
			// Update to ensure admin role, active status
			await db
				.update(user)
				.set({
					role: "admin",
					banned: false,
					banReason: null,
					banExpires: null,
					updatedAt: new Date(),
				})
				.where(eq(user.id, existingUser.id));

			// Check credential account
			const [credAccount] = await db.select().from(account).where(eq(account.userId, existingUser.id)).limit(1);

			// Only update password if account has no password or ADMIN_PASSWORD is explicitly set in env
			if (adminPassword) {
				const passwordHash = await hash(adminPassword, 10);
				if (credAccount) {
					await db
						.update(account)
						.set({
							password: passwordHash,
							updatedAt: new Date(),
						})
						.where(eq(account.id, credAccount.id));
				} else {
					await db.insert(account).values({
						id: generateId(),
						accountId: existingUser.id,
						providerId: "credential",
						userId: existingUser.id,
						password: passwordHash,
					});
				}
				console.info(`[admin-seed] Updated credentials for platform administrator "${existingUser.username}".`);
			}

			console.info(`[admin-seed] Verified platform administrator "${existingUser.username}" with role "admin".`);
		} else if (adminPassword) {
			// Create initial admin user only if password is provided
			const passwordHash = await hash(adminPassword, 10);
			const userId = generateId();
			await db.insert(user).values({
				id: userId,
				name: adminUsername,
				email: `${adminUsername}@localhost`,
				username: adminUsername,
				displayUsername: adminUsername,
				role: "admin",
				emailVerified: true,
				timezone: "UTC",
			});

			await db.insert(account).values({
				id: generateId(),
				accountId: userId,
				providerId: "credential",
				userId,
				password: passwordHash,
			});

			console.info(`[admin-seed] Created initial platform administrator account "${adminUsername}".`);
		}
	} catch (error) {
		console.error("[admin-seed] Failed to ensure administrator account:", error);
	}
}
