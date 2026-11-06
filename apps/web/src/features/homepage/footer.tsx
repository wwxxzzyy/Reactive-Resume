import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@reactive-resume/ui/components/icon";
import { cn } from "@reactive-resume/utils/style";
import { SCENE } from "./scroll";
import { LanguageDoorway } from "./sections";
import { useTheme } from "@/features/theme/provider";

const linkClass =
	"text-ink-2 transition-colors hover:text-accent-text hover:underline underline-offset-4 text-xs sm:text-sm";
const CURRENT_YEAR = new Date().getFullYear();

type FooterLink =
	| { label: string; href: string; badge?: string; highlight?: boolean }
	| {
			label: string;
			to: "/ats-checker" | "/auth/login" | "/auth/register" | "/resume-templates";
			badge?: string;
			highlight?: boolean;
	  };

const getColumns = (): { id: string; title: string; links: FooterLink[] }[] => [
	{
		id: "product",
		title: "Product & Tools",
		links: [
			{ label: "Resume Templates", to: "/resume-templates", badge: "12 ATS" },
			{ label: "ATS Resume Scanner", to: "/ats-checker", badge: "Free Scan", highlight: true },
			{ label: "Job Tracker Kanban", to: "/auth/register" },
			{ label: "Platform Features", href: "#features" },
			{ label: "Export Engine", href: "#capabilities" },
		],
	},
	{
		id: "templates",
		title: "Templates by Role",
		links: [
			{ label: "Single-Column Formats", to: "/resume-templates" },
			{ label: "Two-Column Modern", to: "/resume-templates" },
			{ label: "Executive & Leadership", to: "/resume-templates" },
			{ label: "Tech & Engineering", to: "/resume-templates" },
			{ label: "Creative & Product", to: "/resume-templates" },
		],
	},
	{
		id: "capabilities",
		title: "Capabilities",
		links: [
			{ label: "Vector PDF Export", href: "#capabilities" },
			{ label: "Microsoft Word DOCX", href: "#capabilities" },
			{ label: "Semantic ATS Headings", href: "#capabilities" },
			{ label: "Applicant Success Stories", href: "#reviews" },
			{ label: "Pre-submission Audit", to: "/ats-checker" },
		],
	},
	{
		id: "company",
		title: "DipperGo",
		links: [
			{ label: "Sign in", to: "/auth/login" },
			{ label: "Get started", to: "/auth/register" },
			{ label: "Contact Support", href: "mailto:support@dippergo.com" },
			{ label: "Privacy & Terms", to: "/auth/login" },
		],
	},
];

function FooterLinkItem({ link }: { link: FooterLink }): ReactNode {
	const content = (
		<span className="inline-flex items-center gap-1.5">
			<span>{link.label}</span>
			{link.badge && (
				<span
					className={cn(
						"py-0.2 font-martian rounded px-1.5 text-[9.5px] leading-normal font-semibold",
						link.highlight
							? "border border-accent/25 bg-accent/15 font-bold text-accent-text"
							: "border border-line bg-raised text-ink-3",
					)}
				>
					{link.badge}
				</span>
			)}
		</span>
	);

	if ("to" in link) {
		return (
			<Link to={link.to} className={linkClass}>
				{content}
			</Link>
		);
	}
	return (
		<a href={link.href} className={linkClass}>
			{content}
		</a>
	);
}

/**
 * Modern, professional SaaS footer consistent with DipperGo branding and design system.
 */
