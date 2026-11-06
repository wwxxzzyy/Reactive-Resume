import z from "zod";

export const primaryTemplates = [
	"harvard",
	"silicon",
	"mckinsey",
	"stanford",
	"wall-street",
	"jake-ats",
	"linear-mono",
	"modern-split",
	"tokyo-compact",
	"corporate-split",
	"cambridge-cv",
	"creative-studio",
] as const;

export type PrimaryTemplate = (typeof primaryTemplates)[number];

export const legacyTemplates = [
	// Original Pokemon names
	"articuno",
	"azurill",
	"bronzor",
	"chikorita",
	"ditgar",
	"ditto",
	"eevee",
	"gengar",
	"glalie",
	"kakuna",
	"lapras",
	"leafish",
	"meowth",
	"onyx",
	"persian",
	"pikachu",
	"porygon",
	"rhyhorn",
	"scizor",
	"smeargle",
	"snorlax",

	// Previous primary aliases
	"mit-engineer",
	"nordic",
	"tech-split",
	"swiss-grid",
	"minimal-split",
	"product-manager",
	"clinical-health",
	"editorial-serif",
	"entry-launch",
	"legal-understated",
	"business-analyst",
] as const;

export type LegacyTemplate = (typeof legacyTemplates)[number];

export const legacyTemplateAliasMap: Record<LegacyTemplate, PrimaryTemplate> = {
	// Original Pokemon names
	articuno: "harvard",
	azurill: "modern-split",
	bronzor: "linear-mono",
	chikorita: "corporate-split",
	ditgar: "modern-split",
	ditto: "modern-split",
	eevee: "silicon",
	gengar: "mckinsey",
	glalie: "harvard",
	kakuna: "jake-ats",
	lapras: "stanford",
	leafish: "corporate-split",
	meowth: "tokyo-compact",
	onyx: "silicon",
	persian: "wall-street",
	pikachu: "creative-studio",
	porygon: "linear-mono",
	rhyhorn: "jake-ats",
	scizor: "mckinsey",
	smeargle: "harvard",
	snorlax: "cambridge-cv",

	// Previous primary aliases
	"mit-engineer": "silicon",
	nordic: "linear-mono",
	"tech-split": "modern-split",
	"swiss-grid": "linear-mono",
	"minimal-split": "modern-split",
	"product-manager": "linear-mono",
	"clinical-health": "corporate-split",
	"editorial-serif": "cambridge-cv",
	"entry-launch": "jake-ats",
	"legal-understated": "harvard",
	"business-analyst": "mckinsey",
};

export const normalizeTemplate = (template: string): PrimaryTemplate => {
	if ((primaryTemplates as readonly string[]).indexOf(template) !== -1) {
		return template as PrimaryTemplate;
	}
	if (template in legacyTemplateAliasMap) {
		return legacyTemplateAliasMap[template as LegacyTemplate];
	}
	return "harvard";
};

export const templateSchema = z.enum([...primaryTemplates, ...legacyTemplates]);

export type Template = z.infer<typeof templateSchema>;

/** How a template lays out the page. The single source for the gallery filters, the Check layout rule and DOCX. */
export type TemplateLayout = {
	/** Two-column templates print the sidebar as a column of its own; one-column templates read top to bottom. */
	columns: 1 | 2;
	/** Where the sidebar column sits by default. Null for one-column templates. */
	sidebarSide: "left" | "right" | null;
	/** Where the header sits: across the page, over the main column only, or in the sidebar. */
	headerPlacement: "full-width" | "main-only" | "sidebar-only";
	/** One reading order and plain text headings, which applicant tracking systems read cleanly. */
	atsSafe: boolean;
};

const oneColumn: TemplateLayout = { columns: 1, sidebarSide: null, headerPlacement: "full-width", atsSafe: true };

export const templateLayouts = {
	// Curated 12 Elite Templates (ATS-First)
	harvard: oneColumn,
	silicon: oneColumn,
	mckinsey: oneColumn,
	stanford: oneColumn,
	"wall-street": oneColumn,
	"jake-ats": oneColumn,
	"linear-mono": oneColumn,
	"modern-split": { columns: 2, sidebarSide: "left", headerPlacement: "full-width", atsSafe: false },
	"tokyo-compact": oneColumn,
	"corporate-split": { columns: 2, sidebarSide: "right", headerPlacement: "main-only", atsSafe: false },
	"cambridge-cv": oneColumn,
	"creative-studio": { columns: 2, sidebarSide: "left", headerPlacement: "main-only", atsSafe: false },

	// Legacy & Aliased Templates
	articuno: oneColumn,
	azurill: { columns: 2, sidebarSide: "left", headerPlacement: "full-width", atsSafe: false },
	bronzor: oneColumn,
	chikorita: { columns: 2, sidebarSide: "right", headerPlacement: "main-only", atsSafe: false },
	ditgar: { columns: 2, sidebarSide: "left", headerPlacement: "sidebar-only", atsSafe: false },
	ditto: { columns: 2, sidebarSide: "left", headerPlacement: "full-width", atsSafe: false },
	eevee: oneColumn,
	gengar: { columns: 2, sidebarSide: "left", headerPlacement: "sidebar-only", atsSafe: false },
	glalie: { columns: 2, sidebarSide: "left", headerPlacement: "sidebar-only", atsSafe: false },
	kakuna: oneColumn,
	lapras: oneColumn,
	leafish: { columns: 2, sidebarSide: "right", headerPlacement: "full-width", atsSafe: false },
	meowth: oneColumn,
	onyx: oneColumn,
	persian: oneColumn,
	pikachu: { columns: 2, sidebarSide: "left", headerPlacement: "main-only", atsSafe: false },
	porygon: oneColumn,
	rhyhorn: oneColumn,
	scizor: oneColumn,
	smeargle: oneColumn,
	snorlax: oneColumn,
	"mit-engineer": oneColumn,
	nordic: oneColumn,
	"tech-split": { columns: 2, sidebarSide: "left", headerPlacement: "sidebar-only", atsSafe: false },
	"swiss-grid": oneColumn,
	"minimal-split": { columns: 2, sidebarSide: "left", headerPlacement: "full-width", atsSafe: false },
	"product-manager": oneColumn,
	"clinical-health": { columns: 2, sidebarSide: "right", headerPlacement: "full-width", atsSafe: false },
	"editorial-serif": oneColumn,
	"entry-launch": oneColumn,
	"legal-understated": { columns: 2, sidebarSide: "left", headerPlacement: "sidebar-only", atsSafe: false },
	"business-analyst": { columns: 2, sidebarSide: "left", headerPlacement: "sidebar-only", atsSafe: false },
} as const satisfies Record<Template, TemplateLayout>;
