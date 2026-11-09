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
	title: `Free ATS Resume Builder & AI Resume Maker (PDF & Word) | ${appName}`,
	description:
		"Create professional, recruiter-approved resumes that beat ATS screeners. 12 free ATS templates, live keyword scoring, AI tailoring, and instant vector PDF & DOCX downloads.",
});

/** The ATS checker's title and description in the active locale. The prerendered page and the route share them. */
export const getAtsCheckerMeta = () => ({
	title: `${t`Free ATS Resume Checker & Scanner (Online Score)`} | ${appName}`,
	description: t`Scan your resume PDF against ATS algorithms for free. Test readability, keyword match & formatting instantly in your browser with zero data uploads.`,
});

export const getTemplatesMeta = () => ({
	title: `${t`12 Best Free ATS Resume Templates (Word & PDF Download)`} | ${appName}`,
	description: t`Browse 12 recruiter-approved ATS resume templates. Download free vector PDF & Word DOCX examples, compare layouts, and customize in the builder.`,
});

/** Shared app and saved-document tab title. Marketing pages keep their own search titles. */
export const getPageTitle = (label: string) => `${label} | ${appName}`;
