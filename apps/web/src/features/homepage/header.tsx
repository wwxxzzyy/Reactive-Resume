import { t } from "@lingui/core/macro";
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@reactive-resume/ui/components/icon";
import { cn } from "@reactive-resume/utils/style";
import { useLanding } from "./scroll";
import { LanguageDoorway } from "./sections";
import { CtaLink } from "./ui";
import { useTheme } from "@/features/theme/provider";
import { authClient } from "@/libs/auth/client";

const getNavItems = () => [
	{ to: "#templates", label: "Resume Templates", badge: "12 ATS" },
	{ to: "/ats-checker", label: "ATS Resume Checker", badge: "Free Scan" },
	{ to: "#ai-credits", label: "AI Packs & Pricing", badge: "No Sub", highlight: true },
	{ to: "#features", label: "Features" },
	{ to: "#capabilities", label: "Capabilities" },
];

export function LandingHeader() {
	const scrolled = useLanding((state) => state.scrolled);
	const night = useLanding((state) => state.night);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const { data: session } = authClient.useSession();
	const isAuthenticated = Boolean(session?.user);

	return (
		<header
			className={cn(
				"night-ink fixed inset-x-0 top-0 z-70 flex h-16 items-center gap-3 ps-(--gutter) pe-[calc(var(--gutter)+30px)] whitespace-nowrap transition-colors duration-300 sm:gap-6",
				scrolled && "border-b border-line/60 bg-bg/85 backdrop-blur-md",
			)}
		>
			<div
				aria-hidden="true"
				className={cn(
					"header-taper pointer-events-none absolute inset-x-0 top-0 -z-1 h-28 transition-opacity duration-[.4s]",
					scrolled ? "opacity-[calc(1-var(--nt,0))]" : "opacity-0",
				)}
			/>

			{/* Brand mark with informative title & subtitle */}
			<a
				href="#top"
				className="flex items-center gap-3 rounded-md transition-opacity hover:opacity-85"
				aria-label="DipperGo Resume Builder"
			>
				<img
					src="/icon/light.svg?v=4"
					alt="DipperGo"
					width={32}
					height={32}
					className={cn("size-[32px] dark:hidden", night && "hidden")}
				/>
				<img
					src="/icon/dark.svg?v=4"
					alt="DipperGo"
					width={32}
					height={32}
					className={cn("hidden size-[32px] dark:block", night && "block")}
				/>
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
			</a>

			<nav aria-label="Navigation" className="mx-auto hidden items-center gap-1 min-[900px]:flex">
				{getNavItems().map(({ to, label, badge, highlight }) => {
					const content = (
						<>
							<span>{label}</span>
							{badge && (
								<span
									className={cn(
										"font-martian rounded px-1.5 py-0.5 text-[10px] font-semibold",
										highlight
											? "border border-accent/25 bg-accent/15 font-bold text-accent-text"
											: "border border-line bg-surface text-ink-3",
									)}
								>
									{badge}
								</span>
							)}
						</>
					);

					if (to.startsWith("/")) {
						return (
							<Link
								key={to}
								to={to}
								className="flex h-[34px] items-center gap-1.5 rounded-sm px-3 font-ui text-xs font-medium text-ink-2 transition-colors hover:bg-hover hover:text-ink"
							>
								{content}
							</Link>
						);
					}
					return (
						<a
							key={to}
							href={to}
							className="flex h-[34px] items-center gap-1.5 rounded-sm px-3 font-ui text-xs font-medium text-ink-2 transition-colors hover:bg-hover hover:text-ink"
						>
							{content}
						</a>
					);
				})}
			</nav>

			<div className="ms-auto flex items-center gap-2 sm:gap-3">
				{isAuthenticated ? (
					<Link
						to="/dashboard"
						className="inline-flex h-[36px] items-center gap-1.5 rounded-sm bg-accent px-3.5 font-ui text-xs font-semibold text-on-accent shadow-xs transition-all hover:bg-accent-hover"
					>
						<span>Dashboard</span>
						<Icon name="arrow-right" size={14} />
					</Link>
				) : (
					<>
						<Link
							to="/auth/login"
							className="inline-flex h-[36px] items-center justify-center rounded-sm border border-line-2 bg-raised px-3 font-ui text-xs font-semibold text-ink shadow-xs transition-colors hover:border-ink/20 hover:bg-hover sm:px-4"
						>
							Sign in
						</Link>
						<CtaLink size="header" />
					</>
				)}

				<LanguageDoorway
					className="font-martian h-[34px] gap-[7px] rounded-sm px-2 text-xs leading-none font-medium font-stretch-[87.5%] opacity-65 transition-opacity duration-300 hover:opacity-100 sm:px-[11px]"
					nameClassName="max-[639px]:sr-only"
				/>

				<button
					type="button"
					aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
					aria-expanded={mobileMenuOpen}
					onClick={() => setMobileMenuOpen((open) => !open)}
					className="flex size-[36px] items-center justify-center rounded-sm border border-line-2 bg-raised text-ink transition-colors hover:bg-hover min-[900px]:hidden"
				>
					<Icon name={mobileMenuOpen ? "x" : "list-dashes"} size={18} />
				</button>
			</div>

			{/* Mobile menu dropdown */}
			{mobileMenuOpen && (
				<div className="absolute inset-x-0 top-16 animate-in border-b border-line bg-surface/98 p-5 shadow-2xl backdrop-blur-xl duration-200 fade-in slide-in-from-top-2 min-[900px]:hidden">
					<div className="flex flex-col gap-4">
						<div className="flex items-center gap-2 border-b border-line pb-3">
							<span className="font-martian text-xs font-bold tracking-wider text-accent-text uppercase">
								DipperGo · Free ATS Resume Builder
							</span>
						</div>

						<nav className="flex flex-col gap-1 border-b border-line pb-3">
							{getNavItems().map(({ to, label, badge }) => {
								const inner = (
									<div className="flex w-full items-center justify-between">
										<span>{label}</span>
										{badge && (
											<span className="font-martian rounded border border-line bg-raised px-2 py-0.5 text-[10px] text-ink-3">
												{badge}
											</span>
										)}
									</div>
								);
								if (to.startsWith("/")) {
									return (
										<Link
											key={to}
											to={to}
											onClick={() => setMobileMenuOpen(false)}
											className="flex h-10 items-center rounded-md px-3 font-ui text-sm font-medium text-ink transition-colors hover:bg-hover"
										>
											{inner}
										</Link>
									);
								}
								return (
									<a
										key={to}
										href={to}
										onClick={() => setMobileMenuOpen(false)}
										className="flex h-10 items-center rounded-md px-3 font-ui text-sm font-medium text-ink transition-colors hover:bg-hover"
									>
										{inner}
									</a>
								);
							})}
						</nav>
						<div className="flex flex-col gap-2.5">
							{isAuthenticated ? (
								<Link
									to="/dashboard"
									onClick={() => setMobileMenuOpen(false)}
									className="flex h-11 items-center justify-center gap-2 rounded-sm bg-accent font-ui font-semibold text-on-accent"
								>
									<span>Go to Dashboard</span>
									<Icon name="arrow-right" size={16} />
								</Link>
							) : (
								<>
									<Link
										to="/auth/register"
										onClick={() => setMobileMenuOpen(false)}
										className="flex h-11 items-center justify-center gap-2 rounded-sm bg-accent font-ui font-semibold text-on-accent"
									>
										<span>Build Resume Free</span>
										<Icon name="arrow-right" size={16} />
									</Link>
									<Link
										to="/auth/login"
										onClick={() => setMobileMenuOpen(false)}
										className="flex h-11 items-center justify-center rounded-sm border border-line-2 bg-raised font-ui font-semibold text-ink"
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

/**
 * The only theme switch: a pull cord with a line-drawn bulb, hanging at the top corner. It sways every few seconds
 * until it's first pulled, and the bulb lights up in dark mode.
 */
export function ThemeCord() {
	const { resolvedTheme, toggleTheme } = useTheme();
	const [pulling, setPulling] = useState(false);
	const [pulledOnce, setPulledOnce] = useState(false);
	const timeout = useRef(0);

	useEffect(() => () => window.clearTimeout(timeout.current), []);

	const pull = () => {
		setPulling(true);
		setPulledOnce(true);
		window.clearTimeout(timeout.current);
		// The theme changes as the cord reaches the bottom of its pull.
		timeout.current = window.setTimeout(() => {
			setPulling(false);
			toggleTheme();
		}, 170);
	};

	const label = resolvedTheme === "dark" ? t`Switch to light mode` : t`Switch to dark mode`;

	return (
		<button
			type="button"
			onClick={pull}
			aria-label={label}
			title={label}
			className={cn(
				"night-ink fixed end-[clamp(8px,1.2vw,18px)] top-0 z-72 flex w-[30px] origin-top flex-col items-center [transition:height_.45s_cubic-bezier(.3,1.7,.5,1)]",
				pulling ? "h-[124px]" : "h-[92px] hover:h-[112px]",
				!pulledOnce && "motion-safe:animate-swing",
			)}
		>
			<span aria-hidden="true" className="w-[1.5px] flex-1 bg-current opacity-50" />
			<svg aria-hidden="true" width="30" height="40" viewBox="0 0 30 40" className="flex-none overflow-visible">
				<circle
					cx="15"
					cy="22"
					r="16"
					className="dark:motion-safe:animate-flicker fill-[oklch(0.9_0.14_90)] opacity-0 blur-[6px] transition-opacity duration-500 dark:opacity-35"
				/>
				<rect x="11.5" y="2" width="7" height="6" rx="1.2" fill="currentColor" opacity="0.75" />
				<path d="M11.8 5h6.4M11.8 7h6.4" strokeWidth="0.8" opacity="0.6" className="stroke-bg" />
				<path
					d="M11.5 8 C11.5 12 5 15 5 22 a10 10 0 0 0 20 0 C25 15 18.5 12 18.5 8 Z"
					stroke="currentColor"
					strokeWidth="1.3"
					className="fill-[color-mix(in_oklch,var(--bg)_60%,transparent)] transition-[fill] duration-[.4s] dark:fill-[oklch(0.95_0.11_92)]"
				/>
				<path
					d="M12.5 10 V16 M17.5 10 V16 M12.5 16 c0 3 1 4 1.25 5 c.25-1 .5-2 1.25-2 c.75 0 1 1 1.25 2 c.25-1 1.25-2 1.25-5"
					fill="none"
					strokeWidth="1"
					strokeLinecap="round"
					className="stroke-current opacity-55 dark:stroke-[oklch(0.7_0.16_60)] dark:opacity-100"
				/>
			</svg>
		</button>
	);
}
