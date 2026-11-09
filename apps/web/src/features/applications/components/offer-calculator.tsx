import type { CompensationPackage } from "@reactive-resume/resume/compensation";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { useMemo, useState } from "react";
import { calculateTotalRewards, compareOffers, generateNegotiationScript } from "@reactive-resume/resume/compensation";
import { Button } from "@reactive-resume/ui/components/button";
import { Icon } from "@reactive-resume/ui/components/icon";
import { Input } from "@reactive-resume/ui/components/input";
import { Label } from "@reactive-resume/ui/components/label";
import { toast } from "@reactive-resume/ui/components/toast";

export function OfferCalculator() {
	const [offerA, setOfferA] = useState<CompensationPackage>({
		company: "Company Alpha",
		title: "Senior Engineer",
		baseSalary: 160000,
		bonusPercentage: 10,
		equityGrantTotal: 120000,
		equityVestingYears: 4,
		signOnBonus: 15000,
	});

	const [offerB, setOfferB] = useState<CompensationPackage>({
		company: "Company Beta",
		title: "Lead Engineer",
		baseSalary: 175000,
		bonusPercentage: 15,
		equityGrantTotal: 80000,
		equityVestingYears: 4,
		signOnBonus: 10000,
	});

	const candidateName = "Alex Developer";
	const [negotiationType, setNegotiationType] = useState<"competing-offer" | "counter-offer">("competing-offer");
	const [showScript, setShowScript] = useState(false);

	const rewardsA = useMemo(() => calculateTotalRewards(offerA), [offerA]);
	const rewardsB = useMemo(() => calculateTotalRewards(offerB), [offerB]);

	const comparison = useMemo(() => compareOffers([offerA, offerB]), [offerA, offerB]);

	const script = useMemo(() => {
		return generateNegotiationScript({
			candidateName,
			companyName: offerA.company,
			roleTitle: offerA.title,
			currentOffer: offerA,
			competingOffer: offerB,
			targetBaseSalary: offerA.baseSalary + 15000,
			type: negotiationType,
		});
	}, [candidateName, offerA, offerB, negotiationType]);

	const handleCopyScript = () => {
		void navigator.clipboard.writeText(script);
		toast.add({ description: t`Negotiation email script copied to clipboard!` });
	};

	return (
		<section
			aria-labelledby="offer-calc-title"
			className="grid gap-4 rounded-xl border border-line bg-raised p-5 shadow-xs"
		>
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<Icon name="scales" size={18} className="text-accent" />
					<h2 id="offer-calc-title" className="text-base font-semibold">
						<Trans>Compensation & Total Rewards Calculator</Trans>
					</h2>
				</div>
				<span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent-text">
					<Trans>Side-by-Side Comparison</Trans>
				</span>
			</div>

			<p className="text-xs leading-relaxed text-ink-2">
				<Trans>
					Compare competing job offers across base salary, annual bonuses, sign-on cash, and 4-year equity vesting to
					see your true annualized total rewards.
				</Trans>
			</p>

			<div className="grid gap-4 md:grid-cols-2">
				{/* Offer A */}
				<div className="grid gap-3 rounded-xl border border-line-2 bg-surface p-4">
					<div className="flex items-center justify-between">
						<strong className="text-ink-1 text-sm font-semibold">
							<Trans>Offer A</Trans>
						</strong>
						<span className="font-display text-base font-bold text-accent">
							${rewardsA.firstYearTotal.toLocaleString()} <span className="text-xs font-normal text-ink-3">/ yr 1</span>
						</span>
					</div>

					<div className="grid grid-cols-2 gap-2 text-xs">
						<div>
							<Label className="text-[11px] text-ink-3">
								<Trans>Company</Trans>
							</Label>
							<Input
								className="h-8 text-xs"
								value={offerA.company}
								onChange={(e) => setOfferA({ ...offerA, company: e.target.value })}
							/>
						</div>
						<div>
							<Label className="text-[11px] text-ink-3">
								<Trans>Base Salary ($)</Trans>
							</Label>
							<Input
								type="number"
								className="h-8 text-xs"
								value={offerA.baseSalary}
								onChange={(e) => setOfferA({ ...offerA, baseSalary: Number(e.target.value) || 0 })}
							/>
						</div>
						<div>
							<Label className="text-[11px] text-ink-3">
								<Trans>Bonus %</Trans>
							</Label>
							<Input
								type="number"
								className="h-8 text-xs"
								value={offerA.bonusPercentage ?? 0}
								onChange={(e) => setOfferA({ ...offerA, bonusPercentage: Number(e.target.value) || 0 })}
							/>
						</div>
						<div>
							<Label className="text-[11px] text-ink-3">
								<Trans>Sign-On ($)</Trans>
							</Label>
							<Input
								type="number"
								className="h-8 text-xs"
								value={offerA.signOnBonus ?? 0}
								onChange={(e) => setOfferA({ ...offerA, signOnBonus: Number(e.target.value) || 0 })}
							/>
						</div>
						<div className="col-span-2">
							<Label className="text-[11px] text-ink-3">
								<Trans>Total 4-Yr Equity ($)</Trans>
							</Label>
							<Input
								type="number"
								className="h-8 text-xs"
								value={offerA.equityGrantTotal}
								onChange={(e) => setOfferA({ ...offerA, equityGrantTotal: Number(e.target.value) || 0 })}
							/>
						</div>
					</div>

					<div className="mt-1 border-t border-line-2 pt-2 text-xs text-ink-2">
						<div className="flex justify-between py-0.5">
							<span>
								<Trans>Annual 4-Yr Average:</Trans>
							</span>
							<strong className="text-ink-1">${rewardsA.annualAverageTotal.toLocaleString()}</strong>
						</div>
						<div className="flex justify-between py-0.5">
							<span>
								<Trans>4-Year Total Rewards:</Trans>
							</span>
							<strong className="text-ink-1">${rewardsA.fourYearTotal.toLocaleString()}</strong>
						</div>
						<div className="flex justify-between py-0.5 text-[11px] text-ink-3">
							<span>
								<Trans>Cash / Equity Ratio:</Trans>
							</span>
							<span>
								{rewardsA.cashPercentage}% / {rewardsA.equityPercentage}%
							</span>
						</div>
					</div>
				</div>

				{/* Offer B */}
				<div className="grid gap-3 rounded-xl border border-line-2 bg-surface p-4">
					<div className="flex items-center justify-between">
						<strong className="text-ink-1 text-sm font-semibold">
							<Trans>Offer B</Trans>
						</strong>
						<span className="font-display text-base font-bold text-accent">
							${rewardsB.firstYearTotal.toLocaleString()} <span className="text-xs font-normal text-ink-3">/ yr 1</span>
						</span>
					</div>

					<div className="grid grid-cols-2 gap-2 text-xs">
						<div>
							<Label className="text-[11px] text-ink-3">
								<Trans>Company</Trans>
							</Label>
							<Input
								className="h-8 text-xs"
								value={offerB.company}
								onChange={(e) => setOfferB({ ...offerB, company: e.target.value })}
							/>
						</div>
						<div>
							<Label className="text-[11px] text-ink-3">
								<Trans>Base Salary ($)</Trans>
							</Label>
							<Input
								type="number"
								className="h-8 text-xs"
								value={offerB.baseSalary}
								onChange={(e) => setOfferB({ ...offerB, baseSalary: Number(e.target.value) || 0 })}
							/>
						</div>
						<div>
							<Label className="text-[11px] text-ink-3">
								<Trans>Bonus %</Trans>
							</Label>
							<Input
								type="number"
								className="h-8 text-xs"
								value={offerB.bonusPercentage ?? 0}
								onChange={(e) => setOfferB({ ...offerB, bonusPercentage: Number(e.target.value) || 0 })}
							/>
						</div>
						<div>
							<Label className="text-[11px] text-ink-3">
								<Trans>Sign-On ($)</Trans>
							</Label>
							<Input
								type="number"
								className="h-8 text-xs"
								value={offerB.signOnBonus ?? 0}
								onChange={(e) => setOfferB({ ...offerB, signOnBonus: Number(e.target.value) || 0 })}
							/>
						</div>
						<div className="col-span-2">
							<Label className="text-[11px] text-ink-3">
								<Trans>Total 4-Yr Equity ($)</Trans>
							</Label>
							<Input
								type="number"
								className="h-8 text-xs"
								value={offerB.equityGrantTotal}
								onChange={(e) => setOfferB({ ...offerB, equityGrantTotal: Number(e.target.value) || 0 })}
							/>
						</div>
					</div>

					<div className="mt-1 border-t border-line-2 pt-2 text-xs text-ink-2">
						<div className="flex justify-between py-0.5">
							<span>
								<Trans>Annual 4-Yr Average:</Trans>
							</span>
							<strong className="text-ink-1">${rewardsB.annualAverageTotal.toLocaleString()}</strong>
						</div>
						<div className="flex justify-between py-0.5">
							<span>
								<Trans>4-Year Total Rewards:</Trans>
							</span>
							<strong className="text-ink-1">${rewardsB.fourYearTotal.toLocaleString()}</strong>
						</div>
						<div className="flex justify-between py-0.5 text-[11px] text-ink-3">
							<span>
								<Trans>Cash / Equity Ratio:</Trans>
							</span>
							<span>
								{rewardsB.cashPercentage}% / {rewardsB.equityPercentage}%
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Delta Callout */}
			<div className="flex items-center justify-between rounded-xl bg-accent-soft p-3 text-xs">
				<div className="flex items-center gap-2">
					<Icon name="trend-up" size={16} className="text-accent" />
					<span>
						<strong className="text-accent-text">{comparison.highestYearOne}</strong> delivers the highest Year 1
						compensation with an advantage of <strong>${comparison.deltaYearOne.toLocaleString()}</strong>.
					</span>
				</div>
				<Button
					size="sm"
					variant="ghost"
					className="h-7 text-xs font-semibold text-accent-text"
					onClick={() => setShowScript(!showScript)}
				>
					<Icon name="chat-text" size={14} />
					{showScript ? <Trans>Hide Email</Trans> : <Trans>Negotiation Script</Trans>}
				</Button>
			</div>

			{/* Negotiation Script Generator */}
			{showScript && (
				<div className="grid gap-2.5 rounded-xl border border-line bg-surface p-4">
					<div className="flex flex-wrap items-center justify-between gap-2">
						<span className="text-ink-1 text-xs font-semibold">
							<Trans>Tailored Negotiation Script</Trans>
						</span>
						<div className="flex gap-1.5">
							<Button
								size="sm"
								variant={negotiationType === "competing-offer" ? "secondary" : "ghost"}
								className="h-7 text-xs"
								onClick={() => setNegotiationType("competing-offer")}
							>
								<Trans>Competing Offer</Trans>
							</Button>
							<Button
								size="sm"
								variant={negotiationType === "counter-offer" ? "secondary" : "ghost"}
								className="h-7 text-xs"
								onClick={() => setNegotiationType("counter-offer")}
							>
								<Trans>Counter Offer</Trans>
							</Button>
						</div>
					</div>

					<pre className="max-h-48 overflow-y-auto rounded-lg bg-sunken p-3 font-mono text-[11px] whitespace-pre-wrap text-ink-2">
						{script}
					</pre>

					<div className="flex justify-end">
						<Button size="sm" variant="secondary" className="gap-1.5 text-xs" onClick={handleCopyScript}>
							<Icon name="copy" size={14} />
							<Trans>Copy Email to Clipboard</Trans>
						</Button>
					</div>
				</div>
			)}
		</section>
	);
}
