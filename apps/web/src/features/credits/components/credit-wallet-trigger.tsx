import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Badge } from "@reactive-resume/ui/components/badge";
import { Icon } from "@reactive-resume/ui/components/icon";
import { toast } from "@reactive-resume/ui/components/toast";
import { cn } from "@reactive-resume/utils/style";
import { CreditWalletDialog } from "./credit-wallet-dialog";
import { orpc } from "@/libs/orpc/client";

type Props = {
	className?: string;
	compact?: boolean;
};

export function CreditWalletTrigger({ className, compact }: Props) {
	const [open, setOpen] = useState(false);
	const queryClient = useQueryClient();
	const { data: balanceData } = useQuery(orpc.credits.getBalance.queryOptions());

	useEffect(() => {
		const searchParams = new URLSearchParams(window.location.search);
		const payment = searchParams.get("payment");
		if (payment === "success") {
			toast.add({
				type: "success",
				title: "Payment Received!",
				description: "Thank you for your purchase. Your AI credits have been added to your wallet.",
			});
			void queryClient.invalidateQueries({ queryKey: orpc.credits.getBalance.key() });
			void queryClient.invalidateQueries({ queryKey: orpc.credits.getTransactions.key() });
			searchParams.delete("payment");
			searchParams.delete("pack");
			searchParams.delete("session_id");
			const newQuery = searchParams.toString();
			window.history.replaceState(null, "", window.location.pathname + (newQuery ? `?${newQuery}` : ""));
		} else if (payment === "cancelled") {
			toast.add({
				type: "info",
				title: "Checkout Cancelled",
				description: "No charges were made. You can top up whenever you're ready.",
			});
			searchParams.delete("payment");
			const newQuery = searchParams.toString();
			window.history.replaceState(null, "", window.location.pathname + (newQuery ? `?${newQuery}` : ""));
		}
	}, [queryClient]);

	const balance = balanceData?.credits ?? 3;

	return (
		<>
			<button
				type="button"
				onClick={() => setOpen(true)}
				title="AI Credit Wallet: Click to top up credits or view ledger"
				className={cn(
					"group flex items-center justify-between gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 text-xs font-semibold text-amber-700 transition-[background-color,border-color,box-shadow] hover:border-amber-500/50 hover:bg-amber-500/15 dark:text-amber-300",
					compact ? "size-8 justify-center p-0" : "h-9 px-3",
					className,
				)}
			>
				<div className="flex items-center gap-1.5">
					<Icon
						name="lightning"
						size={14}
						className="fill-amber-500 text-amber-500 transition-transform group-hover:scale-110"
					/>
					{!compact && <span>AI Wallet</span>}
				</div>

				{!compact && (
					<Badge
						variant="accent"
						className="font-martian border-amber-500/30 bg-amber-500/20 text-[10px] text-amber-800 dark:text-amber-200"
					>
						{balance} Credits
					</Badge>
				)}
			</button>

			<CreditWalletDialog open={open} onOpenChange={setOpen} />
		</>
	);
}
