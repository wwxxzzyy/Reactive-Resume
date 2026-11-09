import { Link } from "@tanstack/react-router";
import { Badge } from "@reactive-resume/ui/components/badge";
import { Button } from "@reactive-resume/ui/components/button";
import { Icon } from "@reactive-resume/ui/components/icon";
import { cn } from "@reactive-resume/utils/style";

const CREDIT_PACKS = [
	{
		id: "free",
		name: "Free Forever",
		tag: "Core Platform",
		price: "$0",
		period: "forever",
		subtext: "No credit card required",
		badge: "100% Free Core",
		description: "The complete resume builder, design suite, and job tracker with zero paywalls.",
		features: [
			"Unlimited resumes & cover letters",
			"All 12 recruiter-approved ATS templates",
			"Vector PDF & Word (.docx) downloads",
			"3 Free AI welcome credits on registration",
			"Bring Your Own Key (BYOK) for $0 unlimited AI",
			"Live JD keyword matcher & ATS score dial",
			"1-Click page squeezer (auto-fit overflow)",
			"Full Kanban job application tracker",
		],
		buttonText: "Start Building Free",
		buttonVariant: "secondary" as const,
		highlight: false,
	},
	{
		id: "starter",
		name: "Starter Pack",
		tag: "Targeted Search",
		price: "$4.99",
		period: "one-time",
		subtext: "25 Credits · 20¢ per credit",
		description: "Ideal for tailoring a few targeted job applications without monthly fees.",
		features: [
			"25 AI Tailoring & ATS Scans",
			"Bullet & action-verb optimizer",
			"Targeted cover letter generator",
			"Credits never expire",
			"Zero recurring charges",
		],
		buttonText: "Top Up 25 Credits",
		buttonVariant: "secondary" as const,
		highlight: false,
	},
	{
		id: "hunter",
		name: "Job Hunter Pack",
		tag: "Active Hunt",
		price: "$12.99",
		period: "one-time",
		subtext: "80 Credits · 16¢ per credit",
		badge: "Most Popular",
		savings: "Save 20%",
		popular: true,
		description: "Maximum efficiency for active job seekers applying across 20–40 roles.",
		features: [
			"80 AI Tailoring Credits",
			"Full resume job description tailoring",
			"ATS keyword gap analysis & fixes",
			"STAR interview behavioral stories coach",
			"Fast-track priority server generation",
			"Balance never expires",
		],
		buttonText: "Get 80 Credits",
		buttonVariant: "primary" as const,
		highlight: true,
	},
	{
		id: "executive",
		name: "Career Accelerator",
		tag: "Executive & High Volume",
		price: "$24.99",
		period: "one-time",
		subtext: "200 Credits · 12¢ per credit",
		badge: "Best Value",
		savings: "Save 40%",
		description: "High-volume applications and multiple resume variations for senior transitions.",
		features: [
			"200 AI Tailoring Credits",
			"Everything in Job Hunter Pack",
			"Executive summary & impact quantifier",
			"High-volume tailoring (30–60 applications)",
			"Permanent account balance",
		],
		buttonText: "Get 200 Credits",
		buttonVariant: "secondary" as const,
		highlight: false,
	},
];

const COST_BREAKDOWN = [
	{ label: "Line & Bullet Optimizer", cost: "1 Credit", desc: "Strengthens action verbs and quantifies impact" },
	{ label: "ATS Keyword Gap Scan", cost: "1 Credit", desc: "Tokenizes JD and reveals critical missing skills" },
	{ label: "Tailored Cover Letter", cost: "1 Credit", desc: "Drafts job-specific letter matched to your resume" },
	{ label: "Full Resume Job Tailoring", cost: "2 Credits", desc: "Rewrites summary and adapts 4 work experiences" },
	{ label: "STAR Interview Flashcards", cost: "2 Credits", desc: "Generates behavioral story decks with reasoning AI" },
];

