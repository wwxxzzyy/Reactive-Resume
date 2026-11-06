/** Monochrome company logos representing where Resume Builder users have received interviews and job offers. */
export function CompanyLogos() {
	return (
		<div className="relative mx-auto max-w-6xl px-(--gutter) py-10 text-center">
			<p className="font-martian text-xs font-medium tracking-wider text-ink-3 uppercase">
				Our job seekers land interviews & offers at top global companies
			</p>
			<div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 opacity-60 grayscale transition-all duration-300 hover:opacity-85 hover:grayscale-0">
				{/* Google */}
				<div className="flex items-center gap-1.5 font-display text-lg font-semibold tracking-tight text-ink">
					<svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
						<path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
					</svg>
					<span>Google</span>
				</div>

				{/* Microsoft */}
				<div className="flex items-center gap-1.5 font-display text-lg font-semibold tracking-tight text-ink">
					<svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
						<path d="M0 0h11.377v11.377H0zM12.623 0H24v11.377H12.623zM0 12.623h11.377V24H0zM12.623 12.623H24V24H12.623z" />
					</svg>
					<span>Microsoft</span>
				</div>

				{/* Amazon */}
				<div className="flex items-center gap-1.5 font-display text-lg font-semibold tracking-tight text-ink">
					<span className="text-xl font-bold tracking-tighter italic">amazon</span>
				</div>

				{/* Meta */}
				<div className="flex items-center gap-1.5 font-display text-lg font-semibold tracking-tight text-ink">
					<svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
						<path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z" />
					</svg>
					<span>Meta</span>
				</div>

				{/* Apple */}
				<div className="flex items-center gap-1.5 font-display text-lg font-semibold tracking-tight text-ink">
					<svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
						<path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.88c.65-.79 1.09-1.89.97-2.99-.95.04-2.1.63-2.77 1.42-.59.68-1.11 1.79-.97 2.86 1.06.08 2.12-.5 2.77-1.29z" />
					</svg>
					<span>Apple</span>
				</div>

				{/* Stripe */}
				<div className="flex items-center gap-1 font-display text-xl font-bold tracking-tight text-ink">
					<span>stripe</span>
				</div>

				{/* Spotify */}
				<div className="flex items-center gap-1.5 font-display text-lg font-semibold tracking-tight text-ink">
					<svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
						<path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
					</svg>
					<span>Spotify</span>
				</div>

				{/* Airbnb */}
				<div className="flex items-center gap-1.5 font-display text-lg font-semibold tracking-tight text-ink">
					<span className="font-bold tracking-tight">airbnb</span>
				</div>
			</div>
		</div>
	);
}