export function LandingFooter() {
	const { resolvedTheme, toggleTheme } = useTheme();

	return (
		<footer
			data-scene={SCENE.footer}
			className="relative overflow-hidden border-t border-line/80 bg-surface/40 font-ui backdrop-blur-md"
		>
			{/* Top ambient highlight line */}
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent"
			/>

			{/* Soft background glow */}
			<div
				aria-hidden="true"
				className="pointer-events-none absolute -bottom-48 left-1/2 size-[600px] -translate-x-1/2 rounded-full bg-accent/5 blur-[120px]"
			/>

			<div className="relative z-1 mx-auto max-w-[1440px] px-(--gutter) pt-16 pb-12">
				<div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
					{/* Left brand & mission column */}
					<div className="flex flex-col items-start gap-4 lg:col-span-4">
						<Link
							to="/"
							className="flex items-center gap-3 transition-opacity hover:opacity-85"
							aria-label="DipperGo Resume Builder"
						>
							<img src="/icon/light.svg" alt="" width={36} height={36} className="size-9 dark:hidden" />
							<img src="/icon/dark.svg" alt="" width={36} height={36} className="hidden size-9 dark:block" />
							<div className="flex flex-col text-start">
								<div className="flex items-center gap-2">
									<span className="font-anybody text-xl leading-none font-bold tracking-tight text-ink">DipperGo</span>
									<span className="font-martian rounded border border-accent/25 bg-accent/15 px-1.5 py-0.5 text-[9.5px] leading-none font-bold tracking-wider text-accent-text uppercase">
										Resume Builder
									</span>
								</div>
								<span className="font-martian mt-0.5 text-[10.5px] font-medium tracking-tight text-ink-3">
									Free ATS Resumes &amp; Application Platform
								</span>
							</div>
						</Link>

						<p className="mt-1 max-w-sm font-ui text-sm leading-relaxed text-ink-2">
							The recruiter-approved resume builder. Engineered with clean semantic hierarchy for ATS parsers,
							recruiter-approved typography, and a built-in application tracker.
						</p>

						<ul className="mt-2 flex flex-col gap-2 font-ui text-xs text-ink-2">
							<li className="flex items-center gap-2">
								<Icon name="check-circle" size={15} className="text-accent" filled />
								<span>21 Recruiter-Approved ATS Templates</span>
							</li>
							<li className="flex items-center gap-2">
								<Icon name="check-circle" size={15} className="text-accent" filled />
								<span>Free Vector PDF &amp; Word DOCX Exports</span>
							</li>
							<li className="flex items-center gap-2">
								<Icon name="check-circle" size={15} className="text-accent" filled />
								<span>100% Free Forever · Zero Paywalls</span>
							</li>
						</ul>

						<div className="mt-2 inline-flex items-center gap-2 rounded-full border border-line bg-raised/80 px-3 py-1 font-ui text-xs text-ink-2 shadow-2xs backdrop-blur-xs">
							<span className="size-2 animate-pulse rounded-full bg-emerald-500" />
							<span className="font-medium text-ink">All systems operational</span>
							<span className="text-ink-3">·</span>
							<span className="font-mono text-[11px] text-ink-3">v{__APP_VERSION__}</span>
						</div>
					</div>

					{/* Right navigation columns */}
					<div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8">
						{getColumns().map((column) => (
							<nav key={column.id} aria-labelledby={`footer-${column.id}`} className="flex flex-col gap-3 font-ui">
								<h2
									id={`footer-${column.id}`}
									className="font-martian text-xs font-semibold tracking-wider text-ink uppercase"
								>
									{column.title}
								</h2>
								<ul className="flex flex-col gap-2.5">
									{column.links.map((link) => (
										<li key={link.label}>
											<FooterLinkItem link={link} />
										</li>
									))}
								</ul>
							</nav>
						))}
					</div>
				</div>

				{/* Bottom Bar */}
				<div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-line/60 pt-8 font-ui text-xs text-ink-3 sm:flex-row">
					<p className="text-center sm:text-start">
						© {CURRENT_YEAR} DipperGo. All rights reserved.{" "}
						<span className="hidden sm:inline">Built for modern job seekers and career switchers.</span>
					</p>

					<div className="flex flex-wrap items-center gap-4 sm:gap-6">
						<LanguageDoorway className={cn("gap-1.5", linkClass)} />

						<button
							type="button"
							onClick={() => toggleTheme()}
							className="inline-flex items-center gap-1.5 text-ink-2 transition-colors hover:text-accent-text"
							aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
						>
							<Icon name={resolvedTheme === "dark" ? "sun" : "moon"} size={14} />
							<span>{resolvedTheme === "dark" ? "Light mode" : "Dark mode"}</span>
						</button>

						<a
							href="#top"
							className="inline-flex items-center gap-1 text-ink-2 transition-colors hover:text-accent-text"
						>
							<span>Back to top</span>
							<Icon name="arrow-up" size={13} />
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
}
