import z from "zod";
import { aiProviderSchema } from "@reactive-resume/ai/types";
import { adminProcedure, publicProcedure } from "../../context";
import { adminActionRateLimit } from "../../middleware/rate-limit";
import { serverAiService } from "./server-ai";
import { adminService } from "./service";

export const adminRouter = {
	checkAccess: publicProcedure
		.route({
			method: "GET",
			path: "/admin/access",
			tags: ["Platform Administration"],
			summary: "Check if the current session has platform administration rights",
		})
		.input(z.object({}).optional())
		.output(
			z.object({
				isAdmin: z.boolean(),
				username: z.string().nullable(),
			}),
		)
		.handler(({ context }) => {
			const u = context.user as { role?: string; username?: string } | null;
			const isAdmin = Boolean(u && u.role === "admin" && u.username === "shawn");
			return {
				isAdmin,
				username: u?.username ?? null,
			};
		}),

	getStats: adminProcedure
		.route({
			method: "GET",
			path: "/admin/stats",
			tags: ["Platform Administration"],
			summary: "Get platform system overview metrics",
		})
		.input(z.object({}).optional())
		.output(
			z.object({
				totalUsers: z.number(),
				activeUsers: z.number(),
				totalResumes: z.number(),
				totalApplications: z.number(),
				bannedUsers: z.number(),
				adminUsers: z.number(),
			}),
		)
		.handler(() => adminService.getStats()),

	listUsers: adminProcedure
		.route({
			method: "GET",
			path: "/admin/users",
			tags: ["Platform Administration"],
			summary: "List platform user accounts with pagination and filters",
		})
		.input(
			z.object({
				page: z.coerce.number().int().min(1).default(1),
				pageSize: z.coerce.number().int().min(5).max(100).default(20),
				query: z.string().trim().optional(),
				role: z.enum(["all", "admin", "user"]).default("all"),
				status: z.enum(["all", "active", "banned"]).default("all"),
			}),
		)
		.output(
			z.object({
				items: z.array(
					z.object({
						id: z.string(),
						name: z.string(),
						email: z.string(),
						username: z.string(),
						displayUsername: z.string().nullable(),
						role: z.string(),
						banned: z.boolean(),
						banReason: z.string().nullable(),
						banExpires: z.date().nullable(),
						emailVerified: z.boolean(),
						createdAt: z.date(),
						lastActiveAt: z.date().nullable(),
						aiCredits: z.number().default(3),
						resumesCount: z.number(),
						applicationsCount: z.number(),
					}),
				),
				total: z.number(),
				page: z.number(),
				pageSize: z.number(),
				totalPages: z.number(),
			}),
		)
		.handler(({ input }) => adminService.listUsers(input)),

	updateRole: adminProcedure
		.route({
			method: "POST",
			path: "/admin/users/role",
			tags: ["Platform Administration"],
			summary: "Update user account role",
		})
		.input(
			z.object({
				userId: z.string(),
				role: z.enum(["admin", "user"]),
			}),
		)
		.output(
			z.object({
				success: z.boolean(),
				userId: z.string(),
				role: z.string(),
			}),
		)
		.handler(({ input }) => adminService.updateRole(input.userId, input.role)),

	banUser: adminProcedure
		.route({
			method: "POST",
			path: "/admin/users/ban",
			tags: ["Platform Administration"],
			summary: "Ban or unban a user account",
		})
		.use(adminActionRateLimit)
		.input(
			z.object({
				userId: z.string(),
				banned: z.boolean(),
				reason: z.string().trim().optional(),
				durationDays: z.number().int().min(1).max(365).optional(),
			}),
		)
		.output(
			z.object({
				success: z.boolean(),
				userId: z.string(),
				banned: z.boolean(),
			}),
		)
		.handler(({ input }) => adminService.banUser(input.userId, input.banned, input.reason, input.durationDays)),

	resetPassword: adminProcedure
		.route({
			method: "POST",
			path: "/admin/users/reset-password",
			tags: ["Platform Administration"],
			summary: "Set a new password for a user account",
		})
		.use(adminActionRateLimit)
		.input(
			z.object({
				userId: z.string(),
				newPassword: z.string().min(6, "Password must be at least 6 characters"),
			}),
		)
		.output(
			z.object({
				success: z.boolean(),
				userId: z.string(),
			}),
		)
		.handler(({ input }) => adminService.resetPassword(input.userId, input.newPassword)),

	createUser: adminProcedure
		.route({
			method: "POST",
			path: "/admin/users/create",
			tags: ["Platform Administration"],
			summary: "Provision a new user account with initial role and password",
		})
		.use(adminActionRateLimit)
		.input(
			z.object({
				name: z.string().min(1, "Name is required"),
				email: z.string().email("Invalid email format"),
				username: z.string().min(3).max(64),
				password: z.string().min(6, "Password must be at least 6 characters"),
				role: z.enum(["admin", "user"]).default("user"),
			}),
		)
		.output(
			z.object({
				success: z.boolean(),
				id: z.string(),
				username: z.string(),
			}),
		)
		.handler(({ input }) => adminService.createUser(input)),

	deleteUser: adminProcedure
		.route({
			method: "DELETE",
			path: "/admin/users",
			tags: ["Platform Administration"],
			summary: "Permanently delete a user account and associated documents",
		})
		.use(adminActionRateLimit)
		.input(
			z.object({
				userId: z.string(),
			}),
		)
		.output(
			z.object({
				success: z.boolean(),
				userId: z.string(),
			}),
		)
		.handler(({ input }) => adminService.deleteUser(input.userId)),

	getTrafficStats: adminProcedure
		.route({
			method: "GET",
			path: "/admin/traffic",
			tags: ["Platform Administration"],
			summary: "Get website traffic telemetry, page views, and analytics",
		})
		.input(z.object({}).optional())
		.output(
			z.object({
				today: z.object({
					views: z.number(),
					visitors: z.number(),
				}),
				last7Days: z.array(
					z.object({
						date: z.string(),
						views: z.number(),
						visitors: z.number(),
					}),
				),
				last30DaysViews: z.number(),
				allTimeViews: z.number(),
				topPages: z.array(
					z.object({
						path: z.string(),
						views: z.number(),
						percentage: z.number(),
					}),
				),
				topReferrers: z.array(
					z.object({
						source: z.string(),
						count: z.number(),
						percentage: z.number(),
					}),
				),
				devices: z.object({
					desktop: z.number(),
					mobile: z.number(),
					tablet: z.number(),
					bot: z.number(),
				}),
				recentVisits: z.array(
					z.object({
						id: z.string(),
						path: z.string(),
						referrer: z.string(),
						device: z.enum(["desktop", "mobile", "tablet", "bot"]),
						country: z.string(),
						timestamp: z.string(),
					}),
				),
			}),
		)
		.handler(() => adminService.getTrafficStats()),

	getServerAi: adminProcedure
		.route({
			method: "GET",
			path: "/admin/server-ai",
			tags: ["Platform Administration"],
			summary: "Get current server-wide AI provider configuration",
		})
		.input(z.object({}).optional())
		.output(
			z.object({
				configured: z.boolean(),
				source: z.enum(["database", "environment", "none"]),
				provider: z.string().nullable(),
				model: z.string().nullable(),
				baseUrl: z.string().nullable(),
				enabled: z.boolean(),
				testStatus: z.string(),
				testError: z.string().nullable(),
				apiKeyPreview: z.string(),
				lastTestedAt: z.date().nullable(),
				updatedAt: z.date().nullable(),
			}),
		)
		.handler(() => serverAiService.getConfig()),

	testServerAi: adminProcedure
		.route({
			method: "POST",
			path: "/admin/server-ai/test",
			tags: ["Platform Administration"],
			summary: "Test connection to an AI provider with given or stored credentials",
		})
		.use(adminActionRateLimit)
		.input(
			z.object({
				provider: aiProviderSchema,
				model: z.string().min(1, "Model is required"),
				apiKey: z.string().optional(),
				baseUrl: z.string().nullable().optional(),
			}),
		)
		.output(
			z.object({
				success: z.boolean(),
				message: z.string(),
				kind: z.string().optional(),
			}),
		)
		.handler(({ input }) => serverAiService.testConfig(input)),

	saveServerAi: adminProcedure
		.route({
			method: "POST",
			path: "/admin/server-ai/save",
			tags: ["Platform Administration"],
			summary: "Save, test, and activate server-wide AI provider configuration",
		})
		.use(adminActionRateLimit)
		.input(
			z.object({
				provider: aiProviderSchema,
				model: z.string().min(1, "Model is required"),
				apiKey: z.string().optional(),
				baseUrl: z.string().nullable().optional(),
				enabled: z.boolean().optional(),
			}),
		)
		.output(
			z.object({
				success: z.boolean(),
				provider: z.string(),
				model: z.string(),
				testStatus: z.string(),
				testError: z.string().nullable(),
				message: z.string(),
			}),
		)
		.handler(({ input }) => serverAiService.saveConfig(input)),

	deleteServerAi: adminProcedure
		.route({
			method: "DELETE",
			path: "/admin/server-ai",
			tags: ["Platform Administration"],
			summary: "Remove server-wide AI configuration from database",
		})
		.input(z.object({}).optional())
		.output(
			z.object({
				success: z.boolean(),
			}),
		)
		.handler(() => serverAiService.deleteConfig()),
};
