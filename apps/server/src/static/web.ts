import type { Locale } from "@reactive-resume/utils/locale";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { serveStatic } from "@hono/node-server/serve-static";
import { env } from "@reactive-resume/env/server";
import { jsonLdScript, socialMetaTags } from "@reactive-resume/pdf/web-page-document";
import { templateSchema } from "@reactive-resume/schema/templates";
import { isAppSectionPath, RESERVED_SEGMENTS } from "@reactive-resume/utils/app-paths";
import {
	defaultLocale,
	getLocaleAlternates,
	isLocale,
	localizedUrl,
	supportedLocales,
} from "@reactive-resume/utils/locale";
import { escapeHtml } from "@reactive-resume/utils/string";
import { CONTEXT7_ASK_DESCRIPTION, CONTEXT7_ASK_URL } from "./seo";

function resolveWebDistPath() {
	const candidates = [
		// Source layout: apps/server/src/static/web.ts -> apps/web/dist
		fileURLToPath(new URL("../../../web/dist", import.meta.url)),
		// Bundled layout: apps/server/dist/index.mjs -> apps/web/dist
		fileURLToPath(new URL("../../web/dist", import.meta.url)),
	];
	const [fallback] = candidates;
	if (!fallback) throw new Error("Could not resolve web dist path");

	return candidates.find((candidate) => existsSync(candidate)) ?? fallback;
}

const staticRoot = resolveWebDistPath();
const indexHtmlPath = `${staticRoot}/index.html`;
// The marketing pages prerendered per locale by the web build (apps/web/vite.config.ts), as <page>/<locale>.html, kept
// beside dist/ so they're never served at an address of their own.
const prerenderRoot = `${staticRoot}-prerender`;
/**
 * Marketing pages the SPA owns that search engines should index.
 *
 * Without an entry here the fallback below returns 404 for the path in production — the dev Vite
 * server serves the shell for anything, so this failure only ever shows up once deployed.
 */
const indexableAppPaths = new Set(["/ats-checker", "/resume-templates"]);
const reservedPublicResumeSegments = new Set<string>(RESERVED_SEGMENTS);

function isAssetPath(pathname: string): boolean {
	return pathname.split("/").pop()?.includes(".") ?? false;
}

function getPathSegments(pathname: string) {
	return pathname.split("/").filter(Boolean);
}

export function isPublicResumePath(pathname: string): boolean {
	const segments = getPathSegments(pathname);
	const [firstSegment] = segments;

	return segments.length === 2 && firstSegment !== undefined && !reservedPublicResumeSegments.has(firstSegment);
}

// Single-segment addresses the app or the server answer themselves, so they can never be a username's page.
const reservedProfileSegments = new Set([...reservedPublicResumeSegments, "cards", "sitemaps", "index.html"]);

/** `/<username>`: an account's primary resume. */
export function isProfilePath(pathname: string): boolean {
	const segments = getPathSegments(pathname);
	const [segment] = segments;
	return segments.length === 1 && segment !== undefined && !reservedProfileSegments.has(segment);
}

/**
 * Scripts run only from the app's own files and the inline scripts of the page served, allowed by hash; `wasm-unsafe-eval`
 * lets the PDF engine (Forme, WebAssembly) start. Pictures, avatars and fonts can live on any https host (a resume's
 * picture URL, a sign-in provider's avatar) and the PDF engine fetches them, so images, fonts and connections stay open
 * to https. Recordings, previews and workers use blob: URLs. Cloudflare Web Analytics, when turned on for the zone, injects
 * its real-user metrics beacon from static.cloudflareinsights.com.
 */
export function contentSecurityPolicy(html = "") {
	const inlineScripts = html.matchAll(
		/<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g,
	);
	const hashes = [...inlineScripts].map(
		([, body]) =>
			`'sha256-${createHash("sha256")
				.update(body ?? "")
				.digest("base64")}'`,
	);
	const directives = [
		"default-src 'self'",
		["script-src 'self' 'wasm-unsafe-eval' https://static.cloudflareinsights.com", ...hashes].join(" "),
		"style-src 'self' 'unsafe-inline'",
		"img-src 'self' data: blob: https:",
		"font-src 'self' data: https:",
		"connect-src 'self' data: blob: https:",
		"media-src 'self' data: blob:",
		"worker-src 'self' blob:",
		"frame-src 'self' blob:",
		"frame-ancestors 'none'",
		"base-uri 'self'",
		// Print and template previews show a PDF from a blob: URL, which Chromium's viewer loads as a plugin.
		"object-src blob:",
	];

	if (env.APP_URL.startsWith("https://")) {
		directives.push("upgrade-insecure-requests");
	}

	return directives.join("; ");
}

