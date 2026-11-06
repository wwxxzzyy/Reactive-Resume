import { Link } from "@tanstack/react-router";
import { Icon } from "@reactive-resume/ui/components/icon";
import { cn } from "@reactive-resume/utils/style";
import { labelClass } from "./ui";

type FeaturedTemplate = {
	id: string;
	name: string;
	tagline: string;
	imageUrl: string;
	atsScore: string;
	layout: string;
	bestFor: string;
};

const featuredTemplates: FeaturedTemplate[] = [
	{
		id: "harvard",
		name: "Harvard Classic",
		tagline: "Ivy League & Corporate",
		imageUrl: "/templates/jpg/harvard.jpg",
		atsScore: "100% ATS Match",
		layout: "Single-Column Classic",
		bestFor: "Finance, Law, Executive, Consulting",
	},
	{
		id: "silicon",
		name: "Silicon Tech",
		tagline: "Tech & Software Engineering",
		imageUrl: "/templates/jpg/silicon.jpg",
		atsScore: "99% ATS Match",
		layout: "Single-Column Modern",
		bestFor: "Software Engineers, Cloud/DevOps, Data Scientists",
	},
	{
		id: "mckinsey",
		name: "McKinsey Consultant",
		tagline: "Strategy & Management",
		imageUrl: "/templates/jpg/mckinsey.jpg",
		atsScore: "99% ATS Match",
		layout: "Single-Column Structured",
		bestFor: "Management Consultants, Strategy, Operations",
	},
	{
		id: "stanford",
		name: "Stanford Executive",
		tagline: "Executive & Leadership",
		imageUrl: "/templates/jpg/stanford.jpg",
		atsScore: "99% ATS Match",
		layout: "Executive Format",
		bestFor: "VPs, Directors, General Managers, C-Suite",
	},
	{
		id: "nordic",
		name: "Nordic Minimalist",
		tagline: "Modern Minimalist",
		imageUrl: "/templates/jpg/nordic.jpg",
		atsScore: "100% ATS Match",
		layout: "Single-Column Clean",
		bestFor: "Product Managers, Designers, Startup Leads",
	},
	{
		id: "modern-split",
		name: "Modern Split",
		tagline: "Modern Two-Column",
		imageUrl: "/templates/jpg/modern-split.jpg",
		atsScore: "97% ATS Match",
		layout: "Two-Column Accent",
		bestFor: "Full-Stack Devs, Growth Leads, Tech PMs",
	},
];

export function TemplatesShowcase() {
	return (
		<section
			id="templates"
			aria-labelledby="templates-title"
			className="relative mx-auto max-w-[1440px] px-(--gutter) py-20"
		>
			<div className="flex flex-col items-center text-center">
				<span className={cn(labelClass, "text-accent-text")}>Recruiter-Approved Layouts</span>
				<h2
					id="templates-title"
					className="font-anybody mt-3 text-[clamp(36px,5vw,64px)] leading-[1.05] font-light tracking-[-.03em] text-ink"
				>
					Templates engineered to get interviews
				</h2>
				<p className="mt-4 max-w-2xl font-display text-lg text-ink-2">
					Recruiters spend 6 seconds on initial screening. Our templates combine clean machine-parsable text for ATS
					systems with elegant typographic hierarchy for human hiring managers.
				</p>
			</div>

			<div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
				{featuredTemplates.map((template) => (
					<div
						key={template.id}
						className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface p-4 transition-all duration-300 hover:-translate-y-1 hover:border-line-2 hover:shadow-xl dark:hover:shadow-black/40"
					>
						{/* Template preview frame */}
						<div className="relative aspect-[612/792] w-full overflow-hidden rounded-xl border border-line/60 bg-raised">
							<img
								src={template.imageUrl}
								alt={`${template.name} resume template`}
								loading="lazy"
								className="size-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
							/>
							<div className="absolute end-3 top-3 flex items-center gap-1.5 rounded-full bg-surface/90 px-2.5 py-1 text-xs font-semibold text-accent-text shadow-sm backdrop-blur-md">
								<span className="size-1.5 rounded-full bg-accent" />
								{template.atsScore}
							</div>
						</div>

						{/* Template details */}
						<div className="mt-4 flex flex-1 flex-col justify-between">
							<div>
								<div className="flex items-center justify-between">
									<h3 className="font-display text-xl font-semibold text-ink">{template.name}</h3>
									<span className="font-martian rounded-md border border-line px-2 py-0.5 text-[11px] font-medium text-ink-3">
										{template.layout}
									</span>
								</div>
								<p className="mt-1 text-xs font-medium text-ink-2">{template.tagline}</p>
								<p className="mt-2 text-xs text-ink-3">
									<span className="font-semibold text-ink-2">Best for:</span> {template.bestFor}
								</p>
							</div>

							<div className="mt-5 border-t border-line pt-3">
								<Link
									to="/auth/register"
									className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-line bg-raised font-ui text-sm font-semibold text-ink transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-on-accent"
								>
									<span>Use This Template</span>
									<Icon name="arrow-right" size={16} />
								</Link>
							</div>
						</div>
					</div>
				))}
			</div>

			<div className="mt-12 flex justify-center">
				<Link
					to="/resume-templates"
					className="inline-flex h-12 items-center gap-2 rounded-xl border border-line-2 bg-raised px-6 font-ui text-sm font-semibold text-ink shadow-sm transition-all hover:border-ink/20 hover:bg-hover"
				>
					<span>Explore all 18 free templates</span>
					<Icon name="arrow-up-right" size={16} />
				</Link>
			</div>
		</section>
	);
}
