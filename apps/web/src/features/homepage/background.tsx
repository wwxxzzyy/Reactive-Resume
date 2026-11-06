/**
 * Executive Navy & Slate backdrop:
 * A subtle geometric grid and ambient executive cobalt mesh glow that creates depth
 * without visual distraction for job seekers and recruiters.
 */
export function LandingBackground() {
	return (
		<div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
			{/* Top ambient executive blue glow */}
			<div className="absolute -top-32 left-1/2 h-[500px] w-[1000px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,oklch(0.52_0.19_255/0.14),transparent_70%)] blur-[90px] dark:bg-[radial-gradient(ellipse_at_center,oklch(0.66_0.17_250/0.18),transparent_70%)]" />

			{/* Secondary subtle side ambient glow */}
			<div className="absolute top-[35%] -left-48 size-[500px] rounded-full bg-[radial-gradient(circle_at_center,oklch(0.52_0.19_255/0.06),transparent_70%)] blur-[100px] dark:bg-[radial-gradient(circle_at_center,oklch(0.66_0.17_250/0.08),transparent_70%)]" />

			{/* Precision technical grid with smooth edge fade */}
			<div
				className="absolute inset-0 opacity-40 dark:opacity-25"
				style={{
					backgroundImage: `linear-gradient(to right, var(--line) 1px, transparent 1px), linear-gradient(to bottom, var(--line) 1px, transparent 1px)`,
					backgroundSize: "48px 48px",
					maskImage: "radial-gradient(ellipse 90% 80% at 50% 20%, black 40%, transparent 95%)",
					WebkitMaskImage: "radial-gradient(ellipse 90% 80% at 50% 20%, black 40%, transparent 95%)",
				}}
			/>

			{/* Interactive cursor spotlight in dark mode */}
			<div
				data-lamp
				className="absolute inset-0 bg-[radial-gradient(circle_500px_at_var(--lx,70%)_var(--ly,25%),oklch(0.66_0.17_250/0.07),transparent_70%)] opacity-0 transition-opacity duration-700 dark:opacity-100"
			/>
		</div>
	);
}