export const BASE_SECURITY_HEADERS = {
	Link: `<${CONTEXT7_ASK_URL}>; rel="search"; type="text/plain"; title="Search DipperGo"`,
	"X-Frame-Options": "DENY",
	"X-Content-Type-Options": "nosniff",
	"Referrer-Policy": "strict-origin-when-cross-origin",
	"Permissions-Policy": "camera=(), microphone=(self), geolocation=(), payment=(), usb=(), screen-wake-lock=()",
	"Cross-Origin-Opener-Policy": "same-origin-allow-popups",
	"Cross-Origin-Resource-Policy": "same-origin",
	"X-Permitted-Cross-Domain-Policies": "none",
	"Content-Security-Policy": contentSecurityPolicy(),
};

/**
 * Preload links for the stylesheet and fonts a page's <head> loads. Cloudflare sends them ahead of the page as 103 Early
 * Hints, so they download while the origin is still answering.
 */
function preloadLinks(html: string) {
	const end = html.indexOf("</head>");
	const head = end === -1 ? html : html.slice(0, end);
	return [...head.matchAll(/<link\b[^>]*>/g)].flatMap(([tag]) => {
		const href = tag.match(/\bhref="(\/assets\/[^"]+)"/)?.[1];
		// The preload must share the tag's CORS mode, or the browser downloads the file twice.
		const cors = /\scrossorigin\b/.test(tag) ? "; crossorigin" : "";
		if (href && /\brel="stylesheet"/.test(tag)) return [`<${href}>; rel=preload; as=style${cors}`];
		if (href && /\brel="preload"/.test(tag) && /\bas="font"/.test(tag))
			return [`<${href}>; rel=preload; as=font${cors}`];
		return [];
	});
}

/**
 * An HTML page whose policy allows exactly the inline scripts of its template. Hashes come from the template before
 * any resume-derived markup goes in, so text that slipped past escaping could never allow itself.
 */
function htmlResponse(html: string, headers: Record<string, string>, template = html) {
	const baseUrl = env.APP_URL.replace(/\/+$/, "");
	const verification = new URL(CONTEXT7_ASK_URL).searchParams.get("siteKey") ?? "";
	const note = `<blockquote data-context7-ask="true" aria-hidden="true" class="sr-only"><h2>Search</h2><p>Page index: ${baseUrl}/llms.txt.</p><p>${escapeHtml(CONTEXT7_ASK_DESCRIPTION)}</p></blockquote>`;
	const body = html
		.replace("</head>", () => `<meta name="context7-site-verification" content="${verification}"></head>`)
		.replace(/<body\b[^>]*>/i, (tag) => `${tag}${note}`);
	return new Response(body, {
		headers: {
			...headers,
			Link: [headers.Link, ...preloadLinks(template)].filter(Boolean).join(", "),
			// Pages name the current build's assets, so a release purges this tag from Cloudflare's cache
			// (.github/workflows/docker-publish.yml).
			"Cache-Tag": "html",
			"Content-Security-Policy": contentSecurityPolicy(template),
		},
	});
}

// The English copy, for a build without prerendered pages; a prerendered page carries its own locale's title and
// description, and the social cards reuse them.
const ROOT_TITLE = "Free ATS Resume Builder & AI Resume Maker (PDF & Word) | DipperGo";
const ROOT_DESCRIPTION =
	"Create professional, recruiter-approved resumes that beat ATS screeners. 12 free ATS templates, live keyword scoring, AI tailoring, and instant vector PDF & Word DOCX downloads.";
const ATS_CHECKER_TITLE = "Free ATS Resume Checker & Scanner (Online Score) | DipperGo";
const ATS_CHECKER_DESCRIPTION =
	"Scan your resume PDF against ATS algorithms for free. Test readability, keyword match & formatting instantly in your browser with zero data uploads.";
const TEMPLATES_TITLE = "12 Best Free ATS Resume Templates (Word & PDF Download) | DipperGo";
const TEMPLATES_DESCRIPTION =
	"Browse 12 recruiter-approved ATS resume templates. Download free vector PDF & Word DOCX examples, compare layouts, and customize in the builder.";

type StructuredData = Record<string, unknown>;

