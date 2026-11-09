import { Link } from "@tanstack/react-router";
import { Icon } from "@reactive-resume/ui/components/icon";
import { cn } from "@reactive-resume/utils/style";
import { labelClass } from "./ui";

export function ApplicantFeatures() {
	return (
		<section
			id="features"
			aria-labelledby="features-title"
			className="relative mx-auto max-w-[1440px] border-t border-line px-(--gutter) py-24"
		>
			<div className="flex flex-col items-center text-center">
				<span className={cn(labelClass, "text-accent-text")}>The DipperGo Advantage</span>
				<h2
					id="features-title"
					className="font-anybody mt-3 max-w-3xl text-[clamp(36px,5vw,64px)] leading-[1.05] font-light tracking-[-.03em] text-balance text-ink"
				>
					Advanced intelligence built into your resume builder
				</h2>
				<p className="mt-4 max-w-2xl font-display text-lg text-ink-2">
					Go far beyond static templates. DipperGo pairs precision typography with live ATS matching, algorithmic
					page-squeezing, instant vCard QR generation, and total rewards compensation analytics.
				</p>
			</div>

			<div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
				{/* Feature 1: Targeted Job Description Matcher & ATS Dial */}
				<div className="group relative flex flex-col justify-between rounded-2xl border border-line bg-surface p-7 transition-all duration-300 hover:border-line-2 hover:shadow-xl">
					<div>
						<div className="flex items-center justify-between">
							<div className="grid size-12 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
								<Icon name="check-circle" size={24} />
							</div>
							<span className="font-martian rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
								Live In-Builder
							</span>
						</div>

						<h3 className="mt-6 font-display text-xl font-semibold text-ink">Live JD Keyword Matcher & ATS Dial</h3>
						<p className="mt-2 text-sm leading-relaxed text-ink-2">
							Paste any job posting directly into the builder. Our matcher tokenizes requirements, computes a weighted
							ATS score (0–100%), and flags critical missing terms with 1-click additions.
						</p>

						{/* Visual Widget Mock */}
						<div className="mt-5 rounded-xl border border-line bg-raised/70 p-3.5 text-xs">
							<div className="flex items-center justify-between border-b border-line/60 pb-2.5">
								<span className="font-semibold text-ink">Staff Engineer JD Match</span>
								<span className="rounded-full bg-emerald-500/15 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
									96% ATS Score
								</span>
							</div>
							<div className="mt-2.5 flex flex-wrap gap-1.5">
								<span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
									✓ TypeScript
								</span>
								<span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
									✓ System Design
								</span>
								<span className="rounded border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
									+ GraphQL (Critical)
								</span>
								<span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
									✓ Docker
								</span>
							</div>
						</div>
					</div>

					<div className="mt-6 border-t border-line/60 pt-4">
						<Link
							to="/ats-checker"
							className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-text hover:underline"
						>
							<span>Test your resume with free ATS scanner</span>
							<Icon name="arrow-right" size={14} />
						</Link>
					</div>
				</div>

				{/* Feature 2: Smart Page Squeezer */}
				<div className="group relative flex flex-col justify-between rounded-2xl border border-line bg-surface p-7 transition-all duration-300 hover:border-line-2 hover:shadow-xl">
					<div>
						<div className="flex items-center justify-between">
							<div className="grid size-12 place-items-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
								<Icon name="arrows-in-line-vertical" size={24} />
							</div>
							<span className="font-martian rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
								Zero Spillover
							</span>
						</div>

						<h3 className="mt-6 font-display text-xl font-semibold text-ink">
							Smart Page Squeezer (Auto-Fit Overflow)
						</h3>
						<p className="mt-2 text-sm leading-relaxed text-ink-2">
							Never suffer an awkward 2-line spillover onto page 2. In one click, our auto-fit algorithm recalculates
							margins, line heights, and section gaps to lock your resume into exactly 1 or 2 balanced pages.
						</p>

						{/* Visual Widget Mock */}
						<div className="mt-5 rounded-xl border border-line bg-raised/70 p-3.5 text-xs">
							<div className="flex items-center justify-between border-b border-line/60 pb-2.5">
								<span className="font-semibold text-ink">Page Density Optimizer</span>
								<span className="text-[11px] text-ink-3">Page 1 of 1</span>
							</div>
							<div className="mt-3 grid grid-cols-3 gap-1.5 font-medium">
								<div className="rounded border border-blue-500/30 bg-blue-500/15 p-1.5 text-center text-[10px] font-bold text-blue-600 dark:text-blue-400">
									Fit 1 Page
								</div>
								<div className="rounded border border-line bg-surface p-1.5 text-center text-[10px] text-ink-2">
									2-Page Relaxed
								</div>
								<div className="rounded border border-line bg-surface p-1.5 text-center text-[10px] text-ink-2">
									Micro-Tighten
								</div>
							</div>
							<p className="mt-2 text-[10px] text-ink-3">Spillover lines eliminated · 10mm safe print margins</p>
						</div>
					</div>

					<div className="mt-6 border-t border-line/60 pt-4">
						<span className="text-xs font-semibold text-accent-text">Auto-balances font size &amp; spacing</span>
					</div>
				</div>

				{/* Feature 3: Pure TypeScript QR Code & vCard 3.0 Export */}
				<div className="group relative flex flex-col justify-between rounded-2xl border border-line bg-surface p-7 transition-all duration-300 hover:border-line-2 hover:shadow-xl">
					<div>
						<div className="flex items-center justify-between">
							<div className="grid size-12 place-items-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
								<Icon name="qr-code" size={24} />
							</div>
							<span className="font-martian rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-600 dark:text-purple-400">
								Client-Side Vector
							</span>
						</div>

						<h3 className="mt-6 font-display text-xl font-semibold text-ink">Vector SVG QR &amp; Instant vCard 3.0</h3>
						<p className="mt-2 text-sm leading-relaxed text-ink-2">
							Connect physical print resumes to recruiters' mobile phones with zero-dependency vector QR codes. Switch
							between your live resume link and an RFC 2426 vCard that saves your contact card in one scan.
						</p>

						{/* Visual Widget Mock */}
						<div className="mt-5 flex items-center gap-3.5 rounded-xl border border-line bg-raised/70 p-3.5 text-xs">
							<div className="shrink-0 rounded-lg border border-line bg-surface p-1.5">
								<svg width="48" height="48" viewBox="0 0 25 25" fill="none">
									<rect width="25" height="25" fill="white" />
									<rect x="2" y="2" width="7" height="7" fill="black" />
									<rect x="3" y="3" width="5" height="5" fill="white" />
									<rect x="4" y="4" width="3" height="3" fill="black" />
									<rect x="16" y="2" width="7" height="7" fill="black" />
									<rect x="17" y="3" width="5" height="5" fill="white" />
									<rect x="18" y="4" width="3" height="3" fill="black" />
									<rect x="2" y="16" width="7" height="7" fill="black" />
									<rect x="3" y="17" width="5" height="5" fill="white" />
									<rect x="4" y="18" width="3" height="3" fill="black" />
									<rect x="11" y="4" width="2" height="4" fill="black" />
									<rect x="11" y="10" width="3" height="2" fill="black" />
									<rect x="16" y="11" width="3" height="3" fill="black" />
									<rect x="11" y="16" width="2" height="5" fill="black" />
									<rect x="15" y="17" width="4" height="2" fill="black" />
									<rect x="16" y="21" width="5" height="2" fill="black" />
								</svg>
							</div>
							<div className="space-y-1">
								<span className="font-semibold text-ink">Two Scan Modes:</span>
								<p className="text-[11px] text-ink-2">• Web Portfolio Link</p>
								<p className="text-[11px] text-ink-2">• Instant vCard 3.0 Phone Save</p>
							</div>
						</div>
					</div>

					<div className="mt-6 border-t border-line/60 pt-4">
						<span className="text-xs font-semibold text-accent-text">Zero third-party tracking or redirects</span>
					</div>
				</div>

				{/* Feature 4: Total Rewards Offer Comparison Calculator */}
				<div className="group relative flex flex-col justify-between rounded-2xl border border-line bg-surface p-7 transition-all duration-300 hover:border-line-2 hover:shadow-xl">
					<div>
						<div className="flex items-center justify-between">
							<div className="grid size-12 place-items-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
								<Icon name="chart-line-up" size={24} />
							</div>
							<span className="font-martian rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
								Negotiation Engine
							</span>
						</div>

						<h3 className="mt-6 font-display text-xl font-semibold text-ink">Total Rewards &amp; Offer Comparison</h3>
						<p className="mt-2 text-sm leading-relaxed text-ink-2">
							Compare competing offers side-by-side. Calculate Year 1 total comp, annual bonuses, 4-year equity vesting,
							and cash/equity splits. Generate professional counteroffer negotiation email scripts with 1 click.
						</p>

						{/* Visual Widget Mock */}
						<div className="mt-5 rounded-xl border border-line bg-raised/70 p-3.5 text-xs">
							<div className="grid grid-cols-2 gap-2 border-b border-line/60 pb-2.5 text-center">
								<div>
									<span className="text-[10px] text-ink-3">Offer A (Company Alpha)</span>
									<p className="font-mono font-bold text-ink">$205,000 Yr 1</p>
								</div>
								<div>
									<span className="text-[10px] text-ink-3">Offer B (Company Beta)</span>
									<p className="font-mono font-bold text-ink">$205,000 Yr 1</p>
								</div>
							</div>
							<div className="mt-2.5 flex items-center justify-between text-[11px]">
								<span className="font-semibold text-emerald-600 dark:text-emerald-400">
									+$15,000 Base Salary Advantage (B)
								</span>
								<span className="rounded bg-accent-soft px-1.5 py-0.5 text-[9.5px] font-bold text-accent-text">
									Script Ready
								</span>
							</div>
						</div>
					</div>

					<div className="mt-6 border-t border-line/60 pt-4">
						<span className="text-xs font-semibold text-accent-text">
							Includes 1-click counteroffer email generator
						</span>
					</div>
				</div>

				{/* Feature 5: Multi-Language Resume Section Translator */}
				<div className="group relative flex flex-col justify-between rounded-2xl border border-line bg-surface p-7 transition-all duration-300 hover:border-line-2 hover:shadow-xl">
					<div>
						<div className="flex items-center justify-between">
							<div className="grid size-12 place-items-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
								<Icon name="globe-simple" size={24} />
							</div>
							<span className="font-martian rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-600 dark:text-cyan-400">
								11 Languages
							</span>
						</div>

						<h3 className="mt-6 font-display text-xl font-semibold text-ink">
							1-Click Multi-Language Section Translator
						</h3>
						<p className="mt-2 text-sm leading-relaxed text-ink-2">
							Target global job markets with zero manual translation friction. Localize all standard section headers
							into 11 languages with one click, complete with automatic right-to-left (RTL) support and typography
							matching.
						</p>

						{/* Visual Widget Mock */}
						<div className="mt-5 rounded-xl border border-line bg-raised/70 p-3.5 text-xs">
							<span className="font-semibold text-ink">1-Click Localized Headers:</span>
							<div className="mt-2 flex flex-wrap gap-1 text-[10px]">
								<span className="rounded bg-surface px-2 py-0.5 text-ink-2">Deutsch (Berufserfahrung)</span>
								<span className="rounded bg-surface px-2 py-0.5 text-ink-2">Français (Expérience)</span>
								<span className="rounded bg-surface px-2 py-0.5 text-ink-2">Español (Experiencia)</span>
								<span className="rounded bg-surface px-2 py-0.5 text-ink-2">日本語 (職務経歴)</span>
								<span className="rounded bg-surface px-2 py-0.5 text-ink-2">中文 (工作经历)</span>
								<span className="rounded bg-surface px-2 py-0.5 text-ink-2">العربية</span>
							</div>
						</div>
					</div>

					<div className="mt-6 border-t border-line/60 pt-4">
						<span className="text-xs font-semibold text-accent-text">Preserves custom descriptions untouched</span>
					</div>
				</div>

				{/* Feature 6: Project & Portfolio Media Badges */}
				<div className="group relative flex flex-col justify-between rounded-2xl border border-line bg-surface p-7 transition-all duration-300 hover:border-line-2 hover:shadow-xl">
					<div>
						<div className="flex items-center justify-between">
							<div className="grid size-12 place-items-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
								<Icon name="link-simple-horizontal" size={24} />
							</div>
							<span className="font-martian rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
								Live URL Detection
							</span>
						</div>

						<h3 className="mt-6 font-display text-xl font-semibold text-ink">Verified Portfolio &amp; Media Badges</h3>
						<p className="mt-2 text-sm leading-relaxed text-ink-2">
							Make your project evidence pop. Enter links to GitHub, GitLab, Figma prototypes, YouTube demos, Apple App
							Store, or Google Play, and DipperGo automatically generates verified branded visual badges.
						</p>

						{/* Visual Widget Mock */}
						<div className="mt-5 space-y-1.5 rounded-xl border border-line bg-raised/70 p-3.5 text-xs">
							<div className="flex items-center gap-2 rounded bg-surface p-1.5 text-[11px] text-ink">
								<span className="font-bold text-zinc-900 dark:text-zinc-100">GitHub</span>
								<span className="text-ink-3">github.com/alexmorgan/engine</span>
							</div>
							<div className="flex items-center gap-2 rounded bg-surface p-1.5 text-[11px] text-ink">
								<span className="font-bold text-purple-600 dark:text-purple-400">Figma</span>
								<span className="text-ink-3">figma.com/@alexmorgan/core</span>
							</div>
							<div className="flex items-center gap-2 rounded bg-surface p-1.5 text-[11px] text-ink">
								<span className="font-bold text-blue-600 dark:text-blue-400">App Store</span>
								<span className="text-ink-3">apps.apple.com/app/parcel</span>
							</div>
						</div>
					</div>

					<div className="mt-6 border-t border-line/60 pt-4">
						<span className="text-xs font-semibold text-accent-text">Auto-detects 10+ popular creator platforms</span>
					</div>
				</div>
			</div>

			{/* Bottom Trust Banner: 100% Free Forever */}
			<div className="mt-14 flex flex-col items-center justify-between gap-6 rounded-2xl border border-line bg-raised p-8 sm:flex-row sm:p-10">
				<div>
					<div className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent-text">
						<Icon name="check" size={14} />
						<span>100% Free Forever · Zero Paywalls</span>
					</div>
					<h3 className="mt-3 font-display text-2xl font-semibold text-ink">
						No $29.99 subscription traps right before you download
					</h3>
					<p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-2">
						Export unlimited vector PDFs, Microsoft Word (.docx) files, and live web resume links with zero watermarks.
						No credit card required.
					</p>
				</div>
				<Link
					to="/auth/register"
					className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-sm bg-accent px-6 font-ui text-sm font-semibold text-white shadow-md transition-all hover:bg-accent-hover"
				>
					<span>Start Building Free</span>
					<Icon name="arrow-right" size={16} />
				</Link>
			</div>
		</section>
	);
}
