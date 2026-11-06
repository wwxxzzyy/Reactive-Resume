import { Link } from "@tanstack/react-router";
import { Icon } from "@reactive-resume/ui/components/icon";
import { cn } from "@reactive-resume/utils/style";
import { labelClass } from "./ui";

export function ApplicantFeatures() {
	const features = [
		{
			icon: "check-circle" as const,
			title: "Beat Applicant Tracking Systems (ATS)",
			badge: "98% ATS Pass Rate",
			description:
				"Over 75% of resumes are discarded by automated screening bots before human eyes see them. Our templates use semantic hierarchy and standard headings that Workday, Taleo, Greenhouse, and Lever parse with 100% fidelity.",
			action: {
				label: "Try the free ATS checker →",
				to: "/ats-checker" as const,
			},
		},
		{
			icon: "sparkle" as const,
			title: "Quantifiable Bullet Points & Impact",
			badge: "6-Second Scan",
			description:
				"Recruiters don't read long paragraphs—they scan for numbers, leadership, and results. Polish your achievements into concise, action-driven bullet points that prove your business impact at a glance.",
			action: null,
		},
		{
			icon: "squares-four" as const,
			title: "All-in-One Job Application Tracker",
			badge: "Built-in Kanban",
			description:
				"Ditch the messy spreadsheets. Organize every job lead from Saved to Applied, Interview, and Offer. Store job descriptions, salary details, interview reminders, and the exact resume version you submitted.",
			action: null,
		},
		{
			icon: "download-simple" as const,
			title: "100% Free Forever — Zero Paywalls",
			badge: "No Credit Card",
			description:
				"Most resume sites let you spend 45 minutes building, then demand $29.99 right when you click download. We never do that. Export unlimited vector PDFs, editable Word DOCX files, and web links for free.",
			action: null,
		},
	];

	return (
		<section
			id="features"
			aria-labelledby="features-title"
			className="relative mx-auto max-w-[1440px] border-t border-line px-(--gutter) py-20"
		>
			<div className="flex flex-col items-center text-center">
				<span className={cn(labelClass, "text-accent-text")}>Built For Job Seekers</span>
				<h2
					id="features-title"
					className="font-anybody mt-3 text-[clamp(36px,5vw,64px)] leading-[1.05] font-light tracking-[-.03em] text-ink"
				>
					Everything you need to land your next offer
				</h2>
				<p className="mt-4 max-w-2xl font-display text-lg text-ink-2">
					From your initial resume draft to final interview preparation, Resume Builder provides the specialized tools
					job seekers need to stand out.
				</p>
			</div>

			<div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2">
				{features.map((feature) => (
					<div
						key={feature.title}
						className="relative flex flex-col justify-between rounded-2xl border border-line bg-surface p-8 transition-all duration-300 hover:border-line-2 hover:shadow-lg"
					>
						<div>
							<div className="flex items-center justify-between">
								<div className="grid size-12 place-items-center rounded-xl bg-accent-soft text-accent-text">
									<Icon name={feature.icon} size={24} />
								</div>
								<span className="font-martian rounded-full border border-line bg-raised px-3 py-1 text-xs font-semibold text-accent-text">
									{feature.badge}
								</span>
							</div>

							<h3 className="mt-6 font-display text-2xl font-semibold text-ink">{feature.title}</h3>
							<p className="mt-3 text-sm leading-relaxed text-ink-2">{feature.description}</p>
						</div>

						{feature.action && (
							<div className="mt-6 border-t border-line/60 pt-4">
								<Link
									to={feature.action.to}
									className="text-sm font-semibold text-accent-text underline underline-offset-4 transition-colors hover:text-accent-hover"
								>
									{feature.action.label}
								</Link>
							</div>
						)}
					</div>
				))}
			</div>
		</section>
	);
}