/** Who makes DipperGo, referenced by id from every page's structured data. */
function organization(origin: string): StructuredData {
	return {
		"@type": "Organization",
		"@id": `${origin}/#organization`,
		name: "DipperGo",
		url: `${origin}/`,
		contactPoint: { "@type": "ContactPoint", contactType: "support", email: "info@dippergo.com" },
		logo: { "@type": "ImageObject", url: `${origin}/pwa-512x512.png`, width: 512, height: 512 },
		sameAs: ["https://x.com/dippergo"],
	};
}

function homepageStructuredData(origin: string): StructuredData {
	const rootUrl = `${origin}/`;
	return {
		"@context": "https://schema.org",
		"@graph": [
			organization(origin),
			{
				"@type": "WebSite",
				"@id": `${origin}/#website`,
				name: "DipperGo",
				alternateName: ["DipperGo Resume Builder", "DipperGo ATS Builder"],
				url: rootUrl,
				inLanguage: "en-US",
				publisher: { "@id": `${origin}/#organization` },
				potentialAction: {
					"@type": "SearchAction",
					target: {
						"@type": "EntryPoint",
						urlTemplate: `${origin}/resume-templates?q={search_term_string}`,
					},
					"query-input": "required name=search_term_string",
				},
			},
			{
				"@type": "BreadcrumbList",
				itemListElement: [
					{
						"@type": "ListItem",
						position: 1,
						name: "Home",
						item: rootUrl,
					},
				],
			},
			{
				"@type": ["SoftwareApplication", "WebApplication"],
				name: "DipperGo Resume Builder",
				alternateName: "DipperGo ATS Resume Maker",
				url: rootUrl,
				description: ROOT_DESCRIPTION,
				applicationCategory: "BusinessApplication",
				operatingSystem: "All modern web browsers",
				browserRequirements: "Requires HTML5 and WebAssembly support",
				isAccessibleForFree: true,
				offers: {
					"@type": "AggregateOffer",
					priceCurrency: "USD",
					lowPrice: "0",
					highPrice: "24.99",
					offerCount: "3",
					offers: [
						{
							"@type": "Offer",
							name: "Free Forever",
							price: "0",
							priceCurrency: "USD",
							description: "Complete resume builder with all 12 templates, PDF and Word downloads.",
						},
						{
							"@type": "Offer",
							name: "Monthly Pro",
							price: "9.99",
							priceCurrency: "USD",
							description: "Priority AI generation and advanced cloud synchronization.",
						},
						{
							"@type": "Offer",
							name: "Lifetime Access",
							price: "24.99",
							priceCurrency: "USD",
							description: "One-time payment for lifetime access.",
						},
					],
				},
				publisher: { "@id": `${origin}/#organization` },
				screenshot: `${origin}/opengraph/banner.jpg`,
				aggregateRating: {
					"@type": "AggregateRating",
					ratingValue: "4.9",
					ratingCount: "1480",
					bestRating: "5",
					worstRating: "1",
				},
				featureList: [
					"Live visual resume editor with instant page-break calculation",
					`${templateSchema.options.length} recruiter-approved ATS-friendly resume templates`,
					"Vector PDF export with selectable text and natural reading order",
					"Microsoft Word (DOCX) export",
					"Client-side ATS readability and keyword scoring scanner",
					"AI resume bullet tailoring with custom API keys",
					"Integrated cover letter builder and job application tracker",
					"LinkedIn profile and PDF resume importer",
					"Public and password-protected sharable resume links",
				],
			},
			{
				"@type": "HowTo",
				name: "How to Build an ATS-Friendly Resume for Free",
				description:
					"Step-by-step guide to creating a professional resume that passes applicant tracking systems using DipperGo.",
				totalTime: "PT10M",
				step: [
					{
						"@type": "HowToStep",
						position: 1,
						name: "Choose an ATS-Friendly Template",
						text: "Select one of 12 clean single-column or dual-column templates optimized for ATS parsers.",
						url: `${origin}/resume-templates`,
					},
					{
						"@type": "HowToStep",
						position: 2,
						name: "Add Experience & Keywords",
						text: "Fill in work history, education, and skills. Use industry-standard headings and measurable accomplishments.",
						url: rootUrl,
					},
					{
						"@type": "HowToStep",
						position: 3,
						name: "Scan with ATS Readability Checker",
						text: "Test your PDF with the built-in ATS checker to ensure text parsing and keyword matching pass automated screeners.",
						url: `${origin}/ats-checker`,
					},
					{
						"@type": "HowToStep",
						position: 4,
						name: "Download Vector PDF or Word DOCX",
						text: "Export high-resolution vector PDF or editable Microsoft Word DOCX formatted for recruiter submissions.",
						url: rootUrl,
					},
				],
			},
			{
				"@type": "FAQPage",
				mainEntity: [
					{
						"@type": "Question",
						name: "Is DipperGo really free?",
						acceptedAnswer: {
							"@type": "Answer",
							text: `Yes. Core features are 100% free: all ${templateSchema.options.length} templates, vector PDF and Word downloads, the ATS checker, cover letters, and the job application tracker. There are no ads or forced watermarks.`,
						},
					},
					{
						"@type": "Question",
						name: "Will my resume get past applicant tracking systems (ATS)?",
						acceptedAnswer: {
							"@type": "Answer",
							text: "Every template exports a text-based vector PDF with words in natural reading order, which applicant tracking systems require. To test any PDF, the free ATS checker inspects extracted text and formatting.",
						},
					},
					{
						"@type": "Question",
						name: "How does the ATS resume checker work?",
						acceptedAnswer: {
							"@type": "Answer",
							text: "The ATS checker runs locally in your browser. It extracts text and checks font encoding, multi-column reading order, contact info placement, and keyword density without uploading your file to any server.",
						},
					},
					{
						"@type": "Question",
						name: "What formats can I download?",
						acceptedAnswer: {
							"@type": "Answer",
							text: "Vector PDF, Microsoft Word (DOCX), Markdown, and JSON. Your resume data is never locked in.",
						},
					},
					{
						"@type": "Question",
						name: "Can I import an existing resume or LinkedIn profile?",
						acceptedAnswer: {
							"@type": "Answer",
							text: "Yes. Import a PDF, LinkedIn data export, JSON Resume, or Resume Builder export, then continue editing immediately.",
						},
					},
					{
						"@type": "Question",
						name: "Can I use AI to write or tailor my resume?",
						acceptedAnswer: {
							"@type": "Answer",
							text: "Yes. You can connect your own API key (OpenAI, Claude Anthropic, Google Gemini, Ollama, OpenRouter) or use Pro tier AI tools to tailor bullet points and generate targeted cover letters.",
						},
					},
					{
						"@type": "Question",
						name: "Who can see my resume?",
						acceptedAnswer: {
							"@type": "Answer",
							text: "Only you, until you share it. Resumes remain private by default, with options for public or password-protected links at any time.",
						},
					},
				],
			},
		],
	};
}

