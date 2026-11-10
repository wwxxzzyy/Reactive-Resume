import { t } from "@lingui/core/macro";
import { useRef } from "react";
import { AiPricingSection } from "./ai-pricing";
import { ApplicantFeatures } from "./applicant-features";
import { LandingBackground } from "./background";
import { ClosingCta } from "./closing-cta";
import { CompanyLogos } from "./company-logos";
import { ComparisonSection } from "./comparison";
import { FaqSection } from "./faq";
import { LandingFooter } from "./footer";
import { LandingHeader, ThemeCord } from "./header";
import { Hero } from "./hero";
import { useScrollScenes } from "./scroll";
import { TemplatesShowcase } from "./templates-showcase";

/**
 * The public landing page: designed to convert applicants with recruiter-approved templates,
 * proof points, ATS optimization, side-by-side comparison, social proof, and transparent pricing (100% free).
 */
export function Homepage() {
	const root = useRef<HTMLDivElement>(null);
	useScrollScenes(root);

	return (
		<div ref={root} className="landing relative isolate overflow-x-clip bg-bg font-ui text-ink">
			<LandingBackground />
			<a
				href="#main"
				className="fixed start-4 top-2.5 z-100 -translate-y-[160%] rounded-md bg-ink px-3.5 py-2.5 font-ui text-sm font-semibold text-bg transition-transform focus:translate-y-0"
			>
				{t`Skip to content`}
			</a>
			<LandingHeader />
			<ThemeCord />
			<main id="main">
				<Hero />
				<CompanyLogos />
				<TemplatesShowcase />
				<ApplicantFeatures />
				<ComparisonSection />
				<AiPricingSection />
				<FaqSection />
				<ClosingCta />
			</main>
			<LandingFooter />
		</div>
	);
}
