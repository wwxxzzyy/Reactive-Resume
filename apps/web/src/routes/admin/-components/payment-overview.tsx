import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Badge } from "@reactive-resume/ui/components/badge";
import { Button } from "@reactive-resume/ui/components/button";
import { Icon } from "@reactive-resume/ui/components/icon";
import { toast } from "@reactive-resume/ui/components/toast";
import { orpc } from "@/libs/orpc/client";

export function PaymentOverview({ onRefresh }: { onRefresh?: () => void }) {
	const [copied, setCopied] = useState(false);
	const { data, isLoading, refetch } = useQuery(orpc.admin.getPaymentOverview.queryOptions());

	const handleCopyWebhook = () => {
		if (!data?.webhookUrl) return;
		void navigator.clipboard.writeText(data.webhookUrl);
		setCopied(true);
		toast.add({
			type: "success",
			title: "Copied to clipboard",
			description: "Stripe webhook endpoint URL copied.",
		});
		setTimeout(() => setCopied(false), 2000);
	};

	const isReady = Boolean(data?.isConfigured);
	const hasWebhook = Boolean(data?.hasWebhookSecret);

	return (
		<div className="space-y-6">
			{/* Header Card */}
			<div className="rounded-xl border border-line bg-surface p-6 shadow-xs">
				<div className="flex flex-wrap items-center justify-between gap-4">
					<div className="flex items-center gap-3">
						<div className="grid size-11 place-items-center rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400">
							<Icon name="crown" size={24} />
						</div>
						<div>
							<div className="flex items-center gap-2">
								<h3 className="text-base font-bold text-ink">Stripe Checkout Integration</h3>
								<Badge
									variant={isReady ? "accent" : "warn"}
									className="font-martian text-[10px] tracking-wider uppercase"
								>
									{isReady ? "Gateway Active" : "Setup Required"}
								</Badge>
							</div>
							<p className="mt-0.5 text-xs text-ink-3">
								Official Stripe Hosted Checkout for selling AI credit packs (Cards, Apple Pay, Google Pay).
							</p>
						</div>
					</div>

					<Button
						variant="secondary"
						size="sm"
						onClick={() => {
							void refetch();
							onRefresh?.();
						}}
						className="gap-1.5 text-xs"
					>
						<Icon name="arrows-clockwise" className="size-3.5" />
						<span>Refresh Status</span>
					</Button>
				</div>
			</div>

			{/* Status & Configuration Cards */}
			<div className="grid gap-6 md:grid-cols-2">
				{/* Gateway Status */}
				<div className="rounded-xl border border-line bg-surface p-6 shadow-xs">
					<div className="flex items-center gap-2">
						<Icon name="shield-check" className="size-4 text-accent" />
						<h4 className="text-sm font-semibold text-ink">Environment Keys Status</h4>
					</div>
					<p className="mt-1 text-xs text-ink-3">
						Server credentials required to create checkout sessions and verify incoming webhooks.
					</p>

					<div className="mt-4 space-y-3">
						<div className="flex items-center justify-between rounded-lg border border-line/60 bg-sunken/40 p-3">
							<div className="space-y-0.5">
								<div className="font-mono text-xs font-semibold text-ink">STRIPE_SECRET_KEY</div>
								<div className="text-[11px] text-ink-3">Creates hosted checkout sessions on Stripe API</div>
							</div>
							<Badge variant={isReady ? "accent" : "danger"} className="font-martian text-[10px]">
								{isReady ? "Configured" : "Missing"}
							</Badge>
						</div>

						<div className="flex items-center justify-between rounded-lg border border-line/60 bg-sunken/40 p-3">
							<div className="space-y-0.5">
								<div className="font-mono text-xs font-semibold text-ink">STRIPE_WEBHOOK_SECRET</div>
								<div className="text-[11px] text-ink-3">Verifies cryptographic HMAC signature on events</div>
							</div>
							<Badge variant={hasWebhook ? "accent" : "warn"} className="font-martian text-[10px]">
								{hasWebhook ? "Configured" : "Optional / Missing"}
							</Badge>
						</div>
					</div>

					<div className="mt-5 rounded-lg border border-line/60 bg-sunken/30 p-3.5 text-xs text-ink-2">
						<div className="font-semibold text-ink">How to activate in production:</div>
						<p className="mt-1 leading-relaxed text-ink-3">
							Add <code className="font-mono text-[11px] text-ink">STRIPE_SECRET_KEY=sk_live_...</code> and{" "}
							<code className="font-mono text-[11px] text-ink">STRIPE_WEBHOOK_SECRET=whsec_...</code> to your production{" "}
							<code className="font-mono text-[11px] text-ink">/root/reactive-resume/.env</code> file on the server,
							then restart the container.
						</p>
					</div>
				</div>

				{/* Webhook Endpoint */}
				<div className="rounded-xl border border-line bg-surface p-6 shadow-xs">
					<div className="flex items-center gap-2">
						<Icon name="share-network" className="size-4 text-purple-500" />
						<h4 className="text-sm font-semibold text-ink">Stripe Webhook Endpoint</h4>
					</div>
					<p className="mt-1 text-xs text-ink-3">
						Configure this endpoint in your Stripe Dashboard to credit wallets upon successful payment.
					</p>

					<div className="mt-4 space-y-3">
						<div>
							<label htmlFor="stripe-webhook-url" className="text-xs font-medium text-ink-2">
								Webhook URL (POST)
							</label>
							<div className="mt-1.5 flex items-center gap-2">
								<input
									id="stripe-webhook-url"
									type="text"
									readOnly
									value={isLoading ? "Loading..." : (data?.webhookUrl ?? "")}
									className="h-9 flex-1 rounded-lg border border-line bg-sunken px-3 font-mono text-xs text-ink select-all focus:outline-hidden"
								/>
								<Button size="sm" variant="secondary" onClick={handleCopyWebhook} className="gap-1 text-xs">
									<Icon name={copied ? "check" : "copy"} className="size-3.5" />
									<span>{copied ? "Copied" : "Copy"}</span>
								</Button>
							</div>
						</div>

						<div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-3.5 text-xs text-ink-2">
							<div className="font-semibold text-purple-700 dark:text-purple-300">Stripe Dashboard Setup:</div>
							<ol className="mt-2 list-decimal space-y-1 ps-4 text-[11px] leading-relaxed text-ink-3">
								<li>
									Open <strong>Stripe Dashboard → Developers → Webhooks</strong>.
								</li>
								<li>
									Click <strong>Add destination / Add endpoint</strong> and paste the URL above.
								</li>
								<li>
									Select event to listen to: <code className="font-mono text-ink">checkout.session.completed</code>.
								</li>
								<li>
									Copy the <strong>Signing secret</strong> (starts with{" "}
									<code className="font-mono text-ink">whsec_</code>) into your server{" "}
									<code className="font-mono text-ink">.env</code>.
								</li>
							</ol>
						</div>
					</div>
				</div>
			</div>

			{/* Active Credit Packs Card */}
			<div className="rounded-xl border border-line bg-surface p-6 shadow-xs">
				<div className="flex items-center justify-between">
					<div>
						<h4 className="text-sm font-semibold text-ink">Configured AI Credit Packs</h4>
						<p className="mt-0.5 text-xs text-ink-3">Current packages offered in the user AI wallet top-up modal.</p>
					</div>
				</div>

				<div className="mt-4 grid gap-4 sm:grid-cols-3">
					{data?.packs.map((pack) => (
						<div key={pack.id} className="rounded-xl border border-line/70 bg-sunken/40 p-4">
							<div className="flex items-center justify-between">
								<span className="font-semibold text-ink">{pack.name}</span>
								<Badge variant="accent" className="font-martian text-[10px]">
									+{pack.credits} Credits
								</Badge>
							</div>
							<div className="mt-3 flex items-baseline gap-1">
								<span className="font-martian text-2xl font-bold text-ink">{pack.priceDisplay}</span>
								<span className="text-[11px] text-ink-3">USD one-time</span>
							</div>
							<div className="mt-1 text-[11px] text-ink-3">
								{(pack.price / pack.credits).toLocaleString("en-US", {
									style: "currency",
									currency: "USD",
									minimumFractionDigits: 2,
								})}{" "}
								per credit
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
