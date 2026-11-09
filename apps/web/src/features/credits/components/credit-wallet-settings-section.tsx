import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@reactive-resume/ui/components/button";
import { Icon } from "@reactive-resume/ui/components/icon";
import { CreditWalletDialog } from "./credit-wallet-dialog";
import { orpc } from "@/libs/orpc/client";

export function CreditWalletSettingsSection() {
	const [dialogOpen, setDialogOpen] = useState(false);
	const { data: balanceData } = useQuery(orpc.credits.getBalance.queryOptions());

	const balance = balanceData?.credits ?? 3;

	return (
		<section className="space-y-4 rounded-xl border border-line bg-surface p-6 shadow-xs">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-start gap-3">
					<div className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-500/15 text-amber-500">
						<Icon name="lightning" size={22} className="fill-amber-500" />
					</div>
					<div className="space-y-1">
						<div className="flex items-center gap-2">
							<h3 className="text-base font-bold text-ink">AI Credit Wallet &amp; Economy</h3>
							<span className="font-martian rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400">
								{balance} Credits Available
							</span>
						</div>
						<p className="text-xs text-ink-3">
							Use pay-as-you-go credits for hosted AI resume tailoring, STAR interview stories, and ATS scoring. No
							monthly subscription required.
						</p>
					</div>
				</div>

				<Button
					variant="primary"
					onClick={() => setDialogOpen(true)}
					className="gap-1.5 self-start text-xs font-semibold sm:self-auto"
				>
					<Icon name="lightning" size={14} className="fill-current" />
					<span>Top Up Credits</span>
				</Button>
			</div>

			<CreditWalletDialog open={dialogOpen} onOpenChange={setDialogOpen} />
		</section>
	);
}