function atsCheckerStructuredData(origin: string): StructuredData {
	return {
		"@context": "https://schema.org",
		"@graph": [
			organization(origin),
			{
				"@type": "BreadcrumbList",
				itemListElement: [
					{
						"@type": "ListItem",
						position: 1,
						name: "Home",
						item: `${origin}/`,
					},
					{
						"@type": "ListItem",
						position: 2,
						name: "ATS Checker",
						item: `${origin}/ats-checker`,
					},
				],
			},
			{
				"@type": "WebApplication",
				name: "ATS Resume Checker & Scanner",
				alternateName: "DipperGo ATS Scanner",
				url: `${origin}/ats-checker`,
				description: ATS_CHECKER_DESCRIPTION,
				applicationCategory: "BusinessApplication",
				operatingSystem: "Web",
				isAccessibleForFree: true,
				offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
				isPartOf: { "@type": "WebSite", "@id": `${origin}/#website`, name: "DipperGo", url: `${origin}/` },
				provider: { "@id": `${origin}/#organization` },
			},
		],
	};
}

type PageSeoOptions = {
	/** The page's plain address: the canonical for the default locale, and the base of its hreflang alternates. */
	canonicalUrl: string;
	locale: Locale;
	/** A `?locale=` request is canonical for its own language. */
	requested: boolean;
	/** Already HTML-escaped, as the page's own <title> and description are. */
	title: string;
	description: string;
	imageUrl: string;
	structuredData: StructuredData;
};

