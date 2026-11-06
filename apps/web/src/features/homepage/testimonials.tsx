import { Icon } from "@reactive-resume/ui/components/icon";
import { cn } from "@reactive-resume/utils/style";
import { labelClass } from "./ui";

export function TestimonialsSection() {
	const testimonials = [
		{
			quote:
				"I had submitted over 40 applications with my old resume and barely heard back. Rebuilt it using the Bronzor template here and ran the ATS check. Within 2 weeks I landed 3 interviews and accepted an offer at a high-growth fintech.",
			author: "Alex M.",
			role: "Senior Full-Stack Engineer",
			company: "Hired at Fintech Scaleup",
			rating: 5,
		},
		{
			quote:
				"Every single resume site online lures you in, lets you type everything, and then holds your download hostage behind a $29.99 subscription. Finding Resume Builder felt like a breath of fresh air. Beautiful, fast, and genuinely 100% free.",
			author: "Rachel T.",
			role: "Product Marketing Director",
			company: "Hired at Enterprise SaaS",
			rating: 5,
		},
		{
			quote:
				"As a technical recruiter, I see hundreds of resumes daily. Fancy graphic design resumes from Canva almost always break in our ATS parser. Resume Builder templates hit the perfect balance: modern aesthetics with flawless ATS parsing.",
			author: "Marcus V.",
			role: "Head of Talent Acquisition",
			company: "Tech Staffing & Advisory",
			rating: 5,
		},
		{
			quote:
				"The built-in job application Kanban board saved my sanity during my job search. Having all my target roles, interview dates, and the exact version of the resume I sent in one place was a game changer.",
			author: "David K.",
			role: "Senior Product Manager",
			company: "Hired at Cloud Platform",
			rating: 5,
		},
	];

	return (
		<section
			id="reviews"
			aria-labelledby="testimonials-title"
			className="relative mx-auto max-w-[1440px] border-t border-line px-(--gutter) py-20"
		>
			<div className="flex flex-col items-center text-center">
				<span className={cn(labelClass, "text-accent-text")}>Success Stories</span>
				<h2
					id="testimonials-title"
					className="font-anybody mt-3 text-[clamp(36px,5vw,64px)] leading-[1.05] font-light tracking-[-.03em] text-ink"
				>
					Real job seekers. Real offers.
				</h2>
				<p className="mt-4 max-w-2xl font-display text-lg text-ink-2">
					See how applicants used Resume Builder to bypass screening filters and land interviews at top companies.
				</p>
			</div>

			<div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2">
				{testimonials.map((item) => (
					<div
						key={item.author}
						className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-8 shadow-sm transition-all duration-300 hover:border-line-2 hover:shadow-md"
					>
						<div>
							<div className="flex items-center gap-1 text-amber-500">
								{Array.from({ length: item.rating }).map((_, i) => (
									// oxlint-disable-next-line react/no-array-index-key
									<Icon key={i} name="star" size={18} filled />
								))}
							</div>
							<p className="mt-4 font-display text-base leading-relaxed text-ink italic">"{item.quote}"</p>
						</div>

						<div className="mt-6 flex items-center gap-3 border-t border-line pt-4">
							<div className="grid size-10 place-items-center rounded-full bg-accent text-sm font-bold text-on-accent">
								{item.author.charAt(0)}
							</div>
							<div>
								<div className="font-semibold text-ink">{item.author}</div>
								<div className="text-xs text-ink-3">
									{item.role} · <span className="font-medium text-accent-text">{item.company}</span>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
