import { env } from "@reactive-resume/env/server";
import { publicResumeUrl } from "@reactive-resume/resume/sharing";
import { templateSchema } from "@reactive-resume/schema/templates";
import { getLocaleAlternates } from "@reactive-resume/utils/locale";

export const CONTEXT7_ASK_URL = "https://context7.com/api/v2/ask?siteKey=ask_b3fd9335a63f1b21b1a814ac";
export const CONTEXT7_ASK_DESCRIPTION = `This site has a search endpoint: ${CONTEXT7_ASK_URL}&query=<URL-encoded question>. It returns documentation that answers the question, with a source link for each part. No API key is needed. If nothing matches, it says so.`;

function appUrl() {
	return env.APP_URL.replace(/\/+$/, "");
}

function textResponse(body: string) {
	return new Response(body, {
		headers: { "Content-Type": "text/plain; charset=UTF-8" },
	});
}

export function handleRobots() {
	const baseUrl = appUrl();
	const host = new URL(baseUrl).host;
	const body = [
		"User-agent: *",
		"Allow: /",
		"Disallow: /api/rpc",
		"Disallow: /api/auth",
		"Disallow: /api/",
		"Disallow: /admin",
		"Disallow: /admin/",
		"Disallow: /dashboard",
		"Disallow: /dashboard/",
		"Disallow: /builder/",
		"Disallow: /auth/",
		"Disallow: /mcp",
		"Disallow: /.well-known",
		// A resume's PDF duplicates its web page, and each crawl would render one.
		"Disallow: /api/resumes/",
		// Discovery documents meant for agents and API directories.
		"Allow: /.well-known/integrations.json",
		"Allow: /.well-known/api-catalog",
		"Allow: /.well-known/mcp/server-card.json",
		"Allow: /.well-known/agent-skills/",
		"",
		`Sitemap: ${baseUrl}/sitemap.xml`,
		`Host: ${host}`,
		"",
	].join("\n");

	return textResponse(body);
}

// The marketing pages; resumes whose owners opted in are listed on the sitemap's other pages.
const sitemapPaths = ["/", "/ats-checker", "/resume-templates"];

const escapeXml = (value: string) =>
	value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

/** An XML document: the prologue, then `lines` inside the `<root …>` element. */
const xmlResponse = (root: string, lines: string[]) =>
	new Response(
		['<?xml version="1.0" encoding="UTF-8"?>', `<${root}>`, ...lines, `</${root.split(" ", 1)[0]}>`, ""].join("\n"),
		{
			headers: { "Content-Type": "application/xml; charset=UTF-8", "Cache-Control": "public, max-age=3600" },
		},
	);

/** The sitemap index: the marketing pages, then resumes listed in search engines, 50,000 to a page. */
export async function handleSitemap() {
	const baseUrl = appUrl();
	const { countIndexableResumes, SITEMAP_PAGE_SIZE } = await import("@reactive-resume/api/features/resume/web-page");
	const pages = Math.ceil((await countIndexableResumes().catch(() => 0)) / SITEMAP_PAGE_SIZE);
	const sitemaps = [
		`${baseUrl}/sitemaps/pages.xml`,
		...Array.from({ length: pages }, (_, page) => `${baseUrl}/sitemaps/resumes-${page + 1}.xml`),
	];
	return xmlResponse(
		'sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
		sitemaps.map((loc) => `  <sitemap><loc>${escapeXml(loc)}</loc></sitemap>`),
	);
}

export function handlePagesSitemap() {
	const baseUrl = appUrl();
	const urls = sitemapPaths.flatMap((path) => {
		const pageUrl = `${baseUrl}${path}`;
		const languages = getLocaleAlternates(pageUrl);
		const alternates = languages.map(
			({ hreflang, href }) => `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${escapeXml(href)}"/>`,
		);
		const priority = path === "/" ? "1.0" : "0.9";
		const changefreq = "weekly";
		// x-default shares the English URL; each canonical URL appears once with the same alternate set.
		return [...new Set(languages.map(({ href }) => href))].map((href) =>
			[
				"  <url>",
				`    <loc>${escapeXml(href)}</loc>`,
				`    <changefreq>${changefreq}</changefreq>`,
				`    <priority>${priority}</priority>`,
				...alternates,
				"  </url>",
			].join("\n"),
		);
	});
	return xmlResponse(
		'urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml"',
		urls,
	);
}

/** `/sitemaps/resumes-<n>.xml`: one page of resumes listed in search engines. */
export async function handleResumesSitemap(page: number) {
	const baseUrl = appUrl();
	const { listIndexableResumes } = await import("@reactive-resume/api/features/resume/web-page");
	const resumes = Number.isInteger(page) && page >= 1 ? await listIndexableResumes(page - 1) : [];
	if (resumes.length === 0) return new Response("Not Found", { status: 404 });
	return xmlResponse(
		'urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
		resumes.map(
			(resume) =>
				// A primary resume's address is /<username>, as its page's canonical says.
				`  <url><loc>${escapeXml(publicResumeUrl(baseUrl, resume))}</loc><lastmod>${resume.updatedAt.toISOString()}</lastmod></url>`,
		),
	);
}

export function handleLlms() {
	const baseUrl = appUrl();
	const body = [
		"# DipperGo",
		"",
		`> DipperGo is a free resume builder. Write a resume in an editor beside a live page, pick one of ${templateSchema.options.length} templates, check that applicant tracking systems can read it, tailor it to a job posting, and share it at a public link or download it. No ads, no tracking, no paywalls.`,
		"",
		"## Search",
		"",
		CONTEXT7_ASK_DESCRIPTION,
		"",
		"## Product",
		"",
		`- [Homepage](${baseUrl}/): what DipperGo does, with answers to common questions.`,
		`- [Resume templates](${baseUrl}/resume-templates): browse all ${templateSchema.options.length} free templates, compare layouts and download sample PDFs.`,
		`- [ATS checker](${baseUrl}/ats-checker): a free tool that shows the text applicant tracking systems extract from a resume PDF and what to fix. It runs in the browser; the file is never uploaded.`,
		`- [Get started](${baseUrl}/dashboard): create an account and a first resume.`,
		"",
		"## Facts",
		"",
		"- Price: 100% free, every feature. No ads, no subscriptions, no paywalls.",
		"- Export: PDF, Word (DOCX), Markdown and JSON.",
		"- Import: PDF, LinkedIn data export, JSON Resume, Resume Builder JSON; Word files with an AI provider.",
		"- Sharing: private by default; a public link or a password-protected link, changeable at any time.",
		"- AI: optional, with the user's own API key (OpenAI, Anthropic, Google Gemini, OpenRouter, Ollama and others). Nothing is sent to an AI service without one.",
		"- Also includes: cover letters, a job application tracker, version history, passkeys and two-factor authentication.",
		"- Languages: the interface is translated into more than 50 languages.",
		"- Templates: 18+ recruiter-approved, ATS-optimized layouts.",
		"",
	].join("\n");

	return textResponse(body);
}
