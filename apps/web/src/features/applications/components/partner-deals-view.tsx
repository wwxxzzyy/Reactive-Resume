import { useId, useMemo, useState } from "react";
import { Badge } from "@reactive-resume/ui/components/badge";
import { Button } from "@reactive-resume/ui/components/button";
import { Icon } from "@reactive-resume/ui/components/icon";
import { Input } from "@reactive-resume/ui/components/input";
import { cn } from "@reactive-resume/utils/style";
import { CAREER_PARTNERS, type PartnerCategory } from "../affiliate";

const CATEGORIES: { id: PartnerCategory | "all"; label: string; icon: string }[] = [
	{ id: "all", label: "All Career Deals", icon: "sparkle" },
	{ id: "jobs", label: "Job Sourcing Boards", icon: "briefcase" },
	{ id: "resume", label: "Expert Resume Audits", icon: "check-circle" },
	{ id: "interview", label: "Mock Interviews & Tech", icon: "chats" },
	{ id: "skills", label: "Certifications", icon: "graduation-cap" },
];

export function PartnerDealsView() {
	const searchId = useId();
	const [activeCategory, setActiveCategory] = useState<PartnerCategory | "all">("all");
	const [searchQuery, setSearchQuery] = useState("");

	const filteredPartners = useMemo(() => {
		return CAREER_PARTNERS.filter((partner) => {
			const matchesCategory = activeCategory === "all" || partner.category === activeCategory;
			const query = searchQuery.trim().toLowerCase();
			const matchesQuery =
				!query ||
				partner.name.toLowerCase().includes(query) ||
				partner.perk.toLowerCase().includes(query) ||
				partner.description.toLowerCase().includes(query);
			return matchesCategory && matchesQuery;
		});
	}, [activeCategory, searchQuery]);

	return (
		<div className="space-y-6">
			{/* Hero Banner */}
			<div className="relative overflow-hidden rounded-2xl border border-accent/20 bg-radial-[at_top_left] from-accent/15 via-sunken/40 to-surface p-6 sm:p-8">
				<div className="max-w-2xl space-y-3">
					<div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent-text">
						<Icon name="sparkle" size={14} />
						<span>Verified Career &amp; Recruitment Partners</span>
					</div>
					<h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
						Accelerate Your Job Hunt with Vetted Partner Perks
					</h2>
					<p className="text-xs leading-relaxed text-ink-2 sm:text-sm">
						We teamed up with top recruitment networks, FAANG mock interviewers, and certified resume reviewers to
						deliver exclusive perks and direct distribution channels for DipperGo job seekers.
					</p>
				</div>
			</div>

			{/* Filter Controls */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				{/* Categories */}
				<div className="flex flex-wrap items-center gap-1.5">
					{CATEGORIES.map((cat) => {
						const active = activeCategory === cat.id;
						return (
							<button
								key={cat.id}
								type="button"
								onClick={() => setActiveCategory(cat.id)}
								className={cn(
									"flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-[background-color,border-color,color]",
									active
										? "border-accent/40 bg-accent/10 text-accent-text"
										: "border-line bg-surface text-ink-2 hover:border-line-2 hover:text-ink",
								)}
							>
								<span>{cat.label}</span>
							</button>
						);
					})}
				</div>

				{/* Search box */}
				<div className="relative min-w-48 sm:max-w-64">
					<Icon
						name="magnifying-glass"
						size={16}
						className="pointer-events-none absolute start-2.5 top-1/2 -translate-y-1/2 text-ink-3"
					/>
					<Input
						id={searchId}
						type="search"
						placeholder="Search partner perks…"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="h-8 ps-8 text-xs"
					/>
				</div>
			</div>

			{/* Partners Grid */}
			{filteredPartners.length === 0 ? (
				<div className="rounded-xl border border-line bg-surface p-12 text-center text-ink-3">
					<Icon name="magnifying-glass" size={24} className="mx-auto mb-2 opacity-50" />
					<p className="text-sm font-medium">No partner deals found matching your search</p>
				</div>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{filteredPartners.map((partner) => (
						<div
							key={partner.id}
							className="group relative flex flex-col justify-between rounded-xl border border-line bg-surface p-5 shadow-2xs transition-[border-color,box-shadow] hover:border-accent/40 hover:shadow-xs"
						>
							<div className="space-y-3">
								<div className="flex items-start justify-between gap-3">
									<div className="flex items-center gap-2.5">
										<div className="grid size-9 place-items-center rounded-lg border border-line bg-sunken/60 text-accent-text">
											<Icon name={partner.icon} size={20} />
										</div>
										<div>
											<h3 className="text-sm font-semibold text-ink group-hover:text-accent-text">{partner.name}</h3>
											<span className="text-[11px] text-ink-3">{partner.categoryLabel}</span>
										</div>
									</div>

									{partner.badge && (
										<Badge variant="accent" className="text-[10px] tracking-wide">
											{partner.badge}
										</Badge>
									)}
								</div>

								{/* Perk Highlight */}
								<div className="rounded-md border border-line-2/50 bg-sunken/40 px-2.5 py-1.5 text-xs font-semibold text-ink">
									✨ {partner.perk}
								</div>

								{/* Description */}
								<p className="text-xs leading-relaxed text-ink-2">{partner.description}</p>
							</div>

							<div className="mt-5 border-t border-line/60 pt-3">
								<Button
									variant="secondary"
									size="sm"
									nativeButton={false}
									render={<a href={partner.url} target="_blank" rel="noopener noreferrer sponsored" />}
									className="w-full justify-between text-xs font-medium group-hover:border-accent/40 group-hover:text-accent-text"
								>
									<span>Claim Partner Offer</span>
									<Icon name="arrow-square-out" size={14} />
								</Button>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Affiliate / FTC Disclosure */}
			<div className="rounded-xl border border-line/60 bg-sunken/20 p-4 text-xs leading-relaxed text-ink-3">
				<div className="flex items-start gap-2.5">
					<Icon name="shield-check" size={18} className="mt-0.5 shrink-0 text-accent-text" />
					<div className="space-y-1">
						<p className="font-semibold text-ink-2">Transparency &amp; Partner Compensation Disclosure</p>
						<p>
							DipperGo works with hand-selected career, recruitment, and education platforms that meet our strict
							quality and ATS compliance standards. When you claim perks or subscribe through these partner links,
							DipperGo may receive referral commissions at zero additional cost to you. This directly funds our free
							resume builder, ATS checker, and hosting infrastructure.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
