import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Badge } from "@reactive-resume/ui/components/badge";
import { Button } from "@reactive-resume/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@reactive-resume/ui/components/dialog";
import { Icon } from "@reactive-resume/ui/components/icon";
import { toast } from "@reactive-resume/ui/components/toast";
import { cn } from "@reactive-resume/utils/style";
import { orpc } from "@/libs/orpc/client";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function CreditWalletDialog({ open, onOpenChange }: Props) {
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState<"packs" | "history">("packs");

	// Queries
	const { data: balanceData, isPending: isBalanceLoading } = useQuery({
		...orpc.credits.getBalance.queryOptions(),
		enabled: open,
	});

	const { data: packsData } = useQuery({
		...orpc.credits.getPacks.queryOptions(),
		enabled: open,
	});

	const { data: transactionsData, isPending: isTransactionsLoading } = useQuery({
		...orpc.credits.getTransactions.queryOptions({ input: { limit: 30, offset: 0 } }),
		enabled: open && activeTab === "history",
	});

	const isStripeEnabled = Boolean(packsData?.stripeEnabled);

	// Stripe Checkout Session Mutation
	const checkoutMutation = useMutation(
		orpc.credits.createCheckoutSession.mutationOptions({
			onSuccess: (res) => {
				if (res.url) {
					window.location.assign(res.url);
				}
			},
			onError: (err) => {
				toast.add({
					type: "error",
					title: "Checkout Error",
					description: err.message,
				});
			},
		}),
	);

	// Fallback direct purchase mutation for dev or when Stripe is unconfigured
	const purchaseMutation = useMutation(
		orpc.credits.purchasePack.mutationOptions({
			onSuccess: (res) => {
				toast.add({
					type: "success",
					title: "AI Credits Added!",
					description: `Successfully topped up +${res.creditsAdded} credits to your AI Wallet. New balance: ${res.newBalance} credits.`,
				});
				void queryClient.invalidateQueries({ queryKey: orpc.credits.getBalance.key() });
				void queryClient.invalidateQueries({ queryKey: orpc.credits.getTransactions.key() });
			},
			onError: (err) => {
				toast.add({
					type: "error",
					title: "Purchase Failed",
					description: err.message,
				});
			},
		}),
	);

	const isProcessing = checkoutMutation.isPending || purchaseMutation.isPending;
	const activePackId = checkoutMutation.variables?.packId ?? purchaseMutation.variables?.packId;

	const handleBuyPack = (packId: "starter" | "hunter" | "executive") => {
		if (isStripeEnabled) {
			checkoutMutation.mutate({ packId });
		} else {
			purchaseMutation.mutate({ packId });
		}
	};

	const balance = balanceData?.credits ?? 3;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[88svh] overflow-y-auto sm:max-w-2xl">
				<DialogHeader>
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div className="flex items-center gap-2.5">
							<div className="grid size-9 place-items-center rounded-xl bg-amber-500/15 text-amber-500">
								<Icon name="lightning" size={20} className="fill-amber-500" />
							</div>
							<div>
								<DialogTitle className="text-lg font-bold text-ink">DipperGo AI Wallet</DialogTitle>
								<DialogDescription className="text-xs text-ink-3">
									Pay-as-you-go AI credits for resume tailoring, ATS scans, and cover letters.
								</DialogDescription>
							</div>
						</div>

						{/* Current Balance Pill */}
						<div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 shadow-2xs">
							<span className="text-[11px] font-medium text-amber-700 dark:text-amber-300">Balance:</span>
							<span className="font-martian text-base font-bold text-amber-600 dark:text-amber-400">
								{isBalanceLoading ? "—" : balance}
							</span>
							<span className="text-[10px] font-semibold text-amber-600/80 uppercase dark:text-amber-400/80">
								Credits
							</span>
						</div>
					</div>
				</DialogHeader>

				{/* Tab switcher */}
				<div className="flex items-center gap-2 border-b border-line pt-2 pb-3">
					<button
						type="button"
						onClick={() => setActiveTab("packs")}
						className={cn(
							"flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors",
							activeTab === "packs"
								? "border-accent/40 bg-accent/10 text-accent-text"
								: "border-line bg-surface text-ink-2 hover:border-line-2 hover:text-ink",
						)}
					>
						<Icon name="sparkle" size={14} />
						<span>Top Up Credit Packs</span>
					</button>

					<button
						type="button"
						onClick={() => setActiveTab("history")}
						className={cn(
							"flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors",
							activeTab === "history"
								? "border-accent/40 bg-accent/10 text-accent-text"
								: "border-line bg-surface text-ink-2 hover:border-line-2 hover:text-ink",
						)}
					>
						<Icon name="arrows-clockwise" size={14} />
						<span>Transaction Ledger</span>
					</button>
				</div>

				{activeTab === "packs" ? (
					<div className="space-y-6 py-2">
						{/* Packs Grid */}
						<div className="grid gap-3.5 sm:grid-cols-3">
							{(packsData?.packs ?? []).map((pack) => {
								const isSelected = pack.popular;
								return (
									<div
										key={pack.id}
										className={cn(
											"relative flex flex-col justify-between rounded-xl border p-4 shadow-2xs transition-[border-color,box-shadow]",
											isSelected
												? "border-accent/60 bg-accent/5 ring-1 ring-accent/30"
												: "border-line bg-surface hover:border-line-2",
										)}
									>
										{pack.badge && (
											<div className="absolute end-3 -top-2.5">
												<Badge
													variant={pack.popular ? "accent" : "neutral"}
													className="text-[9.5px] font-semibold tracking-wide uppercase shadow-2xs"
												>
													{pack.badge}
												</Badge>
											</div>
										)}

										<div className="space-y-3">
											<div>
												<h4 className="text-sm font-bold text-ink">{pack.name}</h4>
												<p className="mt-0.5 text-[11px] text-ink-3">{pack.description}</p>
											</div>

											{/* Price & Credits Callout */}
											<div className="rounded-lg border border-line/60 bg-sunken/40 p-2.5">
												<div className="flex items-baseline justify-between">
													<span className="font-martian text-xl font-bold text-ink">{pack.priceDisplay}</span>
													<span className="font-martian text-xs font-bold text-amber-500">+{pack.credits} Credits</span>
												</div>
												<div className="mt-1 flex items-center justify-between text-[10.5px] text-ink-3">
													<span>{pack.perCreditDisplay}</span>
													{pack.savingsDisplay && (
														<span className="font-semibold text-emerald-600 dark:text-emerald-400">
															{pack.savingsDisplay}
														</span>
													)}
												</div>
											</div>

											{/* Features checklist */}
											<ul className="space-y-1.5 text-[11px] text-ink-2">
												{pack.features.map((feature) => (
													<li key={feature} className="flex items-start gap-1.5">
														<Icon name="check" size={13} className="mt-0.5 shrink-0 text-emerald-500" />
														<span>{feature}</span>
													</li>
												))}
											</ul>
										</div>

										<div className="mt-5 pt-2">
											<Button
												variant={pack.popular ? "primary" : "secondary"}
												size="sm"
												className="w-full text-xs font-semibold"
												disabled={isProcessing}
												onClick={() => handleBuyPack(pack.id)}
											>
												{isProcessing && activePackId === pack.id ? (
													<>
														<Icon name="circle-notch" className="size-3.5 animate-spin" />
														{isStripeEnabled ? "Redirecting to Stripe..." : "Processing..."}
													</>
												) : (
													<>
														<Icon name="lightning" size={14} className="fill-current" />
														{isStripeEnabled ? `Pay ${pack.priceDisplay}` : `Top Up ${pack.priceDisplay}`}
													</>
												)}
											</Button>
										</div>
									</div>
								);
							})}
						</div>

						{/* Secure Payment Callout */}
						{isStripeEnabled && (
							<div className="flex items-center justify-center gap-1.5 py-1 text-[11px] text-ink-3">
								<Icon name="shield-check" size={14} className="text-emerald-500" />
								<span>Official Stripe Checkout · 256-bit SSL encrypted · Cards, Apple Pay, Google Pay</span>
							</div>
						)}

						{/* Credit Cost Guide Card */}
						<div className="rounded-xl border border-line/70 bg-sunken/30 p-4">
							<h4 className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-ink uppercase">
								<Icon name="sparkle" size={14} className="text-accent" />
								<span>How Credits Are Spent</span>
							</h4>
							<div className="mt-2.5 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
								<div className="rounded-lg border border-line/60 bg-surface p-2.5">
									<div className="flex items-center justify-between">
										<span className="text-[11px] text-ink-3">Line Optimizer</span>
										<Badge variant="neutral" className="text-[10px]">
											1 Credit
										</Badge>
									</div>
									<span className="mt-1 block text-[10.5px] text-ink-2">Action verbs &amp; metrics</span>
								</div>
								<div className="rounded-lg border border-line/60 bg-surface p-2.5">
									<div className="flex items-center justify-between">
										<span className="text-[11px] text-ink-3">ATS Match Scan</span>
										<Badge variant="neutral" className="text-[10px]">
											1 Credit
										</Badge>
									</div>
									<span className="mt-1 block text-[10.5px] text-ink-2">Keyword gap analysis</span>
								</div>
								<div className="rounded-lg border border-line/60 bg-surface p-2.5">
									<div className="flex items-center justify-between">
										<span className="text-[11px] text-ink-3">Full Job Tailor</span>
										<Badge variant="accent" className="text-[10px]">
											2 Credits
										</Badge>
									</div>
									<span className="mt-1 block text-[10.5px] text-ink-2">Targeted resume rewrite</span>
								</div>
								<div className="rounded-lg border border-line/60 bg-surface p-2.5">
									<div className="flex items-center justify-between">
										<span className="text-[11px] text-ink-3">STAR Stories</span>
										<Badge variant="accent" className="text-[10px]">
											2 Credits
										</Badge>
									</div>
									<span className="mt-1 block text-[10.5px] text-ink-2">Interview coach flashcards</span>
								</div>
							</div>
							<p className="mt-3 text-[10.5px] leading-relaxed text-ink-3">
								* Note: If you configure your own personal API key in Settings &rarr; AI &amp; developer, your requests
								are processed via your own provider at <strong>0 credits cost</strong>.
							</p>
						</div>
					</div>
				) : (
					/* Transaction Ledger View */
					<div className="space-y-3 py-2">
						{isTransactionsLoading ? (
							<div className="py-12 text-center text-xs text-ink-3">
								<Icon name="circle-notch" className="mx-auto size-5 animate-spin text-accent" />
								<span className="mt-2 block">Loading credit history...</span>
							</div>
						) : transactionsData?.items.length === 0 ? (
							<div className="rounded-xl border border-line bg-surface p-8 text-center text-xs text-ink-3">
								<Icon name="lightning" size={24} className="mx-auto mb-2 text-amber-500 opacity-40" />
								<p className="font-semibold text-ink">No credit transactions recorded yet</p>
								<p className="mt-1">When you use AI tailoring or purchase packs, activity will appear here.</p>
							</div>
						) : (
							<div className="overflow-hidden rounded-xl border border-line bg-surface">
								<table className="w-full text-start text-xs">
									<thead>
										<tr className="font-martian border-b border-line bg-raised/30 text-[10px] text-ink-3 uppercase">
											<th className="px-3.5 py-2.5 text-start font-semibold">Description</th>
											<th className="px-3.5 py-2.5 text-start font-semibold">Type</th>
											<th className="px-3.5 py-2.5 text-end font-semibold">Amount</th>
											<th className="px-3.5 py-2.5 text-end font-semibold">Balance After</th>
											<th className="px-3.5 py-2.5 text-end font-semibold">Date</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-line/60">
										{transactionsData?.items.map((tx) => {
											const isPositive = tx.amount > 0;
											return (
												<tr key={tx.id} className="transition-colors hover:bg-raised/30">
													<td className="px-3.5 py-2.5 font-medium text-ink">{tx.description}</td>
													<td className="px-3.5 py-2.5">
														<Badge
															variant={
																tx.type === "purchase"
																	? "accent"
																	: tx.type === "signup_bonus"
																		? "neutral"
																		: tx.type === "admin_grant"
																			? "accent"
																			: "neutral"
															}
															className="text-[9.5px]"
														>
															{tx.type}
														</Badge>
													</td>
													<td
														className={cn(
															"font-martian px-3.5 py-2.5 text-end font-bold",
															isPositive
																? "text-emerald-600 dark:text-emerald-400"
																: "text-rose-600 dark:text-rose-400",
														)}
													>
														{isPositive ? `+${tx.amount}` : tx.amount}
													</td>
													<td className="font-martian px-3.5 py-2.5 text-end text-ink-2">{tx.balanceAfter}</td>
													<td className="font-martian px-3.5 py-2.5 text-end text-[10.5px] text-ink-3">
														{new Date(tx.createdAt).toLocaleDateString(undefined, {
															month: "short",
															day: "numeric",
															hour: "2-digit",
															minute: "2-digit",
														})}
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						)}
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
