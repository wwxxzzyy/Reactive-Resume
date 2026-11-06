import { Icon } from "@reactive-resume/ui/components/icon";
import { CtaLink } from "./ui";

const capabilities = [
	{
		icon: "file-doc" as const,
		badge: "Export Engine",
		title: "Multi-Format Vector & DOCX Export",
		description:
			"Export publication-ready vector PDFs with sharp typography and selectable text, or generate editable Word (.docx) documents formatted for recruiter submissions.",
		highlights: [
			"Crisp vector PDF with selectable text & exact page geometry",
			"Fully editable Microsoft Word (.docx) with structured headings",
			"Unrestricted downloads with zero watermarks or locks",
		],
	},
	{
		icon: "seal-check" as const,
		badge: "Pre-Submission Audit",
		title: "Real-Time ATS Parsing Diagnostics",
		description:
			"Validate your resume against automated screening systems before applying. Check semantic headings, section order, and plain-text extraction fidelity.",
		highlights: [
			"Instant ATS readability & formatting compatibility score",
			"Verifies Workday, Greenhouse, Taleo & Lever parsers",
			"Plain-text extraction preview reveals how bots parse your data",
		],
	},
	{
		icon: "envelope-simple" as const,
		badge: "Unified Identity",
		title: "Matching Cover Letter Studio",
		description:
			"Draft polished cover letters synchronized with your resume's typography, color accents, and margins for a cohesive application package.",
		highlights: [
			"Inherits resume fonts, margins, and design accents",
			"Recruiter-approved header styles and letter layouts",
			"Pair and export matching document packages in seconds",
		],
	},
	{
		icon: "kanban" as const,
		badge: "Search Workflow",
		title: "Job Application Kanban Tracker",
		description:
			"Manage your entire job hunt from lead discovery to final offer negotiations. Organize application statuses and keep follow-up deadlines on track.",
		highlights: [
			"Interactive Board, List, and Calendar views",
			"Attach the exact resume & cover letter sent per application",
			"Log interview stages, salary expectations, and company notes",
		],
	},
	{
		icon: "lock" as const,
		badge: "Strict Privacy",
		title: "Granular Privacy & Web Sharing",
		description:
			"Share live digital resumes on your terms with custom web URLs, or protect your private documents with password access controls.",
		highlights: [
			"Responsive web resume link with 1-click publish/unpublish",
			"Optional password protection for confidential portfolios",
			"Zero ad tracking, zero telemetry, and zero data sold to brokers",
		],
	},
	{
		icon: "sliders-horizontal" as const,
		badge: "Design Precision",
		title: "Dynamic Layout & Typography Engine",
		description:
			"Customize every visual element with precision. Switch layouts, adjust spacing, reorder sections, and control page breaks with live preview.",
		highlights: [
			"Curated recruiter-friendly typography pairs & color palettes",
			"Flexible single-column and multi-column grid layouts",
			"Real-time multi-page preview with manual page break controls",
		],
	},
];

export function ComparisonSection() {
	return (
		<section
			id="capabilities"
			aria-labelledby="capabilities-title"
			className="relative mx-auto max-w-[1440px] border-t border-line px-(--gutter) py-20"
		>
			<span id="why-free" className="sr-only" />

			<div className="flex flex-col items-center text-center">
				<div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-soft/40 px-3.5 py-1 text-xs font-medium text-accent-text backdrop-blur-xs">
					<Icon name="sparkle" size={14} className="text-accent" />
					<span>Platform Capabilities</span>
				</div>
				<h2
					id="capabilities-title"
					className="font-anybody mt-4 text-[clamp(34px,5vw,60px)] leading-[1.08] font-light tracking-[-.03em] text-ink"
				>
					Engineered for every stage of your job search
				</h2>
				<p className="mt-4 max-w-2xl font-display text-lg text-ink-2">
					From polished first drafts to final offers—explore everything our platform provides to help you build, test,
					and manage winning applications.
				</p>
			</div>

			<div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{capabilities.map((cap) => (
					<div
						key={cap.title}
						className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-surface/90 p-7 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-accent/50 hover:bg-surface hover:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.3)]"
					>
						<div className="pointer-events-none absolute -top-12 -right-12 size-36 rounded-full bg-accent/5 blur-2xl transition-all duration-500 group-hover:scale-125 group-hover:bg-accent/15" />

						<div>
							<div className="flex items-center justify-between">
								<div className="grid size-12 place-items-center rounded-xl border border-accent/20 bg-accent-soft text-accent-text shadow-xs transition-all duration-300 group-hover:scale-110 group-hover:bg-accent group-hover:text-bg">
									<Icon name={cap.icon} size={22} />
								</div>
								<span className="font-martian rounded-full border border-line bg-raised/80 px-3 py-1 text-[11px] font-semibold tracking-wider text-ink-3 uppercase transition-colors group-hover:border-accent/30 group-hover:text-accent-text">
									{cap.badge}
								</span>
							</div>

							<h3 className="mt-6 font-display text-xl font-semibold text-ink transition-colors group-hover:text-accent-text">
								{cap.title}
							</h3>
							<p className="mt-2.5 text-sm leading-relaxed text-ink-2">{cap.description}</p>
						</div>

						<ul className="mt-6 space-y-2.5 border-t border-line/60 pt-5">
							{cap.highlights.map((point) => (
								<li key={point} className="flex items-start gap-2.5 text-xs text-ink-2">
									<div className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-accent-soft text-accent-text">
										<Icon name="check" size={11} />
									</div>
									<span className="leading-snug">{point}</span>
								</li>
							))}
						</ul>

						<div className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100" />
					</div>
				))}
			</div>

			<div className="mt-12 flex flex-col items-center justify-between gap-6 rounded-2xl border border-line bg-raised/60 p-6 backdrop-blur-xs sm:flex-row sm:p-8">
				<div>
					<h3 className="font-display text-lg font-semibold text-ink">
						Experience all capabilities with zero restrictions
					</h3>
					<p className="mt-1 text-sm text-ink-2">
						Create unlimited resumes, run instant ATS audits, and track job applications—no credit card required.
					</p>
				</div>
				<CtaLink size="hero" className="h-11 shrink-0 px-5 text-sm" />
			</div>
		</section>
	);
}