function createPageSeoMarkup(options: PageSeoOptions) {
	const pageUrl = options.requested ? localizedUrl(options.canonicalUrl, options.locale) : options.canonicalUrl;
	const alternates = getLocaleAlternates(options.canonicalUrl)
		.map(({ hreflang, href }) => `<link rel="alternate" hreflang="${hreflang}" href="${escapeHtml(href)}">`)
		.join("");

	const url = escapeHtml(pageUrl);
	const googleVerification = process.env.GOOGLE_SITE_VERIFICATION
		? `<meta name="google-site-verification" content="${escapeHtml(process.env.GOOGLE_SITE_VERIFICATION)}">`
		: "";
	const bingVerification = process.env.BING_SITE_VERIFICATION
		? `<meta name="msvalidate.01" content="${escapeHtml(process.env.BING_SITE_VERIFICATION)}">`
		: "";
	return `
		<link rel="canonical" href="${url}">
		${alternates}
		${googleVerification}
		${bingVerification}
		<meta name="rating" content="general">
		<meta name="revisit-after" content="3 days">
		<meta name="distribution" content="global">
		<meta name="coverage" content="Worldwide">
		<meta name="format-detection" content="telephone=no">
		<meta name="language" content="English">
		<meta name="keywords" content="free resume builder, ATS resume builder, ATS resume checker, ATS resume scanner, AI resume maker, free CV maker online, ATS friendly resume templates, resume builder PDF download, Word DOCX resume, resume tailor, job application tracker, curriculum vitae maker, DipperGo">
		<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
		<meta property="og:locale" content="${options.locale.replace("-", "_")}">
		${socialMetaTags({ type: "website", title: options.title, description: options.description, url, image: options.imageUrl })}
		${jsonLdScript(options.structuredData)}
	`;
}

/** The title and description a page was built with, still HTML-escaped. */
function readPageMeta(html: string, fallback: { title: string; description: string }) {
	return {
		title: html.match(/<title>([^<]*)<\/title>/)?.[1] ?? fallback.title,
		description: html.match(/<meta\s+name="description"\s+content="([^"]*)"/)?.[1] ?? fallback.description,
	};
}

const mediaFile = /\.(?:avif|gif|ico|jpe?g|mp3|png|svg|ttf|webp|woff2?)$/i;

export const serveWebDistStatic = env.CLOUDFLARE
	? undefined
	: serveStatic({
			root: staticRoot,
			// The Docker build writes brotli copies beside the text files and WASM (tooling/docker/precompress.mjs).
			precompressed: true,
			onFound: (_path, context) => {
				// Vite fingerprints everything under /assets, so a file there never changes.
				if (context.req.path.startsWith("/assets/")) {
					context.header("Cache-Control", "public, max-age=31536000, immutable");
				} else {
					// Other files keep their names when their content changes, so a release purges them from Cloudflare's
					// cache by this tag. Browsers keep pictures, fonts and sounds for 30 days, the shortest lifetime Lighthouse
					// doesn't count as waste; one replaced under the same name reaches every visitor within that month.
					context.header("Cache-Tag", "public");
					if (mediaFile.test(context.req.path)) context.header("Cache-Control", "public, max-age=2592000");
				}
				// `/index.html` is the app shell too; it must not be frameable either.
				if (context.req.path.endsWith(".html"))
					for (const [name, value] of Object.entries(BASE_SECURITY_HEADERS)) context.header(name, value);
			},
		});

function getFallbackResponseHeaders(pathname: string) {
	if (pathname === "/" || indexableAppPaths.has(pathname)) {
		return { "Content-Type": "text/html; charset=UTF-8", ...BASE_SECURITY_HEADERS };
	}
	if (isAppSectionPath(pathname)) {
		return {
			"Content-Type": "text/html; charset=UTF-8",
			"X-Robots-Tag": "noindex, follow",
			...BASE_SECURITY_HEADERS,
		};
	}

	return null;
}

/**
 * A prerendered page's language: a `?locale=` address first (its hreflang alternates), then the visitor's saved
 * choice, in the order the app reads them (apps/web/src/libs/locale.ts).
 */
function getPageLocale(request: Request) {
	const requested = new URL(request.url).searchParams.get("locale");
	if (isLocale(requested))
		return { locale: supportedLocales.includes(requested) ? requested : defaultLocale, requested: true };

	const saved = request.headers.get("cookie")?.match(/(?:^|;\s*)locale=([^;]*)/)?.[1] ?? "";
	return { locale: isLocale(saved) && supportedLocales.includes(saved) ? saved : defaultLocale, requested: false };
}

/** Swaps the page's <title> and description. Function replacers keep `$&`, `$'` etc. in user text literal. */
const withMeta = (html: string, meta: { title: string; description: string }) =>
	html
		.replace(/<title>[^<]*<\/title>/, () => `<title>${meta.title}</title>`)
		.replace(/<meta\s+name="description"[^>]*>/, () => `<meta name="description" content="${meta.description}">`);

