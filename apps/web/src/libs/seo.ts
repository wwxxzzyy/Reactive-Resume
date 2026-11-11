import { t } from "@lingui/core/macro";

/**
 * The server writes every page's canonical link, hreflang alternates, social cards and site-wide structured data into
 * the HTML it sends (apps/server/src/static/web.ts), so crawlers that never run JavaScript see them. Routes only set
 * what changes as the visitor navigates: the title, the description and, where needed, `noindex`.
 */

const appName = "DipperGo";

export const createNoindexFollowMeta = () => ({ name: "robots", content: "noindex, follow" });

const jsonLdEscapes: Record<string, string> = {
	"<": "\\u003C",
	">": "\\u003E",
	"&": "\\u0026",
	"\u2028": "\\u2028",
	"\u2029": "\\u2029",
};

/** JSON for an inline `application/ld+json` script, escaped so no string in it can close the script early. */
export const serializeJsonLd = (data: Record<string, unknown>) =>
	JSON.stringify(data).replace(/[<>&\u2028\u2029]/g, (character) => jsonLdEscapes[character] ?? character);

/** The homepage's title and description in the active locale. The prerendered page and the route share them. */
export const getHomepageMeta = () => ({
	title: `Free ATS Resume Builder (No Paywall, No Credit Card) | ${appName}`,
	description:
		"100% free open-source ATS resume builder. No paywalls, subscriptions, or credit card required. 12 ATS templates, live keyword score, AI tailoring, and free vector PDF & Word DOCX downloads.",
});

/** The ATS checker's title and description in the active locale. The prerendered page and the route share them. */
export const getAtsCheckerMeta = () => ({
	title: `${t`Free ATS Resume Checker & Scanner (No Paywall, Online Score)`} | ${appName}`,
	description: t`100% free ATS resume checker. Scan your resume PDF against recruiter algorithms directly in your browser. Zero uploads, no account or credit card needed.`,
});

export const getTemplatesMeta = () => ({
	title: `${t`12 Best Free ATS Resume Templates (Word & PDF, No Paywall)`} | ${appName}`,
	description: t`Recruiter-approved ATS resume templates. 100% free vector PDF & Word DOCX downloads with no subscription, hidden paywalls, or forced watermarks.`,
});

export const getResumeExamplesMeta = () => ({
	title: `${t`Free ATS Resume Examples & Templates by Role (2026)`} | ${appName}`,
	description: t`Recruiter-approved ATS resume examples for software engineers, product managers, data analysts, nurses, and more. Free ATS keywords, bullet points, and PDF downloads.`,
});

/** Shared app and saved-document tab title. Marketing pages keep their own search titles. */
export const getPageTitle = (label: string) => `${label} | ${appName}`;
