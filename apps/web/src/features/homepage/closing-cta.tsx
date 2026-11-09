import { Link } from "@tanstack/react-router";
import { Icon } from "@reactive-resume/ui/components/icon";
import { CtaLink } from "./ui";
import { authClient } from "@/libs/auth/client";

export function ClosingCta() {
	const { data: session } = authClient.useSession();
	const isAuthenticated = Boolean(session?.user);

	return (
		<section
			id="get-started"
			aria-labelledby="closing-title"
			className="relative mx-auto max-w-[1440px] border-t border-line px-(--gutter) py-24 sm:py-32"
		>
			<div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-b from-surface via-surface/90 to-surface/60 p-8 text-center shadow-2xl backdrop-blur-md sm:p-14 lg:p-20">
				{/* Ambient glow */}
				<div
					aria-hidden="true"
					className="pointer-events-none absolute -top-24 left-1/2 size-96 -translate-x-1/2 rounded-full bg-accent/15 blur-3xl"
				/>

				<div className="relative z-1 flex flex-col items-center">
					<div className="inline-flex items-center gap-2 rounded-full border border-line bg-raised/80 px-4 py-1.5 text-xs font-semibold text-ink shadow-xs">
						<span className="size-2 animate-pulse rounded-full bg-accent" />
						<span className="font-martian text-ink-2">Get Started in 2 Minutes</span>
						<span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-bold text-accent-text">
							100% Free
						</span>
					</div>

					<h2
						id="closing-title"
						className="font-anybody mt-6 max-w-3xl text-[clamp(36px,5.5vw,72px)] leading-[1.06] font-light tracking-[-.03em] text-balance text-ink"
					>
						Start building your <em className="font-display font-normal text-accent-text italic">interview-winning</em>{" "}
						resume today.
					</h2>

					<p className="mt-5 max-w-2xl font-display text-lg leading-relaxed text-pretty text-ink-2 sm:text-xl">
						Choose from 21 recruiter-approved templates, run real-time JD keyword scoring, auto-fit your layout, and
						compare job offers side-by-side. 100% free forever, no credit card required.
					</p>

					{/* Action Buttons */}
					<div className="mt-10 flex flex-wrap items-center justify-center gap-4">
						{isAuthenticated ? (
							<Link
								to="/dashboard"
								className="inline-flex h-14 items-center gap-2.5 rounded-sm bg-accent px-8 font-ui text-[17px] font-semibold text-on-accent shadow-e2 transition-all hover:bg-accent-hover motion-safe:active:scale-[.97]"
							>
								<span>Go to Your Dashboard</span>
								<Icon name="arrow-right" size={20} />
							</Link>
						) : (
							<>
								<CtaLink size="closing" />
								<Link
									to="/auth/login"
									className="inline-flex h-14 items-center justify-center rounded-sm border border-line-2 bg-raised px-7 font-ui text-[17px] font-semibold text-ink shadow-sm transition-all hover:border-ink/20 hover:bg-hover motion-safe:active:scale-[.97]"
								>
									Sign in to existing account
								</Link>
							</>
						)}
					</div>

					{/* Trust Badges */}
					<div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 font-ui text-xs font-medium text-ink-2">
						<div className="flex items-center gap-1.5">
							<Icon name="check-circle" size={16} className="text-accent" filled />
							<span>21 ATS-Optimized Templates</span>
						</div>
						<div className="flex items-center gap-1.5">
							<Icon name="check-circle" size={16} className="text-accent" filled />
							<span>Vector PDF & Word DOCX</span>
						</div>
						<div className="flex items-center gap-1.5">
							<Icon name="check-circle" size={16} className="text-accent" filled />
							<span>Zero Paywalls or Watermarks</span>
						</div>
						<div className="flex items-center gap-1.5">
							<Icon name="check-circle" size={16} className="text-accent" filled />
							<span>Instant Free Export</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
