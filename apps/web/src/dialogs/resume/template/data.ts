import type { PrimaryTemplate, Template } from "@reactive-resume/schema/templates";

export type TemplateMetadata = {
	name: string;
	description: string;
	imageUrl: string;
	tags: string[];
};

export const primaryTemplateData: Record<PrimaryTemplate, TemplateMetadata> = {
	harvard: {
		name: "Harvard Classic",
		description:
			"Timeless Ivy League standard. Centered letterhead, crisp thin divider lines, compact serif typography, and maximum content density. Engineered for 100% ATS readability.",
		imageUrl: "/templates/jpg/harvard.jpg",
		tags: ["Single-column", "ATS friendly", "Executive", "Ivy League", "Finance", "Law", "Corporate"],
	},
	silicon: {
		name: "Silicon Tech Lead",
		description:
			"Modern software engineering and developer layout. Compact left-aligned header, technical skill chips, prominent GitHub/portfolio links, and metric-focused impact bullets.",
		imageUrl: "/templates/jpg/silicon.jpg",
		tags: ["Single-column", "ATS friendly", "Tech", "Software Engineer", "DevOps", "Data Science"],
	},
	mckinsey: {
		name: "McKinsey Consultant",
		description:
			"Management and strategy consulting benchmark. Uppercase ruled section headings, structured bullet points emphasizing quantified business ROI, margin growth, and cross-functional leadership.",
		imageUrl: "/templates/jpg/mckinsey.jpg",
		tags: ["Single-column", "ATS friendly", "Consulting", "Strategy", "Operations", "Management"],
	},
	stanford: {
		name: "Stanford Executive",
		description:
			"Executive leadership and C-Suite format. Polished letterhead with executive summary callout, 3-column core competencies matrix, and reverse-chronological achievements.",
		imageUrl: "/templates/jpg/stanford.jpg",
		tags: ["Single-column", "ATS friendly", "Executive", "Director", "VP", "Leadership", "C-Suite"],
	},
	"wall-street": {
		name: "Wall Street Finance",
		description:
			"Investment banking and private equity layout. Ultra-compact line height, traditional serif typography, and structured transaction and deal highlights.",
		imageUrl: "/templates/jpg/wall-street.jpg",
		tags: ["Single-column", "ATS friendly", "Finance", "Investment Banking", "Private Equity", "Accounting"],
	},
	"jake-ats": {
		name: "Jake's ATS Standard",
		description:
			"The gold-standard single-column layout popularized by top tech recruiters and r/resumes. Zero parser ambiguity, clean ruled headers, bold role titles, and right-aligned dates.",
		imageUrl: "/templates/jpg/jake-ats.jpg",
		tags: ["Single-column", "100% ATS Safe", "Tech Favorite", "High Conversion", "Corporate", "Recruiter Approved"],
	},
	"linear-mono": {
		name: "Linear Modern Tech",
		description:
			"Ultra-sleek tech layout inspired by modern product design tools. Crisp left-aligned header, subtle hairline section dividers, and high-density technical hierarchy.",
		imageUrl: "/templates/jpg/linear-mono.jpg",
		tags: ["Single-column", "ATS friendly", "Modern", "Developer", "SaaS", "Clean Grid"],
	},
	"modern-split": {
		name: "Modern Split",
		description:
			"Two-column format with a tinted sidebar for contact details, skills, certifications, and education, leaving the main canvas open for deep experience bullets.",
		imageUrl: "/templates/jpg/modern-split.jpg",
		tags: ["Two-column", "Modern", "Skills Sidebar", "Tech", "Product"],
	},
	"tokyo-compact": {
		name: "Tokyo Compact",
		description:
			"High-density single-page format with ruled headings and compact spacing, designed to fit extensive career history onto a single page cleanly.",
		imageUrl: "/templates/jpg/tokyo-compact.jpg",
		tags: ["Single-column", "ATS friendly", "Compact", "High Density", "One-Page"],
	},
	"corporate-split": {
		name: "Corporate Split",
		description:
			"Executive two-column layout with a light gray right sidebar for credentials and competencies, balanced by an expansive work history column.",
		imageUrl: "/templates/jpg/corporate-split.jpg",
		tags: ["Two-column", "Corporate", "Right Sidebar", "Management", "Operations"],
	},
	"cambridge-cv": {
		name: "Cambridge Academic CV",
		description:
			"Comprehensive academic and research CV layout. Structured for peer-reviewed publications, grants, conference presentations, teaching appointments, and fellowships.",
		imageUrl: "/templates/jpg/cambridge-cv.jpg",
		tags: ["Single-column", "ATS friendly", "Academic", "Research", "PhD", "Publications", "Healthcare"],
	},
	"creative-studio": {
		name: "Creative Studio",
		description:
			"Distinctive typography pairing with subtle accent colors, portfolio links, and creative toolkit showcases. Tailored for UX/UI designers, art directors, and brand strategists.",
		imageUrl: "/templates/jpg/creative-studio.jpg",
		tags: ["Two-column", "Creative", "Design", "UX/UI", "Marketing", "Portfolio"],
	},
};

export const templates: Record<Template, TemplateMetadata> = {
	...primaryTemplateData,

	// Legacy aliases mapping to modern primary templates
	articuno: primaryTemplateData.harvard,
	azurill: primaryTemplateData["modern-split"],
	bronzor: primaryTemplateData["linear-mono"],
	chikorita: primaryTemplateData["corporate-split"],
	ditgar: primaryTemplateData["modern-split"],
	ditto: primaryTemplateData["modern-split"],
	eevee: primaryTemplateData.silicon,
	gengar: primaryTemplateData.mckinsey,
	glalie: primaryTemplateData.harvard,
	kakuna: primaryTemplateData["jake-ats"],
	lapras: primaryTemplateData.stanford,
	leafish: primaryTemplateData["corporate-split"],
	meowth: primaryTemplateData["tokyo-compact"],
	onyx: primaryTemplateData.silicon,
	persian: primaryTemplateData["wall-street"],
	pikachu: primaryTemplateData["creative-studio"],
	porygon: primaryTemplateData["linear-mono"],
	rhyhorn: primaryTemplateData["jake-ats"],
	scizor: primaryTemplateData.mckinsey,
	smeargle: primaryTemplateData.harvard,
	snorlax: primaryTemplateData["cambridge-cv"],

	"mit-engineer": primaryTemplateData.silicon,
	nordic: primaryTemplateData["linear-mono"],
	"tech-split": primaryTemplateData["modern-split"],
	"swiss-grid": primaryTemplateData["linear-mono"],
	"minimal-split": primaryTemplateData["modern-split"],
	"product-manager": primaryTemplateData["linear-mono"],
	"clinical-health": primaryTemplateData["corporate-split"],
	"editorial-serif": primaryTemplateData["cambridge-cv"],
	"entry-launch": primaryTemplateData["jake-ats"],
	"legal-understated": primaryTemplateData.harvard,
	"business-analyst": primaryTemplateData.mckinsey,
};
