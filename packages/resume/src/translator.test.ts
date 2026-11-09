import type { ResumeData } from "@reactive-resume/schema/resume/data";
import { describe, expect, it } from "vite-plus/test";
import {
	SECTION_TRANSLATIONS,
	SUPPORTED_TRANSLATION_LANGUAGES,
	isProtectedKeyword,
	translateResumeSections,
} from "./translator";

const mockResume: ResumeData = {
	basics: { name: "Alex Morgan" } as ResumeData["basics"],
	sections: {
		experience: { title: "Work Experience", columns: 1, hidden: false, items: [] },
		education: { title: "Education", columns: 1, hidden: false, items: [] },
		skills: { title: "Skills", columns: 1, hidden: false, items: [] },
		projects: { title: "Projects", columns: 1, hidden: false, items: [] },
		certifications: { title: "Certifications", columns: 1, hidden: false, items: [] },
		volunteer: { title: "Volunteer", columns: 1, hidden: false, items: [] },
		interests: { title: "Interests", columns: 1, hidden: false, items: [] },
		awards: { title: "Awards", columns: 1, hidden: false, items: [] },
		languages: { title: "Languages", columns: 1, hidden: false, items: [] },
		publications: { title: "Publications", columns: 1, hidden: false, items: [] },
		references: { title: "References", columns: 1, hidden: false, items: [] },
		custom: {},
	},
	metadata: {
		page: { locale: "en-US" },
	} as ResumeData["metadata"],
};

describe("translateResumeSections", () => {
	it("exposes supported languages and translations", () => {
		expect(SUPPORTED_TRANSLATION_LANGUAGES.length).toBeGreaterThan(0);
		expect(SECTION_TRANSLATIONS.experience.es).toBe("Experiencia Laboral");
	});

	it("translates section titles to Spanish and updates page locale", () => {
		const translated = translateResumeSections(mockResume, "es");
		expect(translated.sections.experience.title).toBe("Experiencia Laboral");
		expect(translated.sections.education.title).toBe("Educación");
		expect(translated.sections.skills.title).toBe("Habilidades");
		expect(translated.metadata.page.locale).toBe("es-ES");
	});

	it("translates section titles to German and updates page locale", () => {
		const translated = translateResumeSections(mockResume, "de");
		expect(translated.sections.experience.title).toBe("Berufserfahrung");
		expect(translated.sections.education.title).toBe("Ausbildung");
		expect(translated.metadata.page.locale).toBe("de-DE");
	});

	it("translates section titles to Japanese and updates page locale", () => {
		const translated = translateResumeSections(mockResume, "ja");
		expect(translated.sections.experience.title).toBe("職歴");
		expect(translated.sections.skills.title).toBe("スキル");
		expect(translated.metadata.page.locale).toBe("ja-JP");
	});
});

describe("isProtectedKeyword", () => {
	it("protects technical keywords and frameworks from translation", () => {
		expect(isProtectedKeyword("TypeScript")).toBe(true);
		expect(isProtectedKeyword("Kubernetes")).toBe(true);
		expect(isProtectedKeyword("Docker")).toBe(true);
		expect(isProtectedKeyword("Marketing")).toBe(false);
	});
});
