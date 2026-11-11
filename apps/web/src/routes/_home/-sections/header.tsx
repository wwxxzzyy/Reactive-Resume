import { t } from "@lingui/core/macro";
import {
	ArrowRightIcon,
	CheckCircleIcon,
	FileTextIcon,
	ListIcon,
	SparkleIcon,
	TranslateIcon,
	XIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";
import { BrandIcon } from "@reactive-resume/ui/components/brand-icon";
import { Button } from "@reactive-resume/ui/components/button";
import { LocaleCombobox } from "@/features/locale/combobox";
import { ThemeToggleButton } from "@/features/theme/toggle-button";
import { authClient } from "@/libs/auth/client";

export function Header() {
	const [hidden, setHidden] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const { scrollY } = useScroll();
	const { data: session } = authClient.useSession();
	const isAuthenticated = Boolean(session?.user);

	useMotionValueEvent(scrollY, "change", (current) => {
		setHidden(current > 32 && current > (scrollY.getPrevious() ?? 0));
	});

	return (
		<header
			data-hidden={hidden}
			className="fixed inset-x-0 top-0 z-50 animate-in border-b border-line/60 bg-bg/90 backdrop-blur-xl ease-out-strong animation-duration-300 [transition:translate_250ms_var(--ease-out-strong)] fade-in data-[hidden=true]:-translate-y-full"
		>
			<nav
				aria-label={t`Main navigation`}
				className="container mx-auto flex items-center justify-between gap-x-4 p-3 lg:px-8"
			>
				{/* Brand mark with informative title & subtitle */}
				<Link
					to="/"
					className="flex items-center gap-3 transition-opacity hover:opacity-85"
					aria-label="DipperGo Resume Builder - Go to homepage"
				>
					<BrandIcon variant="icon" className="size-9 shrink-0 text-accent" />
					<div className="flex flex-col text-start">
						<div className="flex items-center gap-2">
							<span className="font-anybody text-lg leading-none font-bold tracking-tight text-ink">DipperGo</span>
							<span className="font-martian rounded border border-accent/25 bg-accent/15 px-1.5 py-0.5 text-[9.5px] leading-none font-bold tracking-wider text-accent-text uppercase">
								Resume Builder
							</span>
						</div>
						<span className="font-martian mt-0.5 hidden text-[10px] font-medium tracking-tight text-ink-3 sm:block">
							Free ATS Resumes &amp; Application Tracker
						</span>
					</div>
				</Link>

				{/* Informative Desktop Navigation */}
				<div className="hidden items-center gap-1 lg:flex xl:gap-2">
					<Link
						to="/resume-templates"
						className="flex h-[36px] items-center gap-2 rounded-md px-3 font-ui text-xs font-medium text-ink-2 transition-colors hover:bg-hover hover:text-ink xl:text-sm [&.active]:bg-hover [&.active]:text-ink"
					>
						<FileTextIcon className="size-4 text-accent-text" />
						<span>Resume Templates</span>
						<span className="font-martian rounded border border-line bg-raised px-1.5 py-0.5 text-[10px] font-semibold text-ink-3">
							21 ATS
						</span>
					</Link>

					<Link
						to="/resume-examples"
						className="flex h-[36px] items-center gap-2 rounded-md px-3 font-ui text-xs font-medium text-ink-2 transition-colors hover:bg-hover hover:text-ink xl:text-sm [&.active]:bg-hover [&.active]:text-ink"
					>
						<SparkleIcon className="size-4 text-accent-text" />
						<span>Resume Examples</span>
						<span className="font-martian rounded border border-line bg-raised px-1.5 py-0.5 text-[10px] font-semibold text-ink-3">
							Roles
						</span>
					</Link>

					<Link
						to="/ats-checker"
						className="flex h-[36px] items-center gap-2 rounded-md px-3 font-ui text-xs font-medium text-ink-2 transition-colors hover:bg-hover hover:text-ink xl:text-sm [&.active]:bg-hover [&.active]:text-ink"
					>
						<CheckCircleIcon className="size-4 text-emerald-500" />
						<span>ATS Resume Scanner</span>
						<span className="font-martian rounded border border-emerald-500/20 bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
							Free
						</span>
					</Link>

					<Link
						to="/"
						hash="features"
						className="flex h-[36px] items-center gap-1.5 rounded-md px-3 font-ui text-xs font-medium text-ink-2 transition-colors hover:bg-hover hover:text-ink xl:text-sm"
					>
						<span>Features</span>
					</Link>

					<Link
						to="/"
						hash="capabilities"
						className="flex h-[36px] items-center gap-1.5 rounded-md px-3 font-ui text-xs font-medium text-ink-2 transition-colors hover:bg-hover hover:text-ink xl:text-sm"
					>
						<SparkleIcon className="size-4 text-accent-text" />
						<span>Export (PDF/DOCX)</span>
					</Link>
				</div>

				{/* Right Actions */}
				<div className="flex items-center gap-2 sm:gap-3">
					{isAuthenticated ? (
						<Link
							to="/dashboard"
							className="inline-flex h-[36px] items-center gap-1.5 rounded-md bg-accent px-4 font-ui text-xs font-semibold text-on-accent shadow-xs transition-colors hover:bg-accent-hover"
						>
							<span>Dashboard</span>
							<ArrowRightIcon className="size-3.5" />
						</Link>
					) : (
						<>
							<Link
								to="/auth/login"
								className="inline-flex h-[36px] items-center justify-center rounded-md border border-line-2 bg-raised px-3.5 font-ui text-xs font-semibold text-ink shadow-xs transition-colors hover:border-ink/20 hover:bg-hover"
							>
								Sign in
							</Link>
							<Link
								to="/auth/register"
								className="inline-flex h-[36px] items-center justify-center gap-1.5 rounded-md bg-accent px-4 font-ui text-xs font-semibold text-on-accent shadow-xs transition-colors hover:bg-accent-hover"
							>
								<span>Build Resume Free</span>
								<ArrowRightIcon className="size-3.5" />
							</Link>
						</>
					)}

					<LocaleCombobox
						render={
							<Button size="icon" variant="ghost" aria-label={t`Change language`}>
								<TranslateIcon />
							</Button>
						}
					/>

					<ThemeToggleButton />

					{/* Mobile Menu Toggle */}
					<button
						type="button"
						aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
						aria-expanded={mobileMenuOpen}
						onClick={() => setMobileMenuOpen((open) => !open)}
						className="flex size-[36px] items-center justify-center rounded-md border border-line-2 bg-raised text-ink transition-colors hover:bg-hover lg:hidden"
					>
						{mobileMenuOpen ? <XIcon className="size-4" /> : <ListIcon className="size-4" />}
					</button>
				</div>
			</nav>

			{/* Responsive Mobile Drawer */}
			{mobileMenuOpen && (
				<div className="animate-in border-t border-line bg-surface/98 p-5 shadow-2xl backdrop-blur-2xl duration-200 fade-in slide-in-from-top-2 lg:hidden">
					<div className="flex flex-col gap-4">
						<div className="flex items-center gap-2 border-b border-line pb-3">
							<span className="font-martian text-xs font-bold tracking-wider text-accent-text uppercase">
								DipperGo · Free ATS Resume Builder
							</span>
						</div>

						<nav className="flex flex-col gap-1 border-b border-line pb-3">
							<Link
								to="/resume-templates"
								onClick={() => setMobileMenuOpen(false)}
								className="flex items-center justify-between rounded-md p-2.5 font-ui text-sm font-medium text-ink transition-colors hover:bg-hover"
							>
								<div className="flex items-center gap-2.5">
									<FileTextIcon className="size-4 text-accent-text" />
									<span>Resume Templates</span>
								</div>
								<span className="font-martian rounded border border-line bg-raised px-2 py-0.5 text-[10px] text-ink-3">
									21 ATS Layouts
								</span>
							</Link>

							<Link
								to="/resume-examples"
								onClick={() => setMobileMenuOpen(false)}
								className="flex items-center justify-between rounded-md p-2.5 font-ui text-sm font-medium text-ink transition-colors hover:bg-hover"
							>
								<div className="flex items-center gap-2.5">
									<SparkleIcon className="size-4 text-accent-text" />
									<span>Resume Examples</span>
								</div>
								<span className="font-martian rounded border border-line bg-raised px-2 py-0.5 text-[10px] text-ink-3">
									By Job Role
								</span>
							</Link>

							<Link
								to="/ats-checker"
								onClick={() => setMobileMenuOpen(false)}
								className="flex items-center justify-between rounded-md p-2.5 font-ui text-sm font-medium text-ink transition-colors hover:bg-hover"
							>
								<div className="flex items-center gap-2.5">
									<CheckCircleIcon className="size-4 text-emerald-500" />
									<span>ATS Resume Scanner</span>
								</div>
								<span className="font-martian rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
									Free Diagnostic
								</span>
							</Link>

							<Link
								to="/"
								hash="features"
								onClick={() => setMobileMenuOpen(false)}
								className="flex items-center gap-2.5 rounded-md p-2.5 font-ui text-sm font-medium text-ink transition-colors hover:bg-hover"
							>
								<span>Platform Features</span>
							</Link>

							<Link
								to="/"
								hash="capabilities"
								onClick={() => setMobileMenuOpen(false)}
								className="flex items-center gap-2.5 rounded-md p-2.5 font-ui text-sm font-medium text-ink transition-colors hover:bg-hover"
							>
								<SparkleIcon className="size-4 text-accent-text" />
								<span>Export Engine (PDF &amp; DOCX)</span>
							</Link>
						</nav>

						<div className="flex flex-col gap-2.5">
							{isAuthenticated ? (
								<Link
									to="/dashboard"
									onClick={() => setMobileMenuOpen(false)}
									className="flex h-11 items-center justify-center gap-2 rounded-md bg-accent font-ui font-semibold text-on-accent"
								>
									<span>Go to Dashboard</span>
									<ArrowRightIcon className="size-4" />
								</Link>
							) : (
								<>
									<Link
										to="/auth/register"
										onClick={() => setMobileMenuOpen(false)}
										className="flex h-11 items-center justify-center gap-2 rounded-md bg-accent font-ui font-semibold text-on-accent"
									>
										<span>Build Resume Free</span>
										<ArrowRightIcon className="size-4" />
									</Link>
									<Link
										to="/auth/login"
										onClick={() => setMobileMenuOpen(false)}
										className="flex h-11 items-center justify-center rounded-md border border-line-2 bg-raised font-ui font-semibold text-ink"
									>
										Sign in
									</Link>
								</>
							)}
						</div>
					</div>
				</div>
			)}
		</header>
	);
}
