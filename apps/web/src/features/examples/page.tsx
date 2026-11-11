import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Badge } from "@reactive-resume/ui/components/badge";
import { Button } from "@reactive-resume/ui/components/button";
import { Icon } from "@reactive-resume/ui/components/icon";
import { cn } from "@reactive-resume/utils/style";
import { EXAMPLE_FAQS, RESUME_ROLE_EXAMPLES } from "./data";
import { LandingBackground } from "@/features/homepage/background";
import { CtaLink, Doodle, labelClass } from "@/features/homepage/ui";

const linkClass = "text-accent-text underline underline-offset-4 transition-colors hover:text-accent-hover";

export function ResumeExamplesPage() {
	const [activeRoleId, setActiveRoleId] = useState<string>("software-engineer");
	const role = RESUME_ROLE_EXAMPLES.find((r) => r.id === activeRoleId) ?? RESUME_ROLE_EXAMPLES[0];
	if (!role) return null;

	return (
		<div className="landing relative isolate overflow-x-clip bg-bg font-ui text-ink">
			<LandingBackground />

			<main id="main-content" className="relative px-5 pt-28 pb-16 sm:px-8">
				<div className="relative mx-auto max-w-6xl">
					<Doodle
						name="curve"
						wipe="1"
						sizes="(min-width: 900px) 14vw, 1px"
						className="end-0 top-4 w-[clamp(140px,14vw,220px)] rotate-[8deg] max-[900px]:hidden"
					/>

					{/* Header section */}
					<div className="relative max-w-3xl">
						<div className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent-text">
							<Icon name="check-circle" size={14} />
							<span>Recruiter-Approved ATS Formats</span>
						</div>

						<h1 className="font-anybody mt-4 text-[clamp(36px,5.5vw,72px)] leading-[1.05] font-light tracking-[-.03em] text-balance">
							Free ATS resume examples by job role.
						</h1>

						<p className="mt-5 max-w-2xl font-display text-[clamp(17px,1.4vw,21px)] leading-normal text-pretty text-ink-2">
							Explore proven resume summaries, vital ATS keywords, and quantified bullet points designed to pass
							automated hiring screeners. 100% free with no paywall, subscription, or watermark.
						</p>

						<div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
							<CtaLink size="hero" />
							<Link to="/ats-checker" className={cn(linkClass, "inline-flex min-h-11 items-center")}>
								Scan your resume with ATS checker →
							</Link>
						</div>
					</div>

					{/* Role Navigation Pills */}
					<div className="mt-14 space-y-4">
						<h2 className={cn(labelClass, "text-ink-3")}>Select your profession</h2>
						<div className="flex flex-wrap items-center gap-2">
							{RESUME_ROLE_EXAMPLES.map((r) => {
								const active = r.id === activeRoleId;
								return (
									<button
										key={r.id}
										type="button"
										onClick={() => setActiveRoleId(r.id)}
										className={cn(
											"flex h-9 cursor-pointer items-center gap-2 rounded-lg border px-3.5 text-xs font-semibold transition-all",
											active
												? "border-accent bg-accent/15 text-accent-text shadow-xs"
												: "border-line bg-surface/80 text-ink-2 hover:border-line-2 hover:bg-hover hover:text-ink",
										)}
									>
										<span>{r.shortTitle}</span>
									</button>
								);
							})}
						</div>
					</div>

					{/* Selected Role Showcase Card */}
					<div className="mt-8 overflow-hidden rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-8">
						<div className="flex flex-col justify-between gap-4 border-b border-line pb-6 sm:flex-row sm:items-center">
							<div>
								<div className="flex items-center gap-2">
									<Badge variant="neutral" className="text-[11px]">
										{role.category}
									</Badge>
									<span className="text-xs text-ink-3">Avg. Salary: {role.salaryRange}</span>
								</div>
								<h3 className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">{role.title}</h3>
							</div>

							<div className="flex items-center gap-2.5">
								<Button
									variant="primary"
									size="sm"
									nativeButton={false}
									render={<Link to="/dashboard" />}
									className="gap-1.5"
								>
									<Icon name="pencil-simple" size={14} />
									<span>Build with this template</span>
								</Button>
								<Button
									variant="secondary"
									size="sm"
									nativeButton={false}
									render={<Link to="/ats-checker" />}
									className="gap-1.5"
								>
									<Icon name="check-circle" size={14} />
									<span>Score your resume</span>
								</Button>
							</div>
						</div>

						{/* Content Grid */}
						<div className="mt-8 grid gap-8 lg:grid-cols-12">
							{/* Left Column: Summary & Bullets */}
							<div className="space-y-6 lg:col-span-8">
								{/* Summary */}
								<div>
									<h4 className="flex items-center gap-2 text-xs font-bold tracking-wider text-ink-3 uppercase">
										<Icon name="user-circle" size={14} className="text-accent-text" />
										<span>ATS-Optimized Professional Summary</span>
									</h4>
									<div className="mt-2.5 rounded-xl border border-line/70 bg-sunken/40 p-4 font-display text-sm leading-relaxed text-ink">
										“{role.summary}”
									</div>
								</div>

								{/* Work Experience Bullets */}
								<div>
									<h4 className="flex items-center gap-2 text-xs font-bold tracking-wider text-ink-3 uppercase">
										<Icon name="briefcase" size={14} className="text-accent-text" />
										<span>Recruiter-Approved Bullet Points (STAR Method)</span>
									</h4>
									<ul className="mt-2.5 space-y-2.5">
										{role.highlights.map((bullet, idx) => (
											<li
												key={idx}
												className="flex items-start gap-2.5 rounded-lg border border-line/50 bg-surface p-3 text-xs leading-relaxed text-ink-2"
											>
												<span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-accent/20 text-[10px] font-bold text-accent-text">
													✓
												</span>
												<span>{bullet}</span>
											</li>
										))}
									</ul>
								</div>

								{/* ATS Advice & Pitfalls */}
								<div className="grid gap-4 sm:grid-cols-2">
									<div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4">
										<div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
											<Icon name="sparkle" size={16} />
											<span>ATS Recruiter Advice</span>
										</div>
										<p className="mt-1.5 text-xs leading-relaxed text-ink-2">{role.atsAdvice}</p>
									</div>

									<div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-4">
										<div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
											<Icon name="warning" size={16} />
											<span>Common Pitfall to Avoid</span>
										</div>
										<p className="mt-1.5 text-xs leading-relaxed text-ink-2">{role.commonPitfalls}</p>
									</div>
								</div>
							</div>

							{/* Right Column: Keywords & Template recommendation */}
							<div className="space-y-6 lg:col-span-4">
								{/* Keywords */}
								<div className="rounded-xl border border-line bg-sunken/30 p-4.5">
									<h4 className="flex items-center gap-2 text-xs font-bold tracking-wider text-ink-3 uppercase">
										<Icon name="sparkle" size={14} className="text-accent-text" />
										<span>Target ATS Keywords</span>
									</h4>
									<p className="mt-1 text-[11px] text-ink-3">Include these terms naturally in your experience:</p>
									<div className="mt-3 flex flex-wrap gap-1.5">
										{role.keywords.map((kw) => (
											<span
												key={kw}
												className="rounded-md border border-line bg-surface px-2 py-1 text-xs font-medium text-ink"
											>
												{kw}
											</span>
										))}
									</div>
								</div>

								{/* Recommended Template */}
								<div className="rounded-xl border border-accent/30 bg-accent/10 p-4.5">
									<h4 className="text-xs font-bold tracking-wider text-accent-text uppercase">
										Recommended ATS Template
									</h4>
									<p className="mt-1 text-sm font-semibold text-ink">{role.templateName}</p>
									<p className="mt-1.5 text-xs leading-relaxed text-ink-2">
										Engineered with natural top-to-bottom reading hierarchy, clean vector text, and semantic section
										tags.
									</p>
									<div className="mt-4 flex items-center gap-2">
										<Button
											variant="primary"
											size="sm"
											nativeButton={false}
											render={<Link to="/dashboard" />}
											className="w-full justify-center text-xs"
										>
											Start building free
										</Button>
									</div>
								</div>

								{/* Anti-Paywall Guarantee Badge */}
								<div className="rounded-xl border border-line/60 bg-surface p-4 text-xs text-ink-3">
									<div className="flex items-center gap-2 font-semibold text-ink">
										<Icon name="shield-check" size={16} className="text-emerald-500" />
										<span>100% Free Anti-Paywall Guarantee</span>
									</div>
									<p className="mt-1 leading-relaxed">
										Unlimited PDF and Word DOCX downloads. No credit card, subscription, or watermarks ever.
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* FAQ Section */}
					<section aria-labelledby="examples-faq" className="mt-16">
						<div className="max-w-2xl">
							<h2 id="examples-faq" className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
								Frequently asked questions about ATS resumes
							</h2>
							<p className="mt-2 text-sm text-ink-3">
								Everything you need to know about passing applicant tracking systems and landing interviews.
							</p>
						</div>

						<div className="mt-8 grid gap-4 sm:grid-cols-2">
							{EXAMPLE_FAQS.map((faq, idx) => (
								<div key={idx} className="rounded-xl border border-line bg-surface p-5 shadow-2xs">
									<h3 className="text-sm font-semibold text-ink">{faq.question}</h3>
									<p className="mt-2 text-xs leading-relaxed text-ink-2">{faq.answer}</p>
								</div>
							))}
						</div>
					</section>
				</div>
			</main>
		</div>
	);
}
