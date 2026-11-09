import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@reactive-resume/ui/components/avatar";
import { Badge } from "@reactive-resume/ui/components/badge";
import { BrandIcon } from "@reactive-resume/ui/components/brand-icon";
import { Button } from "@reactive-resume/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@reactive-resume/ui/components/dialog";
import { Icon } from "@reactive-resume/ui/components/icon";
import { Input } from "@reactive-resume/ui/components/input";
import { toast } from "@reactive-resume/ui/components/toast";
import { getInitials } from "@reactive-resume/utils/string";
import { cn } from "@reactive-resume/utils/style";
import { ServerAiOverview } from "./-components/server-ai-overview";
import { TrafficOverview } from "./-components/traffic-overview";
import { authClient } from "@/libs/auth/client";
import { orpc } from "@/libs/orpc/client";

export const Route = createFileRoute("/admin/")({
	head: () => ({ meta: [{ title: "Platform Administration | DipperGo" }] }),
	component: AdminRouteComponent,
});

function AdminRouteComponent() {
	const { data: session, isPending: isSessionLoading } = authClient.useSession();
	const isAdmin =
		session?.user && (session.user as { role?: string }).role === "admin" && session.user.username === "shawn";

	if (isSessionLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-bg font-ui">
				<div className="flex flex-col items-center gap-3">
					<BrandIcon variant="icon" className="size-12 animate-pulse" />
					<p className="text-xs text-ink-3">Verifying administrator authorization...</p>
				</div>
			</div>
		);
	}

	if (!isAdmin) {
		return <AdminLoginPortal session={session} />;
	}

	return <AdminDashboard sessionUser={session.user as { id: string; name: string; username: string; email: string }} />;
}

/* ==============================================================================
   Admin Login Portal
   ============================================================================== */
function AdminLoginPortal({ session }: { session: ReturnType<typeof authClient.useSession>["data"] }) {
	const navigate = useNavigate();
	const [username, setUsername] = useState("shawn");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleAdminLogin = async (e: FormEvent) => {
		e.preventDefault();
		setError(null);
		setLoading(true);

		try {
			const res = await authClient.signIn.username({
				username: username.trim(),
				password,
			});

			if (res.error) {
				setError(res.error.message || "Invalid administrator credentials.");
				setLoading(false);
				return;
			}

			// Verify account username is shawn
			const freshSession = await authClient.getSession();
			const freshUser = freshSession?.data?.user as { username?: string; role?: string } | undefined;

			if (freshUser?.username !== "shawn" || freshUser?.role !== "admin") {
				await authClient.signOut();
				setError("Access Denied: Only designated administrator account 'shawn' is authorized.");
				setLoading(false);
				return;
			}

			toast.add({
				type: "success",
				title: "Administrator Authenticated",
				description: "Welcome back, Shawn. Platform administration session active.",
			});
			void navigate({ to: "/admin" });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to authenticate administrator.");
		} finally {
			setLoading(false);
		}
	};

	const handleSignOutCurrent = async () => {
		await authClient.signOut();
		void navigate({ to: "/admin" });
	};

	return (
		<div className="relative flex min-h-screen flex-col items-center justify-center bg-bg px-4 py-12 font-ui text-ink">
			<div className="w-full max-w-md space-y-6">
				{/* Top Branding */}
				<div className="flex flex-col items-center text-center">
					<BrandIcon variant="icon" className="size-14" />
					<div className="mt-4 flex items-center gap-2">
						<span className="font-anybody text-2xl font-bold tracking-tight text-ink">DipperGo</span>
						<Badge variant="accent" className="font-martian text-[10px] tracking-wider uppercase">
							Admin Portal
						</Badge>
					</div>
					<p className="mt-1 text-xs text-ink-3">Restricted platform administration console</p>
				</div>

				{/* Notice if signed in as non-admin */}
				{session?.user && session.user.username !== "shawn" && (
					<div className="rounded-lg border border-warn/30 bg-warn/10 p-3 text-xs text-warn-text">
						<div className="font-semibold">Unauthorized Account</div>
						<p className="mt-0.5">
							Signed in as <strong>@{session.user.username}</strong> ({session.user.email}). Only account{" "}
							<strong>shawn</strong> is permitted.
						</p>
						<Button variant="secondary" size="sm" className="mt-2 w-full text-xs" onClick={handleSignOutCurrent}>
							Sign out of @{session.user.username}
						</Button>
					</div>
				)}

				{/* Login Card */}
				<div className="rounded-xl border border-line bg-surface p-6 shadow-md sm:p-8">
					<div className="mb-5 flex items-center justify-between border-b border-line pb-4">
						<div className="flex items-center gap-2">
							<Icon name="shield-check" className="size-5 text-accent" />
							<h2 className="text-sm font-semibold tracking-tight text-ink">Admin Authentication</h2>
						</div>
						<Badge variant="outline" className="font-martian text-[10px]">
							Restricted
						</Badge>
					</div>

					{error && (
						<div className="mb-4 rounded-md border border-danger/30 bg-danger/10 p-3 text-xs text-danger-text">
							{error}
						</div>
					)}

					<form onSubmit={handleAdminLogin} className="space-y-4">
						<div className="space-y-1.5">
							<label htmlFor="admin-username" className="font-martian text-[11px] font-medium text-ink-2 uppercase">
								Administrator Username
							</label>
							<Input
								id="admin-username"
								type="text"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								required
								autoComplete="username"
								placeholder="shawn"
								className="h-10 text-sm"
							/>
						</div>

						<div className="space-y-1.5">
							<label htmlFor="admin-password" className="font-martian text-[11px] font-medium text-ink-2 uppercase">
								Administrator Password
							</label>
							<div className="relative">
								<Input
									id="admin-password"
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									autoComplete="current-password"
									placeholder="!Password1"
									className="h-10 pe-10 text-sm"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute inset-y-0 end-0 flex items-center pe-3 text-ink-3 hover:text-ink"
									tabIndex={-1}
									aria-label={showPassword ? "Hide password" : "Show password"}
								>
									<Icon name={showPassword ? "lock-open" : "lock"} className="size-4" />
								</button>
							</div>
						</div>

						<Button type="submit" disabled={loading} className="mt-2 h-10 w-full font-medium shadow-sm">
							{loading ? (
								<>
									<Icon name="circle-notch" className="size-4 animate-spin" />
									Authenticating...
								</>
							) : (
								<>
									<Icon name="shield-check" className="size-4" />
									Sign in to Admin Console
								</>
							)}
						</Button>
					</form>
				</div>

				<div className="text-center">
					<Link to="/dashboard" className="text-xs text-ink-3 hover:text-ink hover:underline">
						← Return to App Dashboard
					</Link>
				</div>
			</div>
		</div>
	);
}

