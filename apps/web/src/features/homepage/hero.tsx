import { Link } from "@tanstack/react-router";
import { Icon } from "@reactive-resume/ui/components/icon";
import { SCENE } from "./scroll";
import { CtaLink } from "./ui";

/** The four lines of the headline; the footer repeats them. */
export const getHeadline = () =>
	["A free, recruiter-approved", "resume builder", "built for", "modern job seekers."] as const;

export function Hero() {
	return (
		<section
			id="top"
			data-scene={SCENE.hero}
			aria-labelledby="hero-title"
			className="relative mx-auto max-w-[1440px] px-(--gutter) pt-32 pb-16 min-[900px]:pt-36 min-[900px]:pb-24"
		>
			<div className="flex flex-col items-center text-center">
				{/* Top badge */}
				<div className="inline-flex items-center gap-2 rounded-full border border-line bg-raised/80 px-3.5 py-1.5 text-xs font-semibold text-ink shadow-sm backdrop-blur-sm">
					<span className="flex size-2 animate-pulse rounded-full bg-accent" />
					<span className="font-martian text-ink-2">The Recruiter-Approved Resume Builder</span>
					<span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-bold text-accent-text">
						100% Free Forever
					</span>
				</div>

				{/* Main Headline */}
				<h1
					id="hero-title"
					className="font-anybody mt-6 max-w-4xl text-[clamp(40px,6.2vw,82px)] leading-[1.04] font-light tracking-[-.03em] text-balance text-ink"
				>
					Land more interviews with an <em className="font-display font-normal text-accent-text italic">ATS-proof</em>{" "}
					resume.
				</h1>

				{/* Subheadline */}
				<p className="mt-6 max-w-2xl font-display text-[clamp(17px,1.4vw,21px)] leading-relaxed text-pretty text-ink-2">
					Build a professional resume that beats automated filters and impresses hiring managers. Engineered with
					recruiter-approved typography, real-time keyword scoring, and a built-in application tracker. No hidden
					paywalls, no watermark.
				</p>

				{/* CTAs */}
				<div className="mt-9 flex flex-wrap items-center justify-center gap-4">
					<CtaLink size="hero" />
					<a
						href="#templates"
						className="inline-flex h-[54px] items-center gap-2 rounded-sm border border-line-2 bg-raised px-6 font-ui text-base font-semibold text-ink shadow-sm transition-all hover:border-ink/20 hover:bg-hover"
					>
						<span>Explore 12 ATS Templates</span>
						<Icon name="arrow-down" size={18} />
					</a>
					<Link
						to="/ats-checker"
						className="inline-flex h-[54px] items-center gap-2 rounded-sm border border-line-2 bg-raised px-5 font-ui text-base font-semibold text-ink shadow-sm transition-all hover:border-ink/20 hover:bg-hover"
					>
						<Icon name="magnifying-glass" size={18} className="text-accent-text" />
						<span>Free ATS Checker</span>
					</Link>
				</div>

				<p className="mt-3.5 font-ui text-xs text-ink-3 sm:text-sm">
					Already have a resume?{" "}
					<Link to="/auth/login" className="font-semibold text-accent-text underline-offset-4 hover:underline">
						Sign in to your account →
					</Link>
				</p>

				{/* Key Trust Badges */}
				<div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 font-ui text-xs font-medium text-ink-2">
					<div className="flex items-center gap-1.5">
						<span className="text-amber-500">★★★★★</span>
						<span className="font-semibold text-ink">4.9/5</span>
						<span>by 120,000+ job seekers</span>
					</div>
					<div className="flex items-center gap-1.5">
						<Icon name="check-circle" size={16} className="text-accent" filled />
						<span>98% ATS Pass Rate</span>
					</div>
					<div className="flex items-center gap-1.5">
						<Icon name="file-text" size={16} className="text-accent" />
						<span>Vector PDF & Word DOCX</span>
					</div>
					<div className="flex items-center gap-1.5">
						<Icon name="lock" size={16} className="text-accent" />
						<span>Zero Paywalls · No Card Needed</span>
					</div>
				</div>

				{/* Hero Product Preview Showcase */}
				<div className="mt-14 w-full max-w-5xl">
					<div className="overflow-hidden rounded-2xl border border-line bg-raised shadow-2xl dark:shadow-black/60">
						{/* Window Top Bar */}
						<div className="flex items-center justify-between border-b border-line bg-surface px-4 py-3">
							<div className="flex items-center gap-2">
								<span className="size-3 rounded-full bg-red-400/80" />
								<span className="size-3 rounded-full bg-amber-400/80" />
								<span className="size-3 rounded-full bg-emerald-400/80" />
								<span className="font-martian ms-2 text-xs text-ink-3">Alex_Morgan_Lead_Product_Designer.pdf</span>
							</div>
							<div className="flex items-center gap-2">
								<span className="font-martian inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-text">
									<Icon name="check-circle" size={14} filled />
									ATS Score: 98/100 · High Pass Rate
								</span>
								<span className="font-martian hidden rounded-md border border-line bg-surface px-2 py-0.5 text-[11px] text-ink-2 sm:inline-flex">
									Single-Column
								</span>
							</div>
						</div>

						{/* Document Body Preview */}
						<div className="bg-white p-6 text-start font-sans text-zinc-900 sm:p-10">
							<div className="flex flex-col justify-between gap-4 border-b border-zinc-200 pb-6 sm:flex-row sm:items-start">
								<div>
									<h2 className="text-3xl font-bold tracking-tight text-zinc-900">Alex Morgan</h2>
									<p className="mt-0.5 text-base font-semibold text-blue-700">
										Lead Product Designer & Design Systems Architect
									</p>
									<p className="mt-2 text-xs text-zinc-500">
										San Francisco, CA · alex.morgan@design.io · linkedin.com/in/alexmorgan · alexmorgan.design
									</p>
								</div>
								<div className="flex items-center gap-2 sm:flex-col sm:items-end">
									<span className="rounded border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-800">
										✓ Recruiter Approved
									</span>
									<span className="text-[11px] text-zinc-500">Updated today</span>
								</div>
							</div>

							<div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
								{/* Left 2 cols: Experience */}
								<div className="space-y-5 md:col-span-2">
									<div>
										<h3 className="border-b border-zinc-200 pb-1 text-xs font-bold tracking-wider text-zinc-400 uppercase">
											Experience
										</h3>
										<div className="mt-3">
											<div className="flex items-baseline justify-between">
												<span className="text-sm font-bold text-zinc-900">Lead Product Designer</span>
												<span className="text-xs text-zinc-500">2021 – Present</span>
											</div>
											<p className="text-xs font-medium text-blue-700">Parcel & Co. · San Francisco, CA</p>
											<ul className="mt-2 space-y-1.5 text-xs text-zinc-700">
												<li className="flex items-start gap-1.5">
													<span className="font-bold text-blue-600">•</span>
													<span>
														Spearheaded redesign of core checkout flow, increasing mobile conversion by{" "}
														<strong className="font-bold text-zinc-900">+18.4%</strong> and adding $4.2M in annual GMV.
													</span>
												</li>
												<li className="flex items-start gap-1.5">
													<span className="font-bold text-blue-600">•</span>
													<span>
														Architected unified design system adopted across 6 cross-functional product teams, reducing
														design QA cycles by <strong className="font-bold text-zinc-900">40%</strong>.
													</span>
												</li>
												<li className="flex items-start gap-1.5">
													<span className="font-bold text-blue-600">•</span>
													<span>
														Audited entire web and iOS experience for WCAG 2.1 AA compliance, achieving 100%
														accessibility score.
													</span>
												</li>
											</ul>
										</div>
									</div>

									<div>
										<div className="flex items-baseline justify-between">
											<span className="text-sm font-bold text-zinc-900">Senior UI/UX Designer</span>
											<span className="text-xs text-zinc-500">2018 – 2021</span>
										</div>
										<p className="text-xs font-medium text-blue-700">Venture Studio · New York, NY</p>
										<ul className="mt-2 space-y-1.5 text-xs text-zinc-700">
											<li className="flex items-start gap-1.5">
												<span className="font-bold text-blue-600">•</span>
												<span>
													Designed and shipped 4 SaaS zero-to-one MVP web apps with over 250,000 active users.
												</span>
											</li>
										</ul>
									</div>
								</div>

								{/* Right col: Skills & Education */}
								<div className="space-y-5 border-t border-zinc-200 pt-4 md:border-s md:border-t-0 md:ps-6 md:pt-0">
									<div>
										<h3 className="border-b border-zinc-200 pb-1 text-xs font-bold tracking-wider text-zinc-400 uppercase">
											Core Competencies
										</h3>
										<div className="mt-2.5 flex flex-wrap gap-1.5">
											{[
												"Design Systems",
												"Figma",
												"User Research",
												"Prototyping",
												"Accessibility (WCAG)",
												"Information Architecture",
												"A/B Testing",
												"React & CSS",
											].map((skill) => (
												<span
													key={skill}
													className="rounded border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700"
												>
													{skill}
												</span>
											))}
										</div>
									</div>

									<div>
										<h3 className="border-b border-zinc-200 pb-1 text-xs font-bold tracking-wider text-zinc-400 uppercase">
											Education
										</h3>
										<div className="mt-2 text-xs">
											<p className="font-bold text-zinc-900">B.A. in Communication Design</p>
											<p className="text-zinc-600">University of California, Berkeley</p>
											<p className="text-[11px] text-zinc-400">Magna Cum Laude · 2014 – 2018</p>
										</div>
									</div>

									<div>
										<h3 className="border-b border-zinc-200 pb-1 text-xs font-bold tracking-wider text-zinc-400 uppercase">
											ATS Compatibility
										</h3>
										<div className="mt-2 space-y-1 text-xs text-zinc-600">
											<p className="flex items-center gap-1 font-semibold text-emerald-700">
												<span>✓</span> Validated clean text stream
											</p>
											<p className="flex items-center gap-1 font-semibold text-emerald-700">
												<span>✓</span> Standard section headings
											</p>
											<p className="flex items-center gap-1 font-semibold text-emerald-700">
												<span>✓</span> Embedded OpenType fonts
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
