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
		badge: "ATS Alignment",
		title: "Targeted JD Matcher & ATS Dial",
		description:
			"Score your resume against real job descriptions in real time. Validate keyword density, categorize matching skills, and fill critical ATS gaps before applying.",
		highlights: [
			"Real-time 0–100% weighted ATS alignment score dial",
			"Categorized skills, experience, and domain keyword parsing",
			"Highlights critical and recommended missing terms with 1-click add",
		],
	},
	{
		icon: "arrows-in-line-vertical" as const,
		badge: "Design Precision",
		title: "Smart Page Squeezer (Auto-Fit Overflow)",
		description:
			"Never send a resume with an awkward 2-line spillover onto page 2. Our intelligent algorithm balances line-heights, margins, and gaps to lock your resume into 1 or 2 clean pages.",
		highlights: [
			"1-click Fit 1 Page, 2-Page Relaxed, and Micro-Tighten presets",
			"Eliminates trailing overflow lines without ruining visual layout",
			"Maintains strict 10mm print margins and WCAG typography contrast",
		],
	},
	{
		icon: "qr-code" as const,
		badge: "Contact Identity",
		title: "Vector SVG QR & Instant vCard 3.0",
		description:
			"Connect physical resumes to recruiters' smartphones. Generate zero-dependency vector QR codes with instant vCard 3.0 phone contact saving and web portfolio linking.",
		highlights: [
			"High-contrast vector SVG QR matrix generated purely in browser",
			"vCard 3.0 contact card lets hiring managers save info in 1 camera scan",
			"Zero third-party tracking, zero analytics telemetry, zero redirects",
		],
	},
	{
		icon: "chart-line-up" as const,
		badge: "Negotiation Studio",
		title: "Total Rewards & Offer Comparison Calculator",
		description:
			"Compare competing offers side-by-side beyond base salary. Evaluate Year 1 total comp, 4-year equity vesting, and generate ready-to-send counteroffer scripts.",
		highlights: [
			"Side-by-side Year 1 total comp, sign-on bonus & stock vesting",
			"Cash vs equity split breakdown with dollar advantage callouts",
			"1-click personalized counteroffer negotiation email script",
		],
	},
	{
		icon: "globe-simple" as const,
		badge: "Global Reach",
		title: "1-Click Multi-Language Section Translator",
		description:
			"Target multinational companies and international job markets effortlessly. Localize standard resume section headers across 11 languages with automatic typography adaptation.",
		highlights: [
			"1-click translation across 11 languages (DE, FR, ES, JA, ZH, AR...)",
			"Keeps your personalized achievements and custom entries untouched",
			"Automatic right-to-left (RTL) text direction and font adjustments",
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
