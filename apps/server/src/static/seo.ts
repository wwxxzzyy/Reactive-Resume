import { env } from "@reactive-resume/env/server";
import { publicResumeUrl } from "@reactive-resume/resume/sharing";
import { primaryTemplates, templateSchema } from "@reactive-resume/schema/templates";
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

function formatTemplateTitle(id: string): string {
	return id
		.split("-")
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(" ");
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
const sitemapPaths = ["/", "/ats-checker", "/resume-templates", "/resume-examples"];

const pageImages: Record<string, { loc: string; title: string }[]> = {
	"/": [{ loc: "/opengraph/banner.jpg", title: "DipperGo - Free ATS Resume Builder & AI Resume Maker" }],
	"/ats-checker": [{ loc: "/opengraph/ats-checker.png", title: "Free ATS Resume Checker & Scanner" }],
	"/resume-examples": [{ loc: "/opengraph/banner.jpg", title: "Free ATS Resume Examples by Job Role" }],
	"/resume-templates": [
		{ loc: "/opengraph/banner.jpg", title: "12 Best Free ATS Resume Templates" },
		...primaryTemplates.map((id) => ({
			loc: `/templates/thumb/${id}.webp`,
			title: `${formatTemplateTitle(id)} ATS Resume Template (Word & PDF Download)`,
		})),
	],
};

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
	const today = new Date().toISOString().split("T")[0] ?? "2026-11-10";
	const urls = sitemapPaths.flatMap((path) => {
		const pageUrl = `${baseUrl}${path}`;
		const languages = getLocaleAlternates(pageUrl);
		const alternates = languages.map(
			({ hreflang, href }) => `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${escapeXml(href)}"/>`,
		);
		const priority = path === "/" ? "1.0" : "0.9";
		const changefreq = "daily";
		const images = pageImages[path] ?? [];
		const imageXml = images.flatMap((image) => [
			"    <image:image>",
			`      <image:loc>${escapeXml(`${baseUrl}${image.loc}`)}</image:loc>`,
			`      <image:title>${escapeXml(image.title)}</image:title>`,
			"    </image:image>",
		]);
		// x-default shares the English URL; each canonical URL appears once with the same alternate set.
		return [...new Set(languages.map(({ href }) => href))].map((href) =>
			[
				"  <url>",
				`    <loc>${escapeXml(href)}</loc>`,
				`    <lastmod>${today}</lastmod>`,
				`    <changefreq>${changefreq}</changefreq>`,
				`    <priority>${priority}</priority>`,
				...imageXml,
				...alternates,
				"  </url>",
			].join("\n"),
		);
	});
	return xmlResponse(
		'urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"',
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
		`> DipperGo is a free ATS-friendly resume builder and career platform. Write a resume in an editor beside a live page preview, pick one of ${templateSchema.options.length} recruiter-approved templates, scan your resume with a browser-based ATS checker, tailor bullet points to job descriptions with AI, and download instant vector PDF & Word DOCX files. 100% free with no watermarks or paywalled downloads.`,
		"",
		"## Search",
		"",
		CONTEXT7_ASK_DESCRIPTION,
		"",
		"## Product",
		"",
		`- [Homepage](${baseUrl}/): what DipperGo does, feature highlights, and answers to common questions.`,
		`- [Resume templates](${baseUrl}/resume-templates): browse all ${templateSchema.options.length} recruiter-approved ATS templates, compare single and dual-column layouts, and download sample PDFs.`,
		`- [Resume examples](${baseUrl}/resume-examples): recruiter-approved resume examples and ATS keyword guides for software engineers, product managers, data analysts, nurses, and more.`,
		`- [ATS checker](${baseUrl}/ats-checker): a free, private browser-based tool that scans resume PDFs against ATS extraction algorithms. Zero uploads; your file never leaves your computer.`,
		`- [Get started](${baseUrl}/dashboard): create an account and build your first resume in minutes.`,
		"",
		"## Facts",
		"",
		"- Price: 100% free core features. All 12 templates, vector PDF downloads, Word DOCX exports, ATS scanner, cover letters, and job application tracker have zero paywalls.",
		"- Export formats: High-resolution Vector PDF (natural reading order), Microsoft Word (DOCX), Markdown, and JSON Resume.",
		"- Import sources: Existing PDF, LinkedIn data export, JSON Resume, or Reactive Resume JSON.",
		"- Privacy: Resumes remain private by default. Shareable public links or password-protected links can be toggled on or off at any time.",
		"- AI assistant: Built-in server DeepSeek AI integration, plus optional BYOK support for OpenAI, Anthropic Claude, Google Gemini, Ollama, and OpenRouter.",
		"- ATS compliance: Text-based vector rendering with semantic section headings, standard font metrics, and natural flow required by Workday, Taleo, Greenhouse, and Lever.",
		"- Career platform tools: Integrated job application tracker, cover letter builder, interview preparation notes, and offer calculator.",
		"",
		"## Comparison: DipperGo vs. Paid Resume Builders",
		"",
		"| Feature | DipperGo | Zety | Resume.io | Novoresume |",
		"|---|---|---|---|---|",
		"| Free PDF Download | Unlimited Vector PDF | Requires subscription ($2.70 - $24.99) | 1 plain text download only | 1-page only |",
		"| Word (DOCX) Export | Included Free | Paid tier only | Paid tier only | Not available |",
		"| ATS Readability Checker | Included Free (client-side) | Paywalled | Not available | Paywalled |",
		"| Recruiter ATS Templates | 12 Included | Included (Paid) | Included (Paid) | Included (Limited) |",
		"| Forced Watermarks | Never | None on paid | None on paid | Yes on free |",
		"| Job Application Tracker | Included Free | Not included | Basic | Not included |",
		"",
	].join("\n");

	return textResponse(body);
}