/** The indexable pages the web build prerenders, by path. */
const prerenderedPages: Record<
	string,
	{
		name: string;
		meta: { title: string; description: string };
		image: string;
		structuredData: (origin: string) => StructuredData;
	}
> = {
	"/": {
		name: "home",
		meta: { title: ROOT_TITLE, description: ROOT_DESCRIPTION },
		image: "/opengraph/banner.jpg",
		structuredData: homepageStructuredData,
	},
	"/ats-checker": {
		name: "ats-checker",
		meta: { title: ATS_CHECKER_TITLE, description: ATS_CHECKER_DESCRIPTION },
		image: "/opengraph/ats-checker.png",
		structuredData: atsCheckerStructuredData,
	},
	"/resume-templates": {
		name: "resume-templates",
		meta: { title: TEMPLATES_TITLE, description: TEMPLATES_DESCRIPTION },
		image: "/opengraph/banner.jpg",
		structuredData: (origin) => ({
			"@context": "https://schema.org",
			"@graph": [
				organization(origin),
				{
					"@type": "BreadcrumbList",
					itemListElement: [
						{
							"@type": "ListItem",
							position: 1,
							name: "Home",
							item: `${origin}/`,
						},
						{
							"@type": "ListItem",
							position: 2,
							name: "Resume Templates",
							item: `${origin}/resume-templates`,
						},
					],
				},
				{
					"@type": "CollectionPage",
					name: "12 Best Free ATS Resume Templates",
					url: `${origin}/resume-templates`,
					description: TEMPLATES_DESCRIPTION,
					isPartOf: { "@type": "WebSite", "@id": `${origin}/#website`, name: "DipperGo", url: `${origin}/` },
					mainEntity: {
						"@type": "ItemList",
						itemListElement: templateSchema.options.map((template, index) => ({
							"@type": "ListItem",
							position: index + 1,
							name: template.charAt(0).toUpperCase() + template.slice(1),
							url: `${origin}/resume-templates#${template}`,
						})),
					},
				},
			],
		}),
	},
};

export type ReadWebFile = (path: string) => Promise<string>;

export async function handleWebApp(request: Request, readFile: ReadWebFile = (path) => fs.readFile(path, "utf-8")) {
	const requestUrl = new URL(request.url);
	const requestedPath = requestUrl.pathname;
	const pathname = requestedPath === "/index.html" ? "/" : requestedPath;

	if (!isAppSectionPath(pathname) && isAssetPath(pathname)) {
		return new Response("Not Found", { status: 404 });
	}

	const headers = getFallbackResponseHeaders(pathname);
	if (!headers)
		return new Response("Not Found", {
			status: 404,
			headers: { "Content-Type": "text/plain; charset=UTF-8", "X-Robots-Tag": "noindex, nofollow" },
		});

	// Hono drops HEAD bodies itself; returning early skips reading the shell and a public resume's DB lookup.
	if (request.method === "HEAD") return new Response(null, { status: 200, headers });

	const html = await readFile(indexHtmlPath);

	const prerendered = prerenderedPages[pathname];
	if (prerendered) {
		const { locale, requested } = getPageLocale(request);
		const origin = new URL(env.APP_URL).origin;
		// Without a prerendered page (a build that skipped it), the app shell titled for the page renders it in the browser.
		const page = await readFile(`${prerenderRoot}/${prerendered.name}/${locale}.html`).catch(() =>
			withMeta(html, prerendered.meta),
		);
		const markup = createPageSeoMarkup({
			canonicalUrl: new URL(pathname, env.APP_URL).toString(),
			locale,
			requested,
			...readPageMeta(page, prerendered.meta),
			imageUrl: `${origin}${prerendered.image}`,
			structuredData: prerendered.structuredData(origin),
		});
		const body =
			pathname === "/"
				? page.replace(/href="\/\?locale=([^"#&]+)#languages"/g, (_match, language: string) => {
						const search = new URLSearchParams(requestUrl.search);
						search.set("locale", language);
						return `href="/?${escapeHtml(search.toString())}#languages"`;
					})
				: page;

		// The saved locale changes what this address shows, so caches have to key on the cookie.
		return htmlResponse(
			body.replace("</head>", () => `${markup}</head>`),
			{ ...headers, Vary: "Cookie" },
			page,
		);
	}

	return htmlResponse(html, headers);
}
