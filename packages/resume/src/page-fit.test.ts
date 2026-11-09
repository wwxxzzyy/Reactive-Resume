import type { ResumeData } from "@reactive-resume/schema/resume/data";
import { describe, expect, it } from "vite-plus/test";
import { analyzePageFit, applyOnePageAutoFit, applyTwoPageRelaxedFit, microAdjustFit } from "./page-fit";

const mockMetadata: ResumeData["metadata"] = {
	template: "azurill",
	page: {
		gapX: 18,
		gapY: 16,
		marginX: 20,
		marginY: 18,
		format: "a4",
		locale: "en-US",
		hideLinkUnderline: false,
		hideIcons: false,
		hideSectionIcons: true,
	},
	design: {
		level: { icon: "circle", type: "circle" },
		colors: { primary: "#2563EB", text: "#09090B", background: "#FFFFFF" },
	},
	typography: {
		body: { fontFamily: "Inter", fontWeights: ["400"], fontSize: 11, lineHeight: 1.55 },
		heading: { fontFamily: "Inter", fontWeights: ["600"], fontSize: 18, lineHeight: 1.4 },
	},
	notes: "",
	layout: { sidebarWidth: 35, pages: [] },
};

describe("applyOnePageAutoFit", () => {
	it("tightens margins, gaps, and body typography within safe bounds", () => {
		const tightened = applyOnePageAutoFit(mockMetadata);
		expect(tightened.page.marginX).toBeLessThanOrEqual(12);
		expect(tightened.page.marginY).toBeLessThanOrEqual(10);
		expect(tightened.page.gapY).toBeLessThanOrEqual(10);
		expect(tightened.typography.body.lineHeight).toBeLessThanOrEqual(1.35);
		expect(tightened.typography.body.fontSize).toBeLessThanOrEqual(9.5);
	});
});

describe("applyTwoPageRelaxedFit", () => {
	it("expands margins and relaxes line height for multi-page readability", () => {
		const relaxed = applyTwoPageRelaxedFit(mockMetadata);
		expect(relaxed.page.marginX).toBeGreaterThanOrEqual(16);
		expect(relaxed.typography.body.lineHeight).toBeGreaterThanOrEqual(1.5);
	});
});

describe("microAdjustFit", () => {
	it("micro-tunes vertical spacing and line height in tighten mode", () => {
		const adjusted = microAdjustFit(mockMetadata, "tighten");
		expect(adjusted.page.gapY).toBeLessThan(mockMetadata.page.gapY);
		expect(adjusted.typography.body.lineHeight).toBeLessThan(mockMetadata.typography.body.lineHeight);
	});

	it("micro-tunes vertical spacing in loosen mode", () => {
		const adjusted = microAdjustFit(mockMetadata, "loosen");
		expect(adjusted.page.gapY).toBeGreaterThan(mockMetadata.page.gapY);
	});
});

describe("analyzePageFit", () => {
	it("produces actionable recommendations and calculates lines to save", () => {
		const mockResume = {
			metadata: mockMetadata,
			sections: {
				experience: { items: [{}, {}, {}] },
				skills: { items: [{}] },
			},
		} as unknown as ResumeData;

		const analysis = analyzePageFit(mockResume);
		expect(analysis.estimatedLinesToSave).toBeGreaterThan(0);
		expect(analysis.actions.length).toBeGreaterThan(0);
		expect(analysis.optimizedMetadata.page.gapY).toBeLessThanOrEqual(10);
	});
});