/* ==============================================================================
   Admin Dashboard Console
   ============================================================================== */
function AdminDashboard({
	sessionUser,
}: {
	sessionUser: { id: string; name: string; username: string; email: string };
}) {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	// Active Section Tab
	const [activeSection, setActiveSection] = useState<"accounts" | "traffic" | "server-ai">("accounts");

	// Search & Filter State
	const [searchQuery, setSearchQuery] = useState("");
	const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
	const [statusFilter, setStatusFilter] = useState<"all" | "active" | "banned">("all");
	const [page, setPage] = useState(1);
	const pageSize = 15;

	// Modal States
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [banModalTarget, setBanModalTarget] = useState<{
		id: string;
		name: string;
		username: string;
		banned: boolean;
	} | null>(null);
	const [banReason, setBanReason] = useState("");
	const [banDurationDays, setBanDurationDays] = useState<number | undefined>(undefined);

	const [resetPasswordTarget, setResetPasswordTarget] = useState<{ id: string; username: string } | null>(null);
	const [newPasswordValue, setNewPasswordValue] = useState("");

	const [deleteModalTarget, setDeleteModalTarget] = useState<{ id: string; username: string } | null>(null);
	const [grantCreditsTarget, setGrantCreditsTarget] = useState<{
		id: string;
		username: string;
		currentCredits: number;
	} | null>(null);
	const [grantAmount, setGrantAmount] = useState<number>(25);
	const [grantReason, setGrantReason] = useState<string>("Admin Reward");

	// Queries
	const { data: stats, refetch: refetchStats } = useQuery(orpc.admin.getStats.queryOptions({}));
	const {
		data: trafficData,
		isPending: isTrafficLoading,
		refetch: refetchTraffic,
	} = useQuery({
		...orpc.admin.getTrafficStats.queryOptions({}),
		refetchInterval: activeSection === "traffic" ? 15_000 : false,
	});
	const {
		data: usersData,
		isPending: isUsersLoading,
		refetch: refetchUsers,
	} = useQuery(
		orpc.admin.listUsers.queryOptions({
			input: {
				page,
				pageSize,
				query: searchQuery.trim() || undefined,
				role: roleFilter,
				status: statusFilter,
			},
		}),
	);

	// Mutations
	const updateRoleMutation = useMutation(
		orpc.admin.updateRole.mutationOptions({
			onSuccess: (data) => {
				toast.add({ type: "success", title: "Role Updated", description: `Account role set to ${data.role}.` });
				void queryClient.invalidateQueries({ queryKey: orpc.admin.listUsers.key() });
				void refetchStats();
			},
			onError: (err) => {
				toast.add({ type: "error", title: "Update Failed", description: err.message });
			},
		}),
	);

	const banMutation = useMutation(
		orpc.admin.banUser.mutationOptions({
			onSuccess: (data) => {
				toast.add({
					type: "success",
					title: data.banned ? "Account Suspended" : "Account Restored",
					description: data.banned ? "User account has been banned." : "User account ban has been lifted.",
				});
				setBanModalTarget(null);
				setBanReason("");
				void queryClient.invalidateQueries({ queryKey: orpc.admin.listUsers.key() });
				void refetchStats();
			},
			onError: (err) => {
				toast.add({ type: "error", title: "Operation Failed", description: err.message });
			},
		}),
	);

	const resetPasswordMutation = useMutation(
		orpc.admin.resetPassword.mutationOptions({
			onSuccess: () => {
				toast.add({
					type: "success",
					title: "Password Reset",
					description: `Password for @${resetPasswordTarget?.username} has been updated.`,
				});
				setResetPasswordTarget(null);
				setNewPasswordValue("");
			},
			onError: (err) => {
				toast.add({ type: "error", title: "Reset Failed", description: err.message });
			},
		}),
	);

	const createUserMutation = useMutation(
		orpc.admin.createUser.mutationOptions({
			onSuccess: (data) => {
				toast.add({
					type: "success",
					title: "Account Created",
					description: `New user @${data.username} has been provisioned.`,
				});
				setCreateModalOpen(false);
				void queryClient.invalidateQueries({ queryKey: orpc.admin.listUsers.key() });
				void refetchStats();
			},
			onError: (err) => {
				toast.add({ type: "error", title: "Creation Failed", description: err.message });
			},
		}),
	);

	const deleteUserMutation = useMutation(
		orpc.admin.deleteUser.mutationOptions({
			onSuccess: () => {
				toast.add({
					type: "success",
					title: "Account Purged",
					description: `Account @${deleteModalTarget?.username} and associated records deleted.`,
				});
				setDeleteModalTarget(null);
				void queryClient.invalidateQueries({ queryKey: orpc.admin.listUsers.key() });
				void refetchStats();
			},
			onError: (err) => {
				toast.add({ type: "error", title: "Deletion Failed", description: err.message });
			},
		}),
	);

	const grantCreditsMutation = useMutation(
		orpc.credits.grantCredits.mutationOptions({
			onSuccess: (data) => {
				toast.add({
					type: "success",
					title: "Credits Granted",
					description: `Updated balance for @${data.targetUsername} to ${data.newBalance} credits.`,
				});
				setGrantCreditsTarget(null);
				void queryClient.invalidateQueries({ queryKey: orpc.admin.listUsers.key() });
			},
			onError: (err) => {
				toast.add({ type: "error", title: "Grant Failed", description: err.message });
			},
		}),
	);

	const handleSignOut = async () => {
		await authClient.signOut();
		void navigate({ to: "/admin" });
	};

	const handleRefresh = () => {
		void refetchStats();
		void refetchUsers();
		void refetchTraffic();
		toast.add({ type: "info", description: "Admin data refreshed." });
	};

	return (
		<div className="min-h-screen bg-bg font-ui text-ink">
			{/* Top Navbar */}
			<header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur-md">
				<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
					<div className="flex items-center gap-3">
						<BrandIcon variant="icon" className="size-8" />
						<div className="flex flex-col">
							<div className="flex items-center gap-2">
								<span className="font-anybody text-lg font-bold tracking-tight text-ink">DipperGo</span>
								<Badge variant="accent" className="font-martian text-[9.5px] uppercase">
									Admin Console
								</Badge>
							</div>
							<span className="font-martian text-[10px] text-ink-3">Platform Account &amp; Permission Manager</span>
						</div>
					</div>

					<div className="flex items-center gap-3">
						<div className="hidden items-center gap-2 rounded-full border border-line bg-raised px-3 py-1 text-xs sm:flex">
							<Icon name="shield-check" className="size-3.5 text-accent" />
							<span className="text-ink-2">Administrator:</span>
							<strong className="text-ink">@{sessionUser.username}</strong>
						</div>

						<Button variant="secondary" size="sm" onClick={handleRefresh} title="Refresh data">
							<Icon name="arrows-clockwise" className="size-3.5" />
							<span className="hidden sm:inline">Refresh</span>
						</Button>

						<Link to="/dashboard">
							<Button variant="secondary" size="sm">
								<Icon name="file-text" className="size-3.5" />
								<span>App Dashboard</span>
							</Button>
						</Link>

						<Button variant="ghost" size="sm" onClick={handleSignOut} title="Sign Out">
							<Icon name="sign-out" className="size-4" />
							<span className="hidden sm:inline">Sign Out</span>
						</Button>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
				{/* Admin Console Section Switcher */}
				<div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={() => setActiveSection("accounts")}
							className={cn(
								"flex h-9 items-center gap-2 rounded-lg border px-4 text-xs font-semibold transition-colors",
								activeSection === "accounts"
									? "border-accent/40 bg-accent/10 text-accent-text"
									: "border-line bg-surface text-ink-2 hover:border-line-2 hover:text-ink",
							)}
						>
							<Icon name="users" className="size-4" />
							<span>Account Management</span>
						</button>

						<button
							type="button"
							onClick={() => setActiveSection("traffic")}
							className={cn(
								"flex h-9 items-center gap-2 rounded-lg border px-4 text-xs font-semibold transition-colors",
								activeSection === "traffic"
									? "border-accent/40 bg-accent/10 text-accent-text"
									: "border-line bg-surface text-ink-2 hover:border-line-2 hover:text-ink",
							)}
						>
							<span className="relative flex size-2">
								<span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
								<span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
							</span>
							<Icon name="chart-line-up" className="size-4" />
							<span>Website Traffic &amp; Telemetry</span>
						</button>

						<button
							type="button"
							onClick={() => setActiveSection("server-ai")}
							className={cn(
								"flex h-9 items-center gap-2 rounded-lg border px-4 text-xs font-semibold transition-colors",
								activeSection === "server-ai"
									? "border-accent/40 bg-accent/10 text-accent-text"
									: "border-line bg-surface text-ink-2 hover:border-line-2 hover:text-ink",
							)}
						>
							<Icon name="lightning" className="size-4 text-amber-500" />
							<span>Server-Wide AI &amp; LLM</span>
						</button>
					</div>

					<div className="flex items-center gap-2">
						<Button variant="secondary" size="sm" onClick={handleRefresh} className="gap-1.5 text-xs">
							<Icon name="arrows-clockwise" className="size-3.5" />
							<span>Refresh All</span>
						</Button>
					</div>
				</div>

				{activeSection === "traffic" ? (
					<TrafficOverview traffic={trafficData} isLoading={isTrafficLoading} onRefresh={() => void refetchTraffic()} />
				) : activeSection === "server-ai" ? (
					<ServerAiOverview onRefreshAll={handleRefresh} />
				) : (
					<>
						{/* KPI Metrics Cards */}
						<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
							<MetricCard
								label="Total Accounts"
								value={stats?.totalUsers ?? "—"}
								icon="users"
								accent="text-blue-500"
								bg="bg-blue-500/10"
							/>
							<MetricCard
								label="Active (30 Days)"
								value={stats?.activeUsers ?? "—"}
								icon="trend-up"
								accent="text-emerald-500"
								bg="bg-emerald-500/10"
							/>
							<MetricCard
								label="Total Resumes"
								value={stats?.totalResumes ?? "—"}
								icon="file-text"
								accent="text-indigo-500"
								bg="bg-indigo-500/10"
							/>
							<MetricCard
								label="Applications"
								value={stats?.totalApplications ?? "—"}
								icon="briefcase"
								accent="text-sky-500"
								bg="bg-sky-500/10"
							/>
							<MetricCard
								label="Suspended"
								value={stats?.bannedUsers ?? "—"}
								icon="prohibit"
								accent="text-rose-500"
								bg="bg-rose-500/10"
							/>
							<MetricCard
								label="Administrators"
								value={stats?.adminUsers ?? "—"}
								icon="crown"
								accent="text-amber-500"
								bg="bg-amber-500/10"
							/>
						</div>

						{/* User Directory Management Card */}
						<div className="rounded-xl border border-line bg-surface shadow-xs">
							{/* Toolbar */}
							<div className="flex flex-col gap-4 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between">
								<div>
									<h3 className="text-base font-bold text-ink">Account Directory</h3>
									<p className="text-xs text-ink-3">
										Search, review permissions, toggle roles, and manage credentials for all registered users.
									</p>
								</div>

								<div className="flex flex-wrap items-center gap-2">
									<Button variant="primary" size="sm" onClick={() => setCreateModalOpen(true)}>
										<Icon name="user-plus" className="size-4" />
										<span>Create User</span>
									</Button>
								</div>
							</div>

							{/* Filter Bar */}
							<div className="flex flex-wrap items-center gap-3 border-b border-line/60 bg-raised/40 p-4">
								{/* Search Input */}
								<div className="relative min-w-[220px] flex-1">
									<Icon name="magnifying-glass" className="absolute inset-y-0 start-3 my-auto size-4 text-ink-3" />
									<Input
										type="text"
										placeholder="Search by name, email, or username..."
										value={searchQuery}
										onChange={(e) => {
											setSearchQuery(e.target.value);
											setPage(1);
										}}
										className="h-9 ps-9 text-xs"
									/>
									{searchQuery && (
										<button
											type="button"
											onClick={() => setSearchQuery("")}
											className="absolute inset-y-0 end-2 my-auto text-ink-3 hover:text-ink"
											aria-label="Clear search"
										>
											<Icon name="x" className="size-3.5" />
										</button>
									)}
								</div>

								{/* Role Filter */}
								<div className="flex items-center gap-1.5 text-xs text-ink-3">
									<span className="font-martian text-[10px] uppercase">Role:</span>
									<select
										value={roleFilter}
										onChange={(e) => {
											setRoleFilter(e.target.value as "all" | "admin" | "user");
											setPage(1);
										}}
										className="h-9 rounded-md border border-line bg-surface px-2.5 text-xs text-ink focus:ring-1 focus:ring-accent focus:outline-hidden"
									>
										<option value="all">All Roles</option>
										<option value="admin">Admins only</option>
										<option value="user">Users only</option>
									</select>
								</div>

								{/* Status Filter */}
								<div className="flex items-center gap-1.5 text-xs text-ink-3">
									<span className="font-martian text-[10px] uppercase">Status:</span>
									<select
										value={statusFilter}
										onChange={(e) => {
											setStatusFilter(e.target.value as "all" | "active" | "banned");
											setPage(1);
										}}
										className="h-9 rounded-md border border-line bg-surface px-2.5 text-xs text-ink focus:ring-1 focus:ring-accent focus:outline-hidden"
									>
										<option value="all">All Statuses</option>
										<option value="active">Active Accounts</option>
										<option value="banned">Suspended Accounts</option>
									</select>
								</div>
							</div>

							{/* Users Table */}
							<div className="overflow-x-auto">
								<table className="w-full text-start text-xs">
									<thead>
										<tr className="font-martian border-b border-line bg-raised/30 text-[10.5px] text-ink-3 uppercase">
											<th className="px-4 py-3 text-start font-semibold">User Details</th>
											<th className="px-4 py-3 text-start font-semibold">Email &amp; Contact</th>
											<th className="px-4 py-3 text-start font-semibold">Role</th>
											<th className="px-4 py-3 text-start font-semibold">AI Credits</th>
											<th className="px-4 py-3 text-start font-semibold">Documents</th>
											<th className="px-4 py-3 text-start font-semibold">Account Status</th>
											<th className="px-4 py-3 text-start font-semibold">Registered</th>
											<th className="px-4 py-3 text-end font-semibold">Actions</th>
										</tr>
									</thead>

									<tbody className="divide-y divide-line/60">
										{isUsersLoading ? (
											<tr>
												<td colSpan={8} className="py-12 text-center text-ink-3">
													<div className="flex items-center justify-center gap-2">
														<Icon name="circle-notch" className="size-4 animate-spin text-accent" />
														<span>Loading account directory...</span>
													</div>
												</td>
											</tr>
										) : usersData?.items.length === 0 ? (
											<tr>
												<td colSpan={8} className="py-12 text-center text-ink-3">
													No accounts found matching search criteria.
												</td>
											</tr>
										) : (
											usersData?.items.map((u) => {
												const isShawn = u.username === "shawn";
												return (
													<tr key={u.id} className="transition-colors hover:bg-raised/40">
														{/* User Column */}
														<td className="px-4 py-3.5">
															<div className="flex items-center gap-3">
																<Avatar className="size-9 shrink-0 border border-line">
																	<AvatarFallback className="text-xs font-bold text-accent">
																		{getInitials(u.name || u.username)}
																	</AvatarFallback>
																</Avatar>
																<div className="flex flex-col">
																	<div className="flex items-center gap-1.5">
																		<span className="font-semibold text-ink">{u.name}</span>
																		{isShawn && (
																			<Badge variant="accent" className="font-martian text-[8.5px] uppercase">
																				Primary Admin
																			</Badge>
																		)}
																	</div>
																	<span className="font-martian text-[10.5px] text-ink-3">@{u.username}</span>
																</div>
															</div>
														</td>

														{/* Email Column */}
														<td className="px-4 py-3.5">
															<div className="flex flex-col gap-0.5">
																<span className="font-mono text-xs text-ink">{u.email}</span>
																{u.emailVerified ? (
																	<span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400">
																		<Icon name="check-circle" className="size-3" />
																		Verified
																	</span>
																) : (
																	<span className="text-ink-4 text-[10px]">Unverified</span>
																)}
															</div>
														</td>

														{/* Role Column */}
														<td className="px-4 py-3.5">
															{u.role === "admin" ? (
																<Badge variant="solid" className="font-martian gap-1 text-[9.5px]">
																	<Icon name="crown" className="size-3" />
																	ADMIN
																</Badge>
															) : (
																<Badge variant="neutral" className="font-martian text-[9.5px]">
																	USER
																</Badge>
															)}
														</td>

														{/* AI Credits Column */}
														<td className="px-4 py-3.5">
															<span className="font-martian inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400">
																<Icon name="lightning" className="size-3 fill-current" />
																{u.aiCredits ?? 3}
															</span>
														</td>

														{/* Documents Column */}
														<td className="px-4 py-3.5">
															<div className="flex items-center gap-2 text-ink-2">
																<span title="Resumes created" className="inline-flex items-center gap-1">
																	<Icon name="file-text" className="size-3 text-ink-3" />
																	{u.resumesCount}
																</span>
																<span className="text-line-2">•</span>
																<span title="Job applications" className="inline-flex items-center gap-1">
																	<Icon name="briefcase" className="size-3 text-ink-3" />
																	{u.applicationsCount}
																</span>
															</div>
														</td>

														{/* Status Column */}
														<td className="px-4 py-3.5">
															{u.banned ? (
																<div className="flex flex-col gap-0.5">
																	<Badge variant="danger" className="gap-1 text-[10px]">
																		<Icon name="prohibit" className="size-3" />
																		Banned
																	</Badge>
																	{u.banReason && (
																		<span
																			className="text-ink-4 max-w-[140px] truncate text-[9.5px]"
																			title={u.banReason}
																		>
																			{u.banReason}
																		</span>
																	)}
																</div>
															) : (
																<Badge
																	variant="neutral"
																	className="gap-1 text-[10px] text-emerald-600 dark:text-emerald-400"
																>
																	<span className="size-1.5 rounded-full bg-emerald-500" />
																	Active
																</Badge>
															)}
														</td>

														{/* Registered Date Column */}
														<td className="font-martian px-4 py-3.5 text-[10.5px] text-ink-3">
															{new Date(u.createdAt).toLocaleDateString(undefined, {
																year: "numeric",
																month: "short",
																day: "numeric",
															})}
														</td>

														{/* Actions Column */}
														<td className="px-4 py-3.5 text-end">
															<div className="inline-flex items-center gap-1">
																{/* Toggle Role Button */}
																{!isShawn && (
																	<Button
																		variant="ghost"
																		size="sm"
																		title={u.role === "admin" ? "Demote to User" : "Promote to Admin"}
																		onClick={() =>
																			updateRoleMutation.mutate({
																				userId: u.id,
																				role: u.role === "admin" ? "user" : "admin",
																			})
																		}
																		disabled={updateRoleMutation.isPending}
																	>
																		<Icon name={u.role === "admin" ? "users" : "crown"} className="size-3.5" />
																	</Button>
																)}

																{/* Ban / Unban Button */}
																{!isShawn && (
																	<Button
																		variant="ghost"
																		size="sm"
																		className={u.banned ? "text-emerald-600" : "text-danger-text"}
																		title={u.banned ? "Unban account" : "Suspend account"}
																		onClick={() => {
																			if (u.banned) {
																				banMutation.mutate({ userId: u.id, banned: false });
																			} else {
																				setBanModalTarget(u);
																				setBanReason("");
																			}
																		}}
																		disabled={banMutation.isPending}
																	>
																		<Icon name={u.banned ? "check-circle" : "prohibit"} className="size-3.5" />
																	</Button>
																)}

																{/* Reset Password Button */}
																<Button
																	variant="ghost"
																	size="sm"
																	title="Set New Password"
																	onClick={() => {
																		setResetPasswordTarget({ id: u.id, username: u.username });
																		setNewPasswordValue("");
																	}}
																>
																	<Icon name="key" className="size-3.5" />
																</Button>

																{/* Grant AI Credits Button */}
																<Button
																	variant="ghost"
																	size="sm"
																	className="text-amber-500 hover:bg-amber-500/10"
																	title="Grant / Adjust AI Credits"
																	onClick={() => {
																		setGrantCreditsTarget({
																			id: u.id,
																			username: u.username,
																			currentCredits: u.aiCredits ?? 3,
																		});
																		setGrantAmount(25);
																		setGrantReason("Admin Grant");
																	}}
																>
																	<Icon name="lightning" className="size-3.5 fill-current" />
																</Button>

																{/* Delete Account Button */}
																{!isShawn && (
																	<Button
																		variant="ghost"
																		size="sm"
																		className="text-danger-text hover:bg-danger-soft"
																		title="Permanently Delete Account"
																		onClick={() => setDeleteModalTarget({ id: u.id, username: u.username })}
																	>
																		<Icon name="trash" className="size-3.5" />
																	</Button>
																)}
															</div>
														</td>
													</tr>
												);
											})
										)}
									</tbody>
								</table>
							</div>

							{/* Pagination Footer */}
							{usersData && usersData.totalPages > 1 && (
								<div className="flex items-center justify-between border-t border-line px-5 py-3 text-xs text-ink-3">
									<span>
										Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, usersData.total)} of{" "}
										{usersData.total} accounts
									</span>
									<div className="flex items-center gap-2">
										<Button
											variant="secondary"
											size="sm"
											disabled={page <= 1}
											onClick={() => setPage((p) => Math.max(1, p - 1))}
										>
											Previous
										</Button>
										<span className="font-martian text-xs">
											{page} / {usersData.totalPages}
										</span>
										<Button
											variant="secondary"
											size="sm"
											disabled={page >= usersData.totalPages}
											onClick={() => setPage((p) => p + 1)}
										>
											Next
										</Button>
									</div>
								</div>
							)}
						</div>
					</>
				)}
			</main>

			{/* ==============================================================================
			    Modals & Dialogs
			   ============================================================================== */}

			{/* Create User Dialog */}
			<CreateUserDialog
				open={createModalOpen}
				onClose={() => setCreateModalOpen(false)}
				onSubmit={(data) => createUserMutation.mutate(data)}
				loading={createUserMutation.isPending}
			/>

			{/* Ban User Dialog */}
			{banModalTarget && (
				<Dialog open onOpenChange={(open) => !open && setBanModalTarget(null)}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Suspend User @{banModalTarget.username}</DialogTitle>
							<DialogDescription>
								Suspending this account prevents the user from signing in and making API calls.
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-4 py-2">
							<div className="space-y-1.5">
								<label htmlFor="ban-reason" className="text-xs font-semibold text-ink">
									Reason for Suspension
								</label>
								<Input
									id="ban-reason"
									placeholder="e.g. Terms violation, fraudulent activity..."
									value={banReason}
									onChange={(e) => setBanReason(e.target.value)}
									className="text-xs"
								/>
							</div>

							<div className="space-y-1.5">
								<label htmlFor="ban-duration" className="text-xs font-semibold text-ink">
									Suspension Duration
								</label>
								<select
									id="ban-duration"
									value={banDurationDays ?? ""}
									onChange={(e) => setBanDurationDays(e.target.value ? Number(e.target.value) : undefined)}
									className="h-9 w-full rounded-md border border-line bg-surface px-3 text-xs text-ink"
								>
									<option value="">Permanent (Until manually unbanned)</option>
									<option value="1">1 Day</option>
									<option value="7">7 Days</option>
									<option value="30">30 Days</option>
									<option value="90">90 Days</option>
								</select>
							</div>
						</div>

						<DialogFooter>
							<Button variant="secondary" onClick={() => setBanModalTarget(null)}>
								Cancel
							</Button>
							<Button
								variant="danger"
								onClick={() =>
									banMutation.mutate({
										userId: banModalTarget.id,
										banned: true,
										reason: banReason,
										durationDays: banDurationDays,
									})
								}
								disabled={banMutation.isPending}
							>
								{banMutation.isPending ? "Suspending..." : "Confirm Suspension"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}

			{/* Reset Password Dialog */}
			{resetPasswordTarget && (
				<Dialog open onOpenChange={(open) => !open && setResetPasswordTarget(null)}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Reset Password for @{resetPasswordTarget.username}</DialogTitle>
							<DialogDescription>
								Enter a new password for this user account. The user will be able to log in immediately with the new
								credentials.
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-2 py-2">
							<label htmlFor="new-password" className="text-xs font-semibold text-ink">
								New Password (min. 6 characters)
							</label>
							<Input
								id="new-password"
								type="text"
								placeholder="Enter new secure password..."
								value={newPasswordValue}
								onChange={(e) => setNewPasswordValue(e.target.value)}
								className="text-xs"
							/>
						</div>

						<DialogFooter>
							<Button variant="secondary" onClick={() => setResetPasswordTarget(null)}>
								Cancel
							</Button>
							<Button
								variant="primary"
								disabled={newPasswordValue.length < 6 || resetPasswordMutation.isPending}
								onClick={() =>
									resetPasswordMutation.mutate({
										userId: resetPasswordTarget.id,
										newPassword: newPasswordValue,
									})
								}
							>
								{resetPasswordMutation.isPending ? "Updating..." : "Set New Password"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}

			{/* Delete User Confirmation Dialog */}
			{deleteModalTarget && (
				<Dialog open onOpenChange={(open) => !open && setDeleteModalTarget(null)}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Permanently Delete @{deleteModalTarget.username}?</DialogTitle>
							<DialogDescription className="text-danger-text">
								Warning: This will permanently delete the user account and purge all their resumes, cover letters, and
								tracked job applications. This action cannot be undone.
							</DialogDescription>
						</DialogHeader>

						<DialogFooter>
							<Button variant="secondary" onClick={() => setDeleteModalTarget(null)}>
								Cancel
							</Button>
							<Button
								variant="danger"
								onClick={() => deleteUserMutation.mutate({ userId: deleteModalTarget.id })}
								disabled={deleteUserMutation.isPending}
							>
								{deleteUserMutation.isPending ? "Deleting..." : "Permanently Delete"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}

			{/* Grant AI Credits Dialog */}
			{grantCreditsTarget && (
				<Dialog open onOpenChange={(open) => !open && setGrantCreditsTarget(null)}>
					<DialogContent>
						<DialogHeader>
							<div className="flex items-center gap-2">
								<Icon name="lightning" className="size-5 fill-amber-500 text-amber-500" />
								<DialogTitle>Grant AI Credits: @{grantCreditsTarget.username}</DialogTitle>
							</div>
							<DialogDescription>
								Add or adjust AI wallet credits for this account. Current balance:{" "}
								<strong className="text-amber-600 dark:text-amber-400">
									{grantCreditsTarget.currentCredits} Credits
								</strong>
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-4 py-2">
							<div className="space-y-1.5">
								<label htmlFor="grant-amount" className="text-xs font-semibold text-ink">
									Credit Amount to Add (or negative to deduct)
								</label>
								<div className="flex items-center gap-2">
									<Input
										id="grant-amount"
										type="number"
										value={grantAmount}
										onChange={(e) => setGrantAmount(Number(e.target.value))}
										className="font-martian text-xs font-bold"
									/>
									<div className="flex items-center gap-1">
										{[10, 25, 50, 100].map((preset) => (
											<button
												key={preset}
												type="button"
												onClick={() => setGrantAmount(preset)}
												className="font-martian rounded-md border border-line bg-surface px-2 py-1 text-xs text-ink hover:bg-hover"
											>
												+{preset}
											</button>
										))}
									</div>
								</div>
							</div>

							<div className="space-y-1.5">
								<label htmlFor="grant-reason" className="text-xs font-semibold text-ink">
									Reason / Note (Logged in ledger)
								</label>
								<Input
									id="grant-reason"
									type="text"
									placeholder="e.g. Compensation, Beta tester reward, Top-up..."
									value={grantReason}
									onChange={(e) => setGrantReason(e.target.value)}
									className="text-xs"
								/>
							</div>
						</div>

						<DialogFooter>
							<Button variant="secondary" onClick={() => setGrantCreditsTarget(null)}>
								Cancel
							</Button>
							<Button
								variant="primary"
								disabled={grantAmount === 0 || grantCreditsMutation.isPending}
								onClick={() =>
									grantCreditsMutation.mutate({
										userId: grantCreditsTarget.id,
										amount: grantAmount,
										reason: grantReason,
									})
								}
							>
								{grantCreditsMutation.isPending
									? "Processing..."
									: `Confirm Grant (${grantAmount > 0 ? "+" : ""}${grantAmount})`}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
}

/* ==============================================================================
   Metric Card Subcomponent
   ============================================================================== */
type MetricCardProps = {
	label: string;
	value: string | number;
	icon: "users" | "trend-up" | "file-text" | "briefcase" | "prohibit" | "crown";
	accent: string;
	bg: string;
};

function MetricCard({ label, value, icon, accent, bg }: MetricCardProps) {
	return (
		<div className="flex items-center gap-3.5 rounded-xl border border-line bg-surface p-4 shadow-xs">
			<div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", bg)}>
				<Icon name={icon} className={cn("size-5", accent)} />
			</div>
			<div className="flex flex-col">
				<span className="font-martian text-lg leading-none font-bold text-ink">{value}</span>
				<span className="mt-1 text-[11px] text-ink-3">{label}</span>
			</div>
		</div>
	);
}

/* ==============================================================================
   Create User Modal
   ============================================================================== */
type CreateUserDialogProps = {
	open: boolean;
	onClose: () => void;
	onSubmit: (data: { name: string; email: string; username: string; password: string; role: "admin" | "user" }) => void;
	loading: boolean;
};

function CreateUserDialog({ open, onClose, onSubmit, loading }: CreateUserDialogProps) {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [role, setRole] = useState<"admin" | "user">("user");

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		onSubmit({ name, email, username, password, role });
	};

	if (!open) return null;

	return (
		<Dialog open onOpenChange={(isOpen) => !isOpen && onClose()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Provision New User Account</DialogTitle>
					<DialogDescription>
						Create a new account with credentials. The user will be able to log in immediately.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-3.5 py-2">
					<div className="space-y-1">
						<label htmlFor="create-name" className="text-xs font-semibold text-ink">
							Full Name
						</label>
						<Input
							id="create-name"
							required
							placeholder="e.g. Jane Doe"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="text-xs"
						/>
					</div>

					<div className="space-y-1">
						<label htmlFor="create-email" className="text-xs font-semibold text-ink">
							Email Address
						</label>
						<Input
							id="create-email"
							type="email"
							required
							placeholder="jane.doe@example.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="text-xs"
						/>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-1">
							<label htmlFor="create-username" className="text-xs font-semibold text-ink">
								Username
							</label>
							<Input
								id="create-username"
								required
								placeholder="janedoe"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								className="text-xs"
							/>
						</div>

						<div className="space-y-1">
							<label htmlFor="create-role" className="text-xs font-semibold text-ink">
								Account Role
							</label>
							<select
								id="create-role"
								value={role}
								onChange={(e) => setRole(e.target.value as "admin" | "user")}
								className="h-9 w-full rounded-md border border-line bg-surface px-3 text-xs text-ink"
							>
								<option value="user">Standard User</option>
								<option value="admin">Administrator</option>
							</select>
						</div>
					</div>

					<div className="space-y-1">
						<label htmlFor="create-password" className="text-xs font-semibold text-ink">
							Initial Password (min. 6 characters)
						</label>
						<Input
							id="create-password"
							type="password"
							required
							minLength={6}
							placeholder="••••••••"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="text-xs"
						/>
					</div>

					<DialogFooter className="pt-2">
						<Button type="button" variant="secondary" onClick={onClose}>
							Cancel
						</Button>
						<Button type="submit" variant="primary" disabled={loading}>
							{loading ? "Creating..." : "Create Account"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