export function AiPricingSection() {
	return (
		<section
			id="ai-credits"
			aria-labelledby="ai-pricing-title"
			className="relative mx-auto max-w-[1440px] border-t border-line px-(--gutter) py-24"
		>
			<div className="flex flex-col items-center text-center">
				<div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-700 backdrop-blur-xs dark:text-amber-300">
					<Icon name="lightning" size={14} className="fill-amber-500 text-amber-500" />
					<span>Zero Monthly Subscriptions · Pay As You Go</span>
				</div>

				<h2
					id="ai-pricing-title"
					className="font-anybody mt-4 max-w-3xl text-[clamp(34px,5vw,60px)] leading-[1.08] font-light tracking-[-.03em] text-balance text-ink"
				>
					Pay only when you apply. Say goodbye to monthly fees.
				</h2>

				<p className="mt-4 max-w-2xl font-display text-lg text-ink-2">
					Traditional resume builders trap you in $29/month auto-renewing subscriptions. DipperGo provides a 100% free
					core builder with unlimited templates. When you want AI to tailor your resume, buy tiny credit packs that
					never expire.
				</p>
			</div>

			{/* Welcome bonus callout banner */}
			<div className="mx-auto mt-10 max-w-3xl rounded-xl border border-accent/25 bg-radial-[at_top_left] from-accent/15 via-sunken/40 to-surface p-4 sm:p-5">
				<div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-start">
					<div className="flex items-center gap-3">
						<div className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-500/15 text-amber-500">
							<Icon name="sparkle" size={20} className="text-amber-500" />
						</div>
						<div>
							<h4 className="text-sm font-bold text-ink">3 Free AI Credits On Every New Account</h4>
							<p className="text-xs text-ink-2">
								Sign up today and get 3 complimentary tailoring credits. No credit card required.
							</p>
						</div>
					</div>
					<Link to="/auth/register">
						<Button size="sm" variant="primary" className="text-xs font-semibold whitespace-nowrap">
							<span>Claim 3 Free Credits</span>
							<Icon name="arrow-right" size={14} />
						</Button>
					</Link>
				</div>
			</div>

			{/* 4 Pricing Cards Grid */}
			<div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
				{CREDIT_PACKS.map((pack) => (
					<div
						key={pack.id}
						className={cn(
							"relative flex flex-col justify-between rounded-2xl border p-6 transition-all duration-300",
							pack.highlight
								? "border-accent/60 bg-accent/5 shadow-xl ring-2 ring-accent/30 hover:border-accent"
								: "border-line bg-surface hover:border-line-2 hover:shadow-lg",
						)}
					>
						{pack.badge && (
							<div className="absolute end-4 -top-3">
								<Badge
									variant={pack.popular ? "accent" : "neutral"}
									className="font-martian px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase shadow-sm"
								>
									{pack.badge}
								</Badge>
							</div>
						)}

						<div className="space-y-4">
							<div>
								<span className="font-martian text-[11px] font-semibold text-ink-3 uppercase">{pack.tag}</span>
								<h3 className="mt-1 font-display text-xl font-bold text-ink">{pack.name}</h3>
								<p className="mt-1.5 min-h-[36px] text-xs leading-relaxed text-ink-2">{pack.description}</p>
							</div>

							{/* Price */}
							<div className="border-y border-line/60 py-3.5">
								<div className="flex items-baseline gap-1.5">
									<span className="font-anybody text-3xl font-bold tracking-tight text-ink">{pack.price}</span>
									<span className="font-martian text-xs text-ink-3">/{pack.period}</span>
								</div>
								<div className="mt-1 flex items-center justify-between text-xs text-ink-3">
									<span className="font-medium text-amber-600 dark:text-amber-400">{pack.subtext}</span>
									{pack.savings && (
										<span className="font-semibold text-emerald-600 dark:text-emerald-400">{pack.savings}</span>
									)}
								</div>
							</div>

							{/* Features list */}
							<ul className="space-y-2 text-xs text-ink-2">
								{pack.features.map((feature) => (
									<li key={feature} className="flex items-start gap-2">
										<Icon name="check" size={14} className="mt-0.5 shrink-0 text-emerald-500" />
										<span>{feature}</span>
									</li>
								))}
							</ul>
						</div>

						<div className="mt-8 border-t border-line/60 pt-4">
							<Link to="/auth/register" className="block">
								<Button variant={pack.buttonVariant} size="sm" className="w-full text-xs font-semibold shadow-xs">
									{pack.buttonText}
								</Button>
							</Link>
						</div>
					</div>
				))}
			</div>

			{/* Transparent Cost Guide & BYOK Banner */}
			<div className="mt-14 grid gap-6 md:grid-cols-2">
				{/* Cost Guide */}
				<div className="rounded-2xl border border-line bg-surface p-6">
					<div className="flex items-center gap-2">
						<Icon name="sparkle" size={18} className="text-accent" />
						<h3 className="font-display text-base font-bold text-ink">How AI Credits Are Spent</h3>
					</div>
					<p className="mt-1 text-xs text-ink-3">
						Transparent compute pricing. Every action lists its exact credit cost before running.
					</p>

					<div className="mt-4 space-y-2.5">
						{COST_BREAKDOWN.map((item) => (
							<div
								key={item.label}
								className="flex items-center justify-between rounded-xl border border-line/60 bg-raised/40 px-3.5 py-2 text-xs"
							>
								<div>
									<span className="font-semibold text-ink">{item.label}</span>
									<p className="text-[11px] text-ink-3">{item.desc}</p>
								</div>
								<Badge variant="accent" className="font-martian text-[10px] font-bold">
									{item.cost}
								</Badge>
							</div>
						))}
					</div>
				</div>

				{/* Bring Your Own Key (BYOK) Friendly */}
				<div className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-6">
					<div>
						<div className="flex items-center gap-2">
							<Icon name="gear-six" size={18} className="text-emerald-500" />
							<h3 className="font-display text-base font-bold text-ink">Developer &amp; BYOK Friendly</h3>
						</div>
						<p className="mt-1 text-xs text-ink-3">Prefer using your own LLM API key? You never have to buy credits.</p>

						<div className="mt-4 space-y-3 text-xs leading-relaxed text-ink-2">
							<div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5">
								<h4 className="font-semibold text-emerald-700 dark:text-emerald-300">
									Bring Your Own API Key (100% Free)
								</h4>
								<p className="mt-1 text-[11px] text-ink-2">
									Head to <strong>Settings → AI &amp; developer</strong> and connect your personal DeepSeek, OpenAI,
									Anthropic, Google Gemini, or Ollama endpoint.
								</p>
							</div>

							<ul className="space-y-1.5 text-xs text-ink-2">
								<li className="flex items-center gap-2">
									<Icon name="check" size={14} className="text-emerald-500" />
									<span>0 platform markup or fees on your personal keys</span>
								</li>
								<li className="flex items-center gap-2">
									<Icon name="check" size={14} className="text-emerald-500" />
									<span>AES-256 encrypted credential storage</span>
								</li>
								<li className="flex items-center gap-2">
									<Icon name="check" size={14} className="text-emerald-500" />
									<span>Run self-hosted local models (Ollama / vLLM) offline</span>
								</li>
							</ul>
						</div>
					</div>

					<div className="mt-6 border-t border-line/60 pt-4">
						<Link to="/auth/register">
							<Button variant="secondary" size="sm" className="w-full text-xs font-medium">
								<Icon name="key" size={14} />
								<span>Explore BYOK AI Settings</span>
							</Button>
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}
